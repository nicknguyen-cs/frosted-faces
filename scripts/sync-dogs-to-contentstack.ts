/**
 * Syncs all dogs from the Prisma/SQLite database into Contentstack.
 * Skips dogs whose slug already exists in Contentstack.
 * Run with: npx tsx scripts/sync-dogs-to-contentstack.ts
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const API_KEY = process.env.CONTENTSTACK_API_KEY!;
const MANAGEMENT_TOKEN = process.env.CONTENTSTACK_MANAGEMENT_TOKEN!;
const BASE_URL = "https://api.contentstack.io/v3";
const ENVIRONMENT = "production";

const headers = {
  api_key: API_KEY,
  authorization: MANAGEMENT_TOKEN,
  "Content-Type": "application/json",
};

async function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function getExistingSlugs(): Promise<Set<string>> {
  const slugs = new Set<string>();
  let skip = 0;
  const limit = 100;

  while (true) {
    const res = await fetch(
      `${BASE_URL}/content_types/dog/entries?environment=${ENVIRONMENT}&only[BASE][]=slug&limit=${limit}&skip=${skip}&include_count=true`,
      { headers }
    );
    const json = await res.json();
    const entries = json.entries || [];
    for (const e of entries) {
      slugs.add(e.slug);
    }
    if (entries.length < limit) break;
    skip += limit;
  }

  return slugs;
}

async function createEntry(entry: Record<string, unknown>): Promise<string> {
  const res = await fetch(`${BASE_URL}/content_types/dog/entries`, {
    method: "POST",
    headers,
    body: JSON.stringify({ entry }),
  });
  const json = await res.json();
  if (!res.ok) {
    throw new Error(
      `Create failed: ${json.error_message || res.statusText} - ${JSON.stringify(json.errors || {})}`
    );
  }
  return json.entry.uid;
}

async function publishEntry(uid: string) {
  const res = await fetch(
    `${BASE_URL}/content_types/dog/entries/${uid}/publish`,
    {
      method: "POST",
      headers,
      body: JSON.stringify({
        entry: { environments: [ENVIRONMENT], locales: ["en-us"] },
      }),
    }
  );
  if (!res.ok) {
    const json = await res.json();
    throw new Error(`Publish failed: ${json.error_message || res.statusText}`);
  }
}

async function main() {
  console.log("Fetching dogs from Prisma...");
  const dogs = await prisma.dog.findMany({
    include: { photos: { orderBy: { order: "asc" } } },
  });
  console.log(`Found ${dogs.length} dogs in database`);

  console.log("Checking existing Contentstack entries...");
  const existingSlugs = await getExistingSlugs();
  console.log(`${existingSlugs.size} dogs already in Contentstack`);

  const toSync = dogs.filter((d) => !existingSlugs.has(d.slug));
  console.log(`${toSync.length} dogs to sync\n`);

  if (toSync.length === 0) {
    console.log("Nothing to do!");
    await prisma.$disconnect();
    return;
  }

  let created = 0;
  let failed = 0;
  const uidsToPublish: { slug: string; uid: string }[] = [];

  for (const dog of toSync) {
    const traits = (() => {
      try {
        const parsed = JSON.parse(dog.personalityTraits);
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return [];
      }
    })();

    const entry: Record<string, unknown> = {
      title: dog.name,
      slug: dog.slug,
      tagline: dog.tagline || "",
      bio: dog.bio || "",
      breed: dog.breed,
      age: dog.age,
      age_category: dog.ageCategory,
      sex: dog.sex,
      size: dog.size,
      weight: dog.weight,
      color: dog.color,
      status: dog.status,
      energy_level: dog.energyLevel,
      adoption_fee: dog.adoptionFee,
      spayed_neutered: dog.spayedNeutered,
      vaccinated: dog.vaccinated,
      microchipped: dog.microchipped,
      date_added: dog.dateAdded?.toISOString() || new Date().toISOString(),
      photos: dog.photos.map((p) => ({
        url: p.url,
        alt: p.alt,
        width: p.width,
        height: p.height,
        order: p.order,
      })),
    };

    // Only include optional fields if they have values
    if (dog.breedSecondary) entry.breed_secondary = dog.breedSecondary;
    if (dog.fosterLocation) entry.foster_location = dog.fosterLocation;
    if (dog.specialNeeds) entry.special_needs = dog.specialNeeds;
    if (traits.length > 0) entry.personality_traits = traits;
    if (dog.goodWithDogs !== null) entry.good_with_dogs = dog.goodWithDogs;
    if (dog.goodWithCats !== null) entry.good_with_cats = dog.goodWithCats;
    if (dog.goodWithKids !== null) entry.good_with_kids = dog.goodWithKids;
    if (dog.houseTrained !== null) entry.house_trained = dog.houseTrained;

    try {
      const uid = await createEntry(entry);
      uidsToPublish.push({ slug: dog.slug, uid });
      created++;
      console.log(`  + ${dog.name} (${dog.breed})`);
      await sleep(350); // rate limit
    } catch (err) {
      failed++;
      console.error(`  x ${dog.name}: ${err}`);
      await sleep(350);
    }
  }

  console.log(`\nCreated ${created}, failed ${failed}`);
  console.log(`Publishing ${uidsToPublish.length} entries...`);

  for (const { slug, uid } of uidsToPublish) {
    try {
      await publishEntry(uid);
      await sleep(200);
    } catch (err) {
      console.error(`  Failed to publish ${slug}: ${err}`);
    }
  }

  console.log("Done!");
  await prisma.$disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
