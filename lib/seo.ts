import type { Metadata } from "next";
import type { DogEntry } from "@/lib/contentstack";

// Absolute site origin, used for canonical + Open Graph URLs and JSON-LD @id.
// Override per-environment with NEXT_PUBLIC_SITE_URL (e.g. https://frostedfaces.org).
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
).replace(/\/$/, "");

export const ORG_NAME = "Frosted Faces Foundation";

function absoluteUrl(path: string): string {
  if (/^https?:\/\//.test(path)) return path;
  return `${SITE_URL}${path.startsWith("/") ? "" : "/"}${path}`;
}

// ─── Metadata (SEO + social) ─────────────────────────────────────────────────
//
// Reads the Contentstack `seo` field group with graceful fallback to the
// dog's existing content, so pages stay optimized even before an editor or
// AI agent fills the SEO fields in.
export function buildDogMetadata(dog: DogEntry): Metadata {
  const seo = dog.seo ?? {};
  const path = `/dogs/${dog.slug}`;

  const title = seo.meta_title || `Adopt ${dog.title} — ${ORG_NAME}`;
  const description = seo.meta_description || dog.tagline;
  const canonical = seo.canonical_url ? absoluteUrl(seo.canonical_url) : path;

  const imageUrl = seo.og_image || dog.images?.[0];
  const images = imageUrl ? [{ url: imageUrl, alt: dog.title }] : [];

  return {
    title,
    description,
    keywords: seo.keywords?.length ? seo.keywords : undefined,
    alternates: { canonical },
    robots: seo.no_index ? { index: false, follow: false } : undefined,
    openGraph: {
      type: "article",
      title,
      description,
      url: canonical,
      siteName: ORG_NAME,
      images,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: images.map((i) => i.url),
    },
    // Illustrative only: no engine reads a custom ai:summary tag today. The
    // functional GEO path is ai_summary -> crawlable Product.description (see
    // dogProductJsonLd). This marks where a future GEO standard could plug in.
    other: seo.ai_summary ? { "ai:summary": seo.ai_summary } : {},
  };
}

// ─── JSON-LD structured data (SEO rich results + AEO + GEO) ───────────────────

type JsonLd = Record<string, unknown>;

function prop(name: string, value: unknown): JsonLd | null {
  if (value === undefined || value === null || value === "" || value === "unknown")
    return null;
  return { "@type": "PropertyValue", name, value };
}

// schema.org/ItemAvailability, derived automatically from adoption status.
// This is the governance hook: flip `status` to "adopted" and the engine
// stops surfacing the dog as available — no separate SEO edit required.
function availabilityFor(status: string): string {
  switch (status) {
    case "adopted":
      return "https://schema.org/SoldOut";
    case "pending":
      return "https://schema.org/LimitedAvailability";
    default:
      return "https://schema.org/InStock";
  }
}

// schema.org/Product + Offer — a VALID, validator-passing entity an AI engine
// can cite. schema.org has no Pet/Animal type, so we use Product (the animal
// being placed) with `additionalType` grounding it to Wikidata's "dog" entity
// for generative-engine disambiguation, and an Offer that carries adoption
// fee + availability.
function dogProductJsonLd(dog: DogEntry): JsonLd {
  const seo = dog.seo ?? {};
  const path = `/dogs/${dog.slug}`;
  const url = absoluteUrl(path);

  const additionalProperty = [
    prop("Breed", dog.breed),
    prop("Secondary breed", dog.breed_secondary),
    prop("Sex", dog.sex),
    prop("Age", dog.age),
    prop("Age category", dog.age_category),
    prop("Size", dog.size),
    dog.weight ? { "@type": "PropertyValue", name: "Weight", value: dog.weight, unitText: "LB" } : null,
    prop("Color", dog.color),
    prop("Energy level", dog.energy_level),
    prop("House trained", dog.house_trained),
    prop("Good with dogs", dog.good_with_dogs),
    prop("Good with cats", dog.good_with_cats),
    prop("Good with kids", dog.good_with_kids),
    prop("Spayed/neutered", dog.spayed_neutered ? "yes" : null),
    prop("Vaccinated", dog.vaccinated ? "yes" : null),
    prop("Microchipped", dog.microchipped ? "yes" : null),
    prop("Special needs", dog.special_needs),
    prop("Foster location", dog.foster_location),
  ].filter(Boolean);

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": `${url}#dog`,
    // Entity grounding for GEO: Wikidata Q144 = "dog".
    additionalType: "https://www.wikidata.org/wiki/Q144",
    category: "Pet adoption",
    name: dog.title,
    description: seo.ai_summary || dog.bio || dog.tagline,
    url,
    image: dog.images ?? [],
    additionalProperty,
    offers: {
      "@type": "Offer",
      url,
      priceCurrency: "USD",
      price: dog.adoption_fee ?? 0,
      availability: availabilityFor(dog.status),
      seller: {
        "@type": "AnimalShelter",
        name: ORG_NAME,
        url: SITE_URL,
      },
    },
  };
}

// schema.org/BreadcrumbList — clarifies entity hierarchy for crawlers + LLMs.
function breadcrumbJsonLd(dog: DogEntry): JsonLd {
  const item = (name: string, path: string, position: number) => ({
    "@type": "ListItem",
    position,
    name,
    item: absoluteUrl(path),
  });
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      item("Home", "/", 1),
      item("Adoptable Dogs", "/dogs", 2),
      item(dog.title, `/dogs/${dog.slug}`, 3),
    ],
  };
}

// schema.org/FAQPage — powers answer-engine results and voice search (AEO).
function faqJsonLd(dog: DogEntry): JsonLd | null {
  const faqs = (dog.seo?.faqs ?? []).filter((f) => f.question && f.answer);
  if (faqs.length === 0) return null;
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: { "@type": "Answer", text: f.answer },
    })),
  };
}

// schema.org/AnimalShelter — establishes the rescue as a recognized local
// entity, which helps citation authority for SEO and generative engines.
// Rendered site-wide from the root layout.
export function buildOrganizationJsonLd(): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "AnimalShelter",
    "@id": `${SITE_URL}/#organization`,
    name: ORG_NAME,
    url: SITE_URL,
    description:
      "Frosted Faces Foundation rescues and rehomes senior dogs, giving frosted faces a warm home for their golden years.",
  };
}

// Returns every JSON-LD document to embed on a dog profile page.
export function buildDogJsonLd(dog: DogEntry): JsonLd[] {
  return [dogProductJsonLd(dog), breadcrumbJsonLd(dog), faqJsonLd(dog)].filter(
    Boolean
  ) as JsonLd[];
}
