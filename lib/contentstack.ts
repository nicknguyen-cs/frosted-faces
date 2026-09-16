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

export interface EditableTags {
  [key: string]: Record<string, string>;
}

export interface FaqItem {
  question: string;
  answer: string;
  $?: EditableTags;
}

// SEO / AEO / GEO field group on the `dog` content type. Every field is
// optional and editor- (or AI-agent-) populated; the frontend falls back
// gracefully when a field is blank.
export interface SeoData {
  meta_title?: string;
  meta_description?: string;
  keywords?: string[];
  canonical_url?: string;
  og_image?: string;
  no_index?: boolean;
  /** Declarative summary written for generative engines (GEO). */
  ai_summary?: string;
  /** Question/answer pairs emitted as FAQPage structured data (AEO). */
  faqs?: FaqItem[];
  $?: EditableTags;
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
  /** Ordered list of image URLs. Array order = display order. */
  images: string[];
  intake_date?: string;
  date_added: string;
  seo?: SeoData;
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
  /**
   * Editor-curated dogs, shown first in this order. Resolved to full entries
   * via includeReference("sections.featured_dogs.dogs") in getHomePage;
   * unresolved references arrive as bare { uid } objects and are ignored.
   */
  dogs?: Array<DogEntry | { uid: string; _content_type_uid?: string }>;
  /** Target number of cards. Curated dogs come first; the newest available dogs fill the rest. */
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

// ─── About Page types ───────────────────────────────────────────────────────

export interface AboutHeroBlock {
  heading?: string;
  description?: string;
  $?: EditableTags;
}

export interface TwoColumnTextBlock {
  left_heading?: string;
  left_body?: string;
  right_heading?: string;
  right_items?: string[];
  $?: EditableTags;
}

export interface StatsBarBlock {
  stats?: { value: string; label: string; $?: EditableTags }[];
  $?: EditableTags;
}

export interface ValuesGridBlock {
  heading?: string;
  values?: { title: string; description: string; $?: EditableTags }[];
  $?: EditableTags;
}

export interface CTABannerBlock {
  heading?: string;
  description?: string;
  cta_text?: string;
  cta_link?: string;
  $?: EditableTags;
}

export type AboutPageSection =
  | { hero: AboutHeroBlock }
  | { two_column_text: TwoColumnTextBlock }
  | { stats_bar: StatsBarBlock }
  | { values_grid: ValuesGridBlock }
  | { cta_banner: CTABannerBlock };

export interface AboutPageEntry {
  uid: string;
  title: string;
  sections: AboutPageSection[];
  $?: EditableTags;
}

// ─── Foster Page types ─────────────────────────────────────────────────────

export interface IntroCardsBlock {
  cards?: { icon: string; title: string; description: string; $?: EditableTags }[];
  $?: EditableTags;
}

export interface FosterJourneyBlock {
  heading?: string;
  steps?: { day_label: string; title: string; description: string; $?: EditableTags }[];
  $?: EditableTags;
}

export interface ImpactStatsBlock {
  stats?: { value: number; suffix: string; label: string; $?: EditableTags }[];
  $?: EditableTags;
}

export interface FAQBlock {
  heading?: string;
  items?: { question: string; answer: string; $?: EditableTags }[];
  $?: EditableTags;
}

export type FosterPageSection =
  | { hero: HeroBlock }
  | { intro_cards: IntroCardsBlock }
  | { foster_journey: FosterJourneyBlock }
  | { impact_stats: ImpactStatsBlock }
  | { faq: FAQBlock }
  | { cta_banner: CTABannerBlock };

export interface FosterPageEntry {
  uid: string;
  title: string;
  sections: FosterPageSection[];
  $?: EditableTags;
}

// ─── History Page types ─────────────────────────────────────────────────────

export interface OriginStoryBlock {
  heading?: string;
  body?: string;
  pull_quote?: string;
  pull_quote_attribution?: string;
  $?: EditableTags;
}

export interface TimelineBlock {
  heading?: string;
  description?: string;
  milestones?: {
    year: string;
    title: string;
    description: string;
    $?: EditableTags;
  }[];
  $?: EditableTags;
}

export interface FounderSpotlightBlock {
  eyebrow?: string;
  quote?: string;
  name?: string;
  role?: string;
  photo?: { url: string; title?: string; filename?: string };
  bio?: string;
  $?: EditableTags;
}

export interface GratitudeGridBlock {
  heading?: string;
  description?: string;
  items?: { title: string; description: string; $?: EditableTags }[];
  $?: EditableTags;
}

export type HistoryPageSection =
  | { hero: HeroBlock }
  | { origin_story: OriginStoryBlock }
  | { timeline: TimelineBlock }
  | { founder_spotlight: FounderSpotlightBlock }
  | { gratitude_grid: GratitudeGridBlock }
  | { cta_banner: CTABannerBlock };

export interface HistoryPageEntry {
  uid: string;
  title: string;
  sections: HistoryPageSection[];
  $?: EditableTags;
}

// ─── Demo Page types ───────────────────────────────────────────────────────

export interface ProcessStepsBlock {
  heading?: string;
  description?: string;
  steps?: {
    number: number;
    title: string;
    description: string;
    icon: string;
    duration?: string;
    $?: EditableTags;
  }[];
  $?: EditableTags;
}

export interface RequirementsBlock {
  heading?: string;
  description?: string;
  items?: { label: string; description?: string; $?: EditableTags }[];
  $?: EditableTags;
}

export interface AdoptionFeesBlock {
  heading?: string;
  description?: string;
  tiers?: {
    title: string;
    fee: string;
    includes?: string[];
    $?: EditableTags;
  }[];
  $?: EditableTags;
}

export type DemoPageSection =
  | { hero: HeroBlock }
  | { process_steps: ProcessStepsBlock }
  | { requirements: RequirementsBlock }
  | { adoption_fees: AdoptionFeesBlock }
  | { faq: FAQBlock }
  | { cta_banner: CTABannerBlock };

export interface DemoPageEntry {
  uid: string;
  title: string;
  sections: DemoPageSection[];
  $?: EditableTags;
}

// ─── Breed Page types ───────────────────────────────────────────────────────

export interface QuickFactsBlock {
  heading?: string;
  facts?: { label: string; value: string; icon?: string; $?: EditableTags }[];
  $?: EditableTags;
}

export interface AboutBreedBlock {
  heading?: string;
  body?: string;
  pull_quote?: string;
  pull_quote_attribution?: string;
  $?: EditableTags;
}

export interface TemperamentBlock {
  heading?: string;
  description?: string;
  traits?: { title: string; description: string; $?: EditableTags }[];
  $?: EditableTags;
}

export interface CareRequirementsBlock {
  heading?: string;
  description?: string;
  cards?: {
    icon?: string;
    title: string;
    description: string;
    $?: EditableTags;
  }[];
  $?: EditableTags;
}

export interface BreedGalleryBlock {
  heading?: string;
  photos?: {
    image?: { url: string; title?: string; filename?: string };
    image_url?: string;
    alt: string;
    $?: EditableTags;
  }[];
  $?: EditableTags;
}

export type BreedPageSection =
  | { hero: HeroBlock }
  | { quick_facts: QuickFactsBlock }
  | { about_section: AboutBreedBlock }
  | { temperament: TemperamentBlock }
  | { care_requirements: CareRequirementsBlock }
  | { gallery: BreedGalleryBlock }
  | { cta_banner: CTABannerBlock };

export interface BreedEntry {
  uid: string;
  title: string;
  slug: string;
  url: string;
  sections: BreedPageSection[];
  $?: EditableTags;
}

// ─── Blog Post types ─────────────────────────────────────────────────────────

// Structured rules the AgentOS agent uses to pick available dogs to associate
// with a post. Mirrors the `dog` filter fields; a blank field is unconstrained.
export interface DogMatchCriteria {
  age_category?: string;
  size?: string;
  energy_level?: string;
  good_with_dogs?: string;
  good_with_cats?: string;
  good_with_kids?: string;
  $?: EditableTags;
}

export interface BlogPostEntry {
  uid: string;
  title: string;
  url: string;
  slug: string;
  excerpt?: string;
  author?: string;
  hero_image?: { url: string; title?: string; filename?: string };
  published_date?: string;
  seo?: SeoData;
  /** Resolved via includeReference("associated_dogs"). AgentOS-populated. */
  associated_dogs?: DogEntry[];
  match_criteria?: DogMatchCriteria;
  /** HTML RTE article body (HTML string). */
  body?: string;
  $?: EditableTags;
}

export interface LivePreviewParams {
  live_preview?: string;
  entry_uid?: string;
  content_type_uid?: string;
  personalize_variants?: string;
  preview_timestamp?: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function applyLivePreview(
  stackInstance: ReturnType<typeof createStack>,
  params: LivePreviewParams,
  defaultContentType: string
) {
  if (params.live_preview || params.preview_timestamp) {
    stackInstance.livePreviewQuery({
      live_preview: params.live_preview || "",
      contentTypeUid: params.content_type_uid || defaultContentType,
      entryUid: params.entry_uid || "",
      preview_timestamp: params.preview_timestamp,
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
    const s = previewParams?.live_preview || previewParams?.preview_timestamp ? createStack() : stack;
    applyLivePreview(s, previewParams || {}, "home_page");

    const variantParam = previewParams?.personalize_variants;

    // Resolve the featured_dogs block's curated references in the same call.
    const entries_api = s
      .contentType("home_page")
      .entry()
      .includeReference("sections.featured_dogs.dogs");

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
    const s = previewParams?.live_preview || previewParams?.preview_timestamp ? createStack() : stack;
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
    const s = previewParams?.live_preview || previewParams?.preview_timestamp ? createStack() : stack;
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

/** Type guard: a curated reference that was resolved to a full dog entry. */
function isResolvedDog(
  d: NonNullable<FeaturedDogsBlock["dogs"]>[number]
): d is DogEntry {
  return typeof (d as DogEntry).slug === "string";
}

/**
 * Hybrid featured-dogs selection:
 *  1. Editor-curated dogs from the block (in editor order). Adopted dogs are
 *     skipped so a placed dog never lingers; pending dogs stay (with badge).
 *  2. If that leaves fewer than `limit` cards, top up with the newest
 *     available dogs not already shown.
 * Never returns more than FEATURED_DOGS_MAX cards, whatever the CMS says.
 * With no curated dogs this degrades to the original "newest available" query.
 */
/** Hard ceiling on featured cards, regardless of the CMS limit or curated count. */
export const FEATURED_DOGS_MAX = 6;

export async function getFeaturedDogs(
  block: Pick<FeaturedDogsBlock, "dogs" | "limit">,
  previewParams?: LivePreviewParams
): Promise<DogEntry[]> {
  const limit = Math.min(Math.max(block.limit ?? 3, 1), FEATURED_DOGS_MAX);
  const seen = new Set<string>();
  const curated = (block.dogs ?? [])
    .filter(isResolvedDog)
    // Curated dogs may be "pending" (DogCard shows the badge); only adopted
    // dogs are dropped so a placed dog never lingers on the homepage.
    .filter((d) => d.status !== "adopted")
    .filter((d) => !seen.has(d.uid) && seen.add(d.uid))
    .slice(0, FEATURED_DOGS_MAX);
  const needed = Math.max(0, limit - curated.length);

  let fallback: DogEntry[] = [];
  if (needed > 0) {
    try {
      const s = previewParams?.live_preview || previewParams?.preview_timestamp ? createStack() : stack;
      applyLivePreview(s, previewParams || {}, "dog");

      // Over-fetch by the curated count so filtering out already-shown dogs
      // still leaves enough to fill the remaining slots.
      const result = await s
        .contentType("dog")
        .entry()
        .query()
        .where("status", QueryOperation.EQUALS, "available")
        .orderByDescending("date_added")
        .limit(needed + seen.size)
        .find();
      fallback = ((result.entries ?? []) as unknown as DogEntry[])
        .filter((d) => !seen.has(d.uid))
        .slice(0, needed);
    } catch (error) {
      console.error("Error fetching featured dogs:", error);
    }
  }

  const dogs = [...curated, ...fallback];
  if (previewParams?.live_preview) {
    for (const entry of dogs) addEditTags(entry, "dog");
  }
  return dogs;
}

export async function getFosterPage(
  previewParams?: LivePreviewParams
): Promise<FosterPageEntry | null> {
  try {
    const s = previewParams?.live_preview || previewParams?.preview_timestamp ? createStack() : stack;
    applyLivePreview(s, previewParams || {}, "foster_page");

    const result = await s.contentType("foster_page").entry().query().find();
    const entries = result.entries ?? [];
    const entry = (entries[0] as unknown as FosterPageEntry) ?? null;
    if (entry && previewParams?.live_preview) addEditTags(entry, "foster_page");
    return entry;
  } catch (error) {
    console.error("Error fetching foster page:", error);
    return null;
  }
}

export async function getHistoryPage(
  previewParams?: LivePreviewParams
): Promise<HistoryPageEntry | null> {
  try {
    const s = previewParams?.live_preview || previewParams?.preview_timestamp ? createStack() : stack;
    applyLivePreview(s, previewParams || {}, "history_page");

    const result = await s.contentType("history_page").entry().query().find();
    const entries = result.entries ?? [];
    const entry = (entries[0] as unknown as HistoryPageEntry) ?? null;
    if (entry && previewParams?.live_preview) addEditTags(entry, "history_page");
    return entry;
  } catch (error) {
    console.error("Error fetching history page:", error);
    return null;
  }
}

export async function getDemoPage(
  previewParams?: LivePreviewParams
): Promise<DemoPageEntry | null> {
  try {
    const s = previewParams?.live_preview || previewParams?.preview_timestamp ? createStack() : stack;
    console.log("Preview params:", previewParams);
    applyLivePreview(s, previewParams || {}, "demo_page");

    const result = await s.contentType("demo_page").entry().query().find();
    const entries = result.entries ?? [];
    const entry = (entries[0] as unknown as DemoPageEntry) ?? null;
    if (entry && previewParams?.live_preview) addEditTags(entry, "demo_page");
    return entry;
  } catch (error) {
    console.error("Error fetching demo page:", error);
    return null;
  }
}

export async function getBreedBySlug(
  slug: string,
  previewParams?: LivePreviewParams
): Promise<BreedEntry | null> {
  try {
    const s = previewParams?.live_preview || previewParams?.preview_timestamp ? createStack() : stack;
    applyLivePreview(s, previewParams || {}, "breed");

    const result = await s
      .contentType("breed")
      .entry()
      .query()
      .where("slug", QueryOperation.EQUALS, slug)
      .find();
    const entries = result.entries ?? [];
    const entry = (entries[0] as unknown as BreedEntry) ?? null;
    if (entry && previewParams?.live_preview) addEditTags(entry, "breed");
    return entry;
  } catch (error) {
    console.error("Error fetching breed:", error);
    return null;
  }
}

export async function getBlogPosts(
  previewParams?: LivePreviewParams
): Promise<BlogPostEntry[]> {
  try {
    const s = previewParams?.live_preview || previewParams?.preview_timestamp ? createStack() : stack;
    applyLivePreview(s, previewParams || {}, "blog_post");

    const result = await s
      .contentType("blog_post")
      .entry()
      .query()
      .orderByDescending("published_date")
      .find();
    const entries = (result.entries ?? []) as unknown as BlogPostEntry[];
    if (previewParams?.live_preview) {
      for (const entry of entries) addEditTags(entry, "blog_post");
    }
    return entries;
  } catch (error) {
    console.error("Error fetching blog posts:", error);
    return [];
  }
}

export async function getBlogBySlug(
  slug: string,
  previewParams?: LivePreviewParams
): Promise<BlogPostEntry | null> {
  try {
    const s = previewParams?.live_preview || previewParams?.preview_timestamp ? createStack() : stack;
    applyLivePreview(s, previewParams || {}, "blog_post");

    const url = `/blog/${slug}`;
    // includeReference resolves `associated_dogs` to full dog entries; without
    // it the SDK returns bare uids. The frontend then filters to status:available.
    const result = await s
      .contentType("blog_post")
      .entry()
      .includeReference("associated_dogs")
      .query()
      .where("url", QueryOperation.EQUALS, url)
      .find();
    const entries = result.entries ?? [];
    const entry = (entries[0] as unknown as BlogPostEntry) ?? null;
    if (entry && previewParams?.live_preview) addEditTags(entry, "blog_post");
    return entry;
  } catch (error) {
    console.error("Error fetching blog post:", error);
    return null;
  }
}

export async function getAboutPage(
  previewParams?: LivePreviewParams
): Promise<AboutPageEntry | null> {
  try {
    const s = previewParams?.live_preview || previewParams?.preview_timestamp ? createStack() : stack;
    applyLivePreview(s, previewParams || {}, "about_page");

    const result = await s.contentType("about_page").entry().query().find();
    const entries = result.entries ?? [];
    const entry = (entries[0] as unknown as AboutPageEntry) ?? null;
    if (entry && previewParams?.live_preview) addEditTags(entry, "about_page");
    return entry;
  } catch (error) {
    console.error("Error fetching about page:", error);
    return null;
  }
}
