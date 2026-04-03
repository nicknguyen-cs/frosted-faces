/**
 * Adds a `url` field to the dog content type, makes it a page type,
 * and populates url on all entries from their slug field.
 * Run with: npx tsx scripts/add-url-to-dogs.ts
 */

const API_KEY = process.env.CONTENTSTACK_API_KEY || "blt4d56743833db0e6d";
const MANAGEMENT_TOKEN =
  process.env.CONTENTSTACK_MANAGEMENT_TOKEN || "csa0dfda0285ccdf33e51cf7a3";
const BASE_URL = "https://api.contentstack.io/v3";
const ENVIRONMENT = "production";

const headers = {
  api_key: API_KEY,
  authorization: MANAGEMENT_TOKEN,
  "Content-Type": "application/json",
};

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function main() {
  // 1. Fetch the current dog content type
  console.log("Fetching dog content type...");
  const ctRes = await fetch(`${BASE_URL}/content_types/dog`, { headers });
  const ctJson = await ctRes.json();
  const contentType = ctJson.content_type;

  // Check if url field already exists
  const hasUrl = contentType.schema.some(
    (f: { uid: string }) => f.uid === "url"
  );

  if (!hasUrl) {
    // 2. Add url field to schema (insert after title)
    console.log("Adding url field to schema...");
    const titleIdx = contentType.schema.findIndex(
      (f: { uid: string }) => f.uid === "title"
    );
    const urlField = {
      display_name: "URL",
      uid: "url",
      data_type: "text",
      mandatory: true,
      field_metadata: { description: "Page URL path, e.g. /dogs/biscuit-golden-retriever" },
    };
    contentType.schema.splice(titleIdx + 1, 0, urlField);

    // Make it a page type with url pattern
    contentType.options = {
      ...contentType.options,
      is_page: true,
      singleton: false,
      url_pattern: "/:slug",
      url_prefix: "/dogs/",
    };

    const updateRes = await fetch(`${BASE_URL}/content_types/dog`, {
      method: "PUT",
      headers,
      body: JSON.stringify({ content_type: contentType }),
    });
    const updateJson = await updateRes.json();
    if (!updateRes.ok) {
      console.error("Failed to update content type:", updateJson);
      process.exit(1);
    }
    console.log("Content type updated with url field");
  } else {
    console.log("url field already exists, skipping schema update");
  }

  await sleep(1000);

  // 3. Fetch all dog entries and update their url field
  console.log("\nFetching all dog entries...");
  let allEntries: { uid: string; slug: string; url?: string; title: string }[] = [];
  let skip = 0;
  const limit = 100;

  while (true) {
    const res = await fetch(
      `${BASE_URL}/content_types/dog/entries?include_count=true&limit=${limit}&skip=${skip}`,
      { headers }
    );
    const json = await res.json();
    allEntries = allEntries.concat(json.entries || []);
    if ((json.entries || []).length < limit) break;
    skip += limit;
  }

  console.log(`Found ${allEntries.length} entries`);

  // 4. Update each entry with url = /dogs/{slug}
  let updated = 0;
  let skipped = 0;
  for (const entry of allEntries) {
    const expectedUrl = `/dogs/${entry.slug}`;
    if (entry.url === expectedUrl) {
      skipped++;
      continue;
    }

    try {
      const res = await fetch(
        `${BASE_URL}/content_types/dog/entries/${entry.uid}`,
        {
          method: "PUT",
          headers,
          body: JSON.stringify({ entry: { url: expectedUrl } }),
        }
      );
      if (!res.ok) {
        const json = await res.json();
        console.error(`  Failed ${entry.title}: ${json.error_message}`);
        continue;
      }
      updated++;
      if (updated % 10 === 0) console.log(`  Updated ${updated}...`);
      await sleep(200);
    } catch (err) {
      console.error(`  Error updating ${entry.title}: ${err}`);
    }
  }

  console.log(`Updated ${updated}, skipped ${skipped} (already had url)`);

  // 5. Re-publish all entries
  console.log("\nPublishing all entries...");
  let published = 0;
  for (const entry of allEntries) {
    try {
      await fetch(
        `${BASE_URL}/content_types/dog/entries/${entry.uid}/publish`,
        {
          method: "POST",
          headers,
          body: JSON.stringify({
            entry: { environments: [ENVIRONMENT], locales: ["en-us"] },
          }),
        }
      );
      published++;
      if (published % 10 === 0) console.log(`  Published ${published}...`);
      await sleep(200);
    } catch (err) {
      console.error(`  Error publishing ${entry.title}: ${err}`);
    }
  }

  console.log(`Published ${published} entries`);
  console.log("\nDone!");
}

main().catch(console.error);
