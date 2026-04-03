import { chromium } from "playwright";

const API_KEY = process.env.CONTENTSTACK_API_KEY!;
const MANAGEMENT_TOKEN = process.env.CONTENTSTACK_MANAGEMENT_TOKEN!;
const BASE_URL = "https://api.contentstack.io/v3";
const ENVIRONMENT = "production";

const headers = {
  api_key: API_KEY,
  authorization: MANAGEMENT_TOKEN,
  "Content-Type": "application/json",
};

interface ShelterLuvPhoto {
  id: number;
  url: string;
  name: string;
  isCover: boolean;
  order_column: number;
}

interface ShelterLuvAnimal {
  nid: number;
  name: string;
  uniqueId: string;
  sex: string;
  location: string;
  birthday: string;
  age_group: { name: string };
  species: string;
  breed: string;
  secondary_breed: string;
  primary_color: string;
  secondary_color: string | null;
  weight_group: string;
  photos: ShelterLuvPhoto[];
  public_url: string;
  adoptable: number;
}

interface ScrapedPageData {
  description: string;
  intakeDate: string | null;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function calcAge(birthday: string): { age: string; ageCategory: string } {
  const birthDate = new Date(parseInt(birthday) * 1000);
  const now = new Date();
  const years = Math.floor(
    (now.getTime() - birthDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000)
  );
  const months = Math.floor(
    ((now.getTime() - birthDate.getTime()) % (365.25 * 24 * 60 * 60 * 1000)) /
      (30.44 * 24 * 60 * 60 * 1000)
  );

  let age: string;
  if (years === 0) {
    age = `${months} month${months !== 1 ? "s" : ""}`;
  } else if (months === 0) {
    age = `${years} year${years !== 1 ? "s" : ""}`;
  } else {
    age = `${years} year${years !== 1 ? "s" : ""}, ${months} month${months !== 1 ? "s" : ""}`;
  }

  let ageCategory: string;
  if (years < 1) ageCategory = "puppy";
  else if (years < 3) ageCategory = "young";
  else if (years < 8) ageCategory = "adult";
  else ageCategory = "senior";

  return { age, ageCategory };
}

function parseWeight(weightGroup: string): number {
  const match = weightGroup.match(/\((\d+)/);
  if (!match) return 0;
  const lower = parseInt(match[1]);
  const upperMatch = weightGroup.match(/-(\d+)/);
  if (upperMatch) {
    return Math.round((lower + parseInt(upperMatch[1])) / 2);
  }
  return lower;
}

function parseSize(weightGroup: string): string {
  if (weightGroup.toLowerCase().includes("extra")) return "extra-large";
  if (weightGroup.toLowerCase().includes("large")) return "large";
  if (weightGroup.toLowerCase().includes("medium")) return "medium";
  return "small";
}

function formatBreed(breed: string): string {
  if (breed.includes(",")) {
    const parts = breed.split(",").map((p) => p.trim());
    return parts.reverse().join(" ");
  }
  return breed;
}

function parseIntakeDate(raw: string): string | null {
  // Frosted Faces uses formats like "March 15, 2026" or "3/15/2026"
  const d = new Date(raw);
  if (isNaN(d.getTime())) return null;
  return d.toISOString();
}

async function scrapePageData(
  browser: Awaited<ReturnType<typeof chromium.launch>>,
  animals: ShelterLuvAnimal[]
): Promise<Map<string, ScrapedPageData>> {
  const results = new Map<string, ScrapedPageData>();
  const page = await browser.newPage();

  for (const animal of animals) {
    try {
      console.log(`  Fetching page data for ${animal.name}...`);
      await page.goto(animal.public_url, {
        waitUntil: "networkidle",
        timeout: 30000,
      });
      await page.waitForTimeout(1500);

      const data = await page.evaluate(() => {
        const body = document.body.innerText;
        const lines = body.split("\n").map((l) => l.trim()).filter(Boolean);

        const intakeIdx = lines.findIndex((l) => l === "INTAKE DATE");

        let intakeDateRaw: string | null = null;
        let description = "";

        if (intakeIdx >= 0) {
          // The line right after "INTAKE DATE" is the date value
          intakeDateRaw = lines[intakeIdx + 1] || null;

          // Description starts after the date value
          const descLines: string[] = [];
          for (let i = intakeIdx + 2; i < lines.length; i++) {
            const line = lines[i];
            if (
              line.toLowerCase().includes("to meet") ||
              line.toLowerCase().includes("placement@") ||
              line.toLowerCase().includes("@frostedfacesfoundation")
            ) {
              break;
            }
            descLines.push(line);
          }
          description = descLines.join("\n\n");
        }

        return { description, intakeDateRaw };
      });

      results.set(animal.uniqueId, {
        description: data.description,
        intakeDate: data.intakeDateRaw ? parseIntakeDate(data.intakeDateRaw) : null,
      });
    } catch (err) {
      console.log(`  Failed to get page data for ${animal.name}: ${err}`);
    }
  }

  await page.close();
  return results;
}

function sleep(ms: number) {
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
  if (!API_KEY || !MANAGEMENT_TOKEN) {
    console.error(
      "Missing CONTENTSTACK_API_KEY or CONTENTSTACK_MANAGEMENT_TOKEN env vars"
    );
    process.exit(1);
  }

  console.log("Launching browser...");
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  // Intercept the Shelterluv API response
  let animals: ShelterLuvAnimal[] = [];
  page.on("response", async (response) => {
    if (response.url().includes("/api/v3/available-animals/")) {
      try {
        const data = await response.json();
        animals = data.animals || [];
      } catch {
        // ignore
      }
    }
  });

  console.log("Loading Frosted Faces Foundation page...");
  await page.goto(
    "https://frostedfacesfoundation.org/available-frosted-faces",
    { waitUntil: "networkidle", timeout: 60000 }
  );
  await page.waitForTimeout(3000);
  await page.close();

  console.log(`Found ${animals.length} animals from API`);

  // Filter to dogs only
  const dogs = animals.filter((a) => a.species === "Dog" && a.adoptable === 1);
  console.log(`${dogs.length} adoptable dogs`);

  // Scrape descriptions and intake dates from individual pages
  console.log("\nScraping page data (descriptions + intake dates)...");
  const pageData = await scrapePageData(browser, dogs);
  console.log(`Got page data for ${pageData.size} dogs`);

  await browser.close();

  // Check existing entries in Contentstack
  console.log("\nChecking existing Contentstack entries...");
  const existingSlugs = await getExistingSlugs();
  console.log(`${existingSlugs.size} dogs already in Contentstack`);

  // Sync to Contentstack
  let created = 0;
  let skipped = 0;
  let failed = 0;
  const uidsToPublish: { slug: string; uid: string }[] = [];

  for (const animal of dogs) {
    const { age, ageCategory } = calcAge(animal.birthday);
    const breed = formatBreed(animal.breed);
    const secondaryBreed = animal.secondary_breed
      ? formatBreed(animal.secondary_breed)
      : null;
    const slug = slugify(`${animal.name}-${breed}`);

    if (existingSlugs.has(slug)) {
      skipped++;
      continue;
    }

    const scraped = pageData.get(animal.uniqueId);
    const description = scraped?.description || "";
    const intakeDate = scraped?.intakeDate || null;
    const tagline = description
      ? description.split(/[.!?]/)[0].trim().substring(0, 120)
      : `Meet ${animal.name}, a wonderful ${breed.toLowerCase()}`;

    // Sort photos: cover photo first, then by order_column
    const rawPhotos = Array.isArray(animal.photos) ? animal.photos : [];
    const sortedPhotos = [...rawPhotos].sort((a, b) => {
      if (a.isCover && !b.isCover) return -1;
      if (!a.isCover && b.isCover) return 1;
      return a.order_column - b.order_column;
    });
    const photos = sortedPhotos.slice(0, 5);

    if (photos.length === 0) {
      console.log(`  Skipping ${animal.name} (no photos)`);
      continue;
    }

    const entry: Record<string, unknown> = {
      title: animal.name,
      url: `/dogs/${slug}`,
      slug,
      tagline,
      bio:
        description ||
        `${animal.name} is looking for a loving forever home. Contact Frosted Faces Foundation to learn more about this wonderful ${breed.toLowerCase()}.`,
      breed,
      age,
      age_category: ageCategory,
      sex: animal.sex.toLowerCase(),
      size: parseSize(animal.weight_group),
      weight: parseWeight(animal.weight_group),
      color: animal.primary_color || "Unknown",
      status: "available",
      energy_level: "moderate",
      adoption_fee: 0,
      good_with_dogs: "unknown",
      good_with_cats: "unknown",
      good_with_kids: "unknown",
      house_trained: "unknown",
      spayed_neutered: false,
      vaccinated: false,
      microchipped: false,
      date_added: new Date().toISOString(),
      photos: photos.map((p, i) => ({
        url: p.url,
        alt: `${animal.name} the ${breed}`,
        width: 800,
        height: 800,
        order: i,
      })),
    };

    if (secondaryBreed) entry.breed_secondary = secondaryBreed;
    if (animal.location) entry.foster_location = animal.location;
    if (intakeDate) entry.intake_date = intakeDate;

    try {
      const uid = await createEntry(entry);
      uidsToPublish.push({ slug, uid });
      created++;
      console.log(
        `  + ${animal.name} (${breed}, ${age})${intakeDate ? ` intake: ${intakeDate.slice(0, 10)}` : ""}`
      );
      await sleep(350);
    } catch (err) {
      failed++;
      console.error(`  x ${animal.name}: ${err}`);
      await sleep(350);
    }
  }

  console.log(`\nCreated ${created}, skipped ${skipped}, failed ${failed}`);

  if (uidsToPublish.length > 0) {
    console.log(`Publishing ${uidsToPublish.length} entries...`);
    for (const { slug, uid } of uidsToPublish) {
      try {
        await publishEntry(uid);
        await sleep(200);
      } catch (err) {
        console.error(`  Failed to publish ${slug}: ${err}`);
      }
    }
  }

  console.log("Done!");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
