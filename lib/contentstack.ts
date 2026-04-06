import contentstack, { QueryOperation } from "@contentstack/delivery-sdk";
import { getContentstackEndpoints } from "@timbenniks/contentstack-endpoints";
import Personalize from "@contentstack/personalize-edge-sdk";

const region = process.env.CONTENTSTACK_REGION || "us";
const endpoints = getContentstackEndpoints(region, true);

// Factory: creates a new stack per request (required for live preview SSR mode
// to avoid cross-session data leakage)
export function createStack() {
  return contentstack.stack({
    apiKey: process.env.CONTENTSTACK_API_KEY!,
    deliveryToken: process.env.CONTENTSTACK_DELIVERY_TOKEN!,
    environment: process.env.CONTENTSTACK_ENVIRONMENT!,
    region,
    live_preview: {
      enable: true,
      preview_token: process.env.CONTENTSTACK_PREVIEW_TOKEN,
      host: endpoints.preview,
    },
  });
}

// Shared instance for non-preview reads (listing pages, etc.)
export const stack = createStack();

// ─── Types ───────────────────────────────────────────────────────────────────

export interface DogPhoto {
  url: string;
  alt: string;
  width: number;
  height: number;
  order: number;
}

export interface EditableTags {
  [key: string]: Record<string, string>;
}

export interface DogEntry {
  uid: string;
  title: string;
  url: string;
  slug: string;
  tagline: string;
  bio: string;
  breed: string;
  breed_secondary?: string;
  age: string;
  age_category: string;
  sex: string;
  size: string;
  weight: number;
  color: string;
  status: string;
  energy_level: string;
  adoption_fee: number;
  foster_location?: string;
  personality_traits: string[];
  good_with_dogs?: string;
  good_with_cats?: string;
  good_with_kids?: string;
  house_trained?: string;
  spayed_neutered: boolean;
  vaccinated: boolean;
  microchipped: boolean;
  special_needs?: string;
  photos: DogPhoto[];
  intake_date?: string;
  date_added: string;
  $?: EditableTags;
}

// ─── Modular block types ────────────────────────────────────────────────────

export interface HeroBlock {
  heading?: string;
  description?: string;
  image?: { url: string; title?: string; filename?: string };
  cta_text?: string;
  cta_link?: string;
  $?: EditableTags;
}

export interface BrowseByTypeBlock {
  categories: {
    title: string;
    description: string;
    icon: string;
    href: string;
    $?: EditableTags;
  }[];
  $?: EditableTags;
}

export interface HowItWorksBlock {
  steps: {
    number: number;
    title: string;
    description: string;
    icon: string;
    $?: EditableTags;
  }[];
  $?: EditableTags;
}

export interface FeaturedDogsBlock {
  heading?: string;
  limit?: number;
  $?: EditableTags;
}

export interface MissionCTABlock {
  heading?: string;
  description?: string;
  cta_text?: string;
  cta_link?: string;
  $?: EditableTags;
}

export type HomePageSection =
  | { hero: HeroBlock }
  | { browse_by_type: BrowseByTypeBlock }
  | { how_it_works: HowItWorksBlock }
  | { featured_dogs: FeaturedDogsBlock }
  | { mission_cta: MissionCTABlock };

export interface HomePageEntry {
  uid: string;
  title: string;
  sections: HomePageSection[];
  $?: EditableTags;
}

export interface LivePreviewParams {
  live_preview?: string;
  entry_uid?: string;
  content_type_uid?: string;
  personalize_variants?: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function applyLivePreview(
  stackInstance: ReturnType<typeof createStack>,
  params: LivePreviewParams,
  defaultContentType: string
) {
  if (params.live_preview) {
    stackInstance.livePreviewQuery({
      live_preview: params.live_preview,
      contentTypeUid: params.content_type_uid || defaultContentType,
      entryUid: params.entry_uid || "",
    });
  }
}

function addEditTags(
  entry: unknown,
  contentTypeUid: string,
  locale = "en-us"
) {
  if (entry) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    contentstack.Utils.addEditableTags(
      entry as any,
      contentTypeUid,
      true,
      locale
    );
  }
}

// ─── Queries ─────────────────────────────────────────────────────────────────

export async function getHomePage(
  previewParams?: LivePreviewParams
): Promise<HomePageEntry | null> {
  try {
    const s = previewParams?.live_preview ? createStack() : stack;
    applyLivePreview(s, previewParams || {}, "home_page");

    const variantParam = previewParams?.personalize_variants;

    const entries_api = s.contentType("home_page").entry();

    if (variantParam) {
      const variantAlias =
        Personalize.variantParamToVariantAliases(variantParam).join(",");
      entries_api.variants(variantAlias);
    }

    const result = await entries_api.query().find();
    const entries = result.entries ?? [];
    const entry = (entries[0] as unknown as HomePageEntry) ?? null;
    if (entry && previewParams?.live_preview) addEditTags(entry, "home_page");
    return entry;
  } catch (error) {
    console.error("Error fetching home page:", error);
    return null;
  }
}

export async function getDogs(
  filters?: {
    size?: string;
    ageCategory?: string;
    energyLevel?: string;
  },
  previewParams?: LivePreviewParams
): Promise<{ dogs: DogEntry[]; count: number }> {
  try {
    const s = previewParams?.live_preview ? createStack() : stack;
    applyLivePreview(s, previewParams || {}, "dog");

    const query = s.contentType("dog").entry().query();

    query.notEqualTo("status", "adopted");

    if (filters?.size) {
      query.where("size", QueryOperation.EQUALS, filters.size.toLowerCase());
    }
    if (filters?.ageCategory) {
      query.where("age_category", QueryOperation.EQUALS, filters.ageCategory.toLowerCase());
    }
    if (filters?.energyLevel) {
      query.where("energy_level", QueryOperation.EQUALS, filters.energyLevel.toLowerCase());
    }

    query.orderByDescending("date_added").includeCount();

    const result = await query.find();
    const entries = result.entries ?? [];
    if (previewParams?.live_preview) {
      for (const entry of entries) {
        addEditTags(entry, "dog");
      }
    }
    return {
      dogs: entries as unknown as DogEntry[],
      count:
        (result as unknown as { count: number }).count ?? entries.length,
    };
  } catch (error) {
    console.error("Error fetching dogs:", error);
    return { dogs: [], count: 0 };
  }
}

export async function getDogBySlug(
  slug: string,
  previewParams?: LivePreviewParams
): Promise<DogEntry | null> {
  try {
    const s = previewParams?.live_preview ? createStack() : stack;
    applyLivePreview(s, previewParams || {}, "dog");

    const url = `/dogs/${slug}`;
    const result = await s
      .contentType("dog")
      .entry()
      .query()
      .where("url", QueryOperation.EQUALS, url)
      .find();
    const entries = result.entries ?? [];
    const entry = (entries[0] as unknown as DogEntry) ?? null;
    if (entry && previewParams?.live_preview) addEditTags(entry, "dog");
    return entry;
  } catch (error) {
    console.error("Error fetching dog:", error);
    return null;
  }
}

export async function getFeaturedDogs(
  limit = 3,
  previewParams?: LivePreviewParams
): Promise<DogEntry[]> {
  try {
    const s = previewParams?.live_preview ? createStack() : stack;
    applyLivePreview(s, previewParams || {}, "dog");

    const result = await s
      .contentType("dog")
      .entry()
      .query()
      .where("status", QueryOperation.EQUALS, "available")
      .orderByDescending("date_added")
      .limit(limit)
      .find();
    const entries = (result.entries ?? []) as unknown as DogEntry[];
    if (previewParams?.live_preview) {
      for (const entry of entries) {
        addEditTags(entry, "dog");
      }
    }
    return entries;
  } catch (error) {
    console.error("Error fetching featured dogs:", error);
    return [];
  }
}
