/**
 * Migration script: Creates content types and entries in Contentstack.
 * Run with: npx tsx scripts/migrate-to-contentstack.ts
 */

const API_KEY = process.env.CONTENTSTACK_API_KEY!;
const MANAGEMENT_TOKEN = process.env.CONTENTSTACK_MANAGEMENT_TOKEN!;
const BASE_URL = "https://api.contentstack.io/v3";
const ENVIRONMENT = "production";

const headers = {
  api_key: API_KEY,
  authorization: MANAGEMENT_TOKEN,
  "Content-Type": "application/json",
};

async function api(
  method: string,
  path: string,
  body?: unknown
): Promise<unknown> {
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  const json = await res.json();
  if (!res.ok) {
    console.error(`${method} ${path} failed:`, JSON.stringify(json, null, 2));
    throw new Error(`API error ${res.status}: ${json.error_message || res.statusText}`);
  }
  return json;
}

async function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

// ─── Content Type: dog ───────────────────────────────────────────────────────

const dogContentType = {
  content_type: {
    title: "Dog",
    uid: "dog",
    schema: [
      {
        display_name: "Title",
        uid: "title",
        data_type: "text",
        mandatory: true,
        field_metadata: { description: "Dog name" },
      },
      {
        display_name: "Slug",
        uid: "slug",
        data_type: "text",
        mandatory: true,
        unique: true,
        field_metadata: { description: "URL-friendly identifier" },
      },
      {
        display_name: "Tagline",
        uid: "tagline",
        data_type: "text",
        field_metadata: { description: "Short one-liner about the dog" },
      },
      {
        display_name: "Bio",
        uid: "bio",
        data_type: "text",
        field_metadata: {
          multiline: true,
          description: "Full bio, paragraphs separated by double newlines",
        },
      },
      {
        display_name: "Breed",
        uid: "breed",
        data_type: "text",
        mandatory: true,
      },
      {
        display_name: "Secondary Breed",
        uid: "breed_secondary",
        data_type: "text",
      },
      {
        display_name: "Age",
        uid: "age",
        data_type: "text",
        field_metadata: { description: "Display age e.g. '2 years'" },
      },
      {
        display_name: "Age Category",
        uid: "age_category",
        data_type: "text",
        enum: {
          advanced: false,
          choices: [
            { value: "puppy" },
            { value: "young" },
            { value: "adult" },
            { value: "senior" },
          ],
        },
        display_type: "dropdown",
      },
      {
        display_name: "Sex",
        uid: "sex",
        data_type: "text",
        enum: {
          advanced: false,
          choices: [{ value: "male" }, { value: "female" }],
        },
        display_type: "dropdown",
      },
      {
        display_name: "Size",
        uid: "size",
        data_type: "text",
        enum: {
          advanced: false,
          choices: [
            { value: "small" },
            { value: "medium" },
            { value: "large" },
            { value: "extra-large" },
          ],
        },
        display_type: "dropdown",
      },
      {
        display_name: "Weight",
        uid: "weight",
        data_type: "number",
        field_metadata: { description: "Weight in pounds" },
      },
      {
        display_name: "Color",
        uid: "color",
        data_type: "text",
      },
      {
        display_name: "Status",
        uid: "status",
        data_type: "text",
        enum: {
          advanced: false,
          choices: [
            { value: "available" },
            { value: "pending" },
            { value: "adopted" },
          ],
        },
        display_type: "dropdown",
        field_metadata: { default_value: "available" },
      },
      {
        display_name: "Energy Level",
        uid: "energy_level",
        data_type: "text",
        enum: {
          advanced: false,
          choices: [
            { value: "low" },
            { value: "moderate" },
            { value: "high" },
          ],
        },
        display_type: "dropdown",
      },
      {
        display_name: "Adoption Fee",
        uid: "adoption_fee",
        data_type: "number",
      },
      {
        display_name: "Foster Location",
        uid: "foster_location",
        data_type: "text",
      },
      {
        display_name: "Personality Traits",
        uid: "personality_traits",
        data_type: "text",
        multiple: true,
        field_metadata: { description: "Array of trait labels" },
      },
      {
        display_name: "Good with Dogs",
        uid: "good_with_dogs",
        data_type: "boolean",
      },
      {
        display_name: "Good with Cats",
        uid: "good_with_cats",
        data_type: "boolean",
      },
      {
        display_name: "Good with Kids",
        uid: "good_with_kids",
        data_type: "boolean",
      },
      {
        display_name: "House Trained",
        uid: "house_trained",
        data_type: "boolean",
      },
      {
        display_name: "Spayed/Neutered",
        uid: "spayed_neutered",
        data_type: "boolean",
      },
      {
        display_name: "Vaccinated",
        uid: "vaccinated",
        data_type: "boolean",
      },
      {
        display_name: "Microchipped",
        uid: "microchipped",
        data_type: "boolean",
      },
      {
        display_name: "Special Needs",
        uid: "special_needs",
        data_type: "text",
        field_metadata: { multiline: true },
      },
      {
        display_name: "Photos",
        uid: "photos",
        data_type: "group",
        multiple: true,
        field_metadata: { description: "Dog photos" },
        schema: [
          {
            display_name: "URL",
            uid: "url",
            data_type: "text",
            mandatory: true,
          },
          {
            display_name: "Alt Text",
            uid: "alt",
            data_type: "text",
          },
          {
            display_name: "Width",
            uid: "width",
            data_type: "number",
          },
          {
            display_name: "Height",
            uid: "height",
            data_type: "number",
          },
          {
            display_name: "Order",
            uid: "order",
            data_type: "number",
          },
        ],
      },
      {
        display_name: "Date Added",
        uid: "date_added",
        data_type: "isodate",
      },
    ],
    options: {
      is_page: false,
      singleton: false,
    },
  },
};

// ─── Content Type: home_page ─────────────────────────────────────────────────

const homePageContentType = {
  content_type: {
    title: "Home Page",
    uid: "home_page",
    schema: [
      {
        display_name: "Title",
        uid: "title",
        data_type: "text",
        mandatory: true,
      },
      {
        display_name: "URL",
        uid: "url",
        data_type: "text",
        mandatory: true,
      },
      {
        display_name: "Hero Heading",
        uid: "hero_heading",
        data_type: "text",
      },
      {
        display_name: "Hero Description",
        uid: "hero_description",
        data_type: "text",
        field_metadata: { multiline: true },
      },
      {
        display_name: "Hero Image URL",
        uid: "hero_image_url",
        data_type: "text",
        field_metadata: {
          description: "URL for the hero background image",
        },
      },
      {
        display_name: "Hero CTA Text",
        uid: "hero_cta_text",
        data_type: "text",
      },
      {
        display_name: "Hero CTA Link",
        uid: "hero_cta_link",
        data_type: "text",
      },
      {
        display_name: "Featured Dogs Heading",
        uid: "featured_dogs_heading",
        data_type: "text",
      },
      {
        display_name: "Featured Dogs",
        uid: "featured_dogs",
        data_type: "reference",
        reference_to: ["dog"],
        multiple: true,
        field_metadata: {
          description: "Dogs to feature on the home page",
        },
      },
      {
        display_name: "Categories",
        uid: "categories",
        data_type: "group",
        multiple: true,
        field_metadata: { description: "Browse-by-type category cards" },
        schema: [
          {
            display_name: "Title",
            uid: "title",
            data_type: "text",
          },
          {
            display_name: "Description",
            uid: "description",
            data_type: "text",
          },
          {
            display_name: "Icon",
            uid: "icon",
            data_type: "text",
            field_metadata: {
              description: "Lucide icon name: baby, dog, heart, home",
            },
          },
          {
            display_name: "Link",
            uid: "href",
            data_type: "text",
          },
        ],
      },
      {
        display_name: "How It Works Steps",
        uid: "how_it_works",
        data_type: "group",
        multiple: true,
        schema: [
          {
            display_name: "Number",
            uid: "number",
            data_type: "number",
          },
          {
            display_name: "Title",
            uid: "title",
            data_type: "text",
          },
          {
            display_name: "Description",
            uid: "description",
            data_type: "text",
          },
          {
            display_name: "Icon",
            uid: "icon",
            data_type: "text",
            field_metadata: {
              description: "Lucide icon name: search, file-text, home",
            },
          },
        ],
      },
    ],
    options: {
      is_page: true,
      singleton: true,
      url_pattern: "/",
      url_prefix: "/",
    },
  },
};

// ─── Dog seed data ───────────────────────────────────────────────────────────

const dogs = [
  {
    title: "Biscuit",
    slug: "biscuit-golden-retriever",
    breed: "Golden Retriever",
    age: "2 years",
    age_category: "young",
    sex: "female",
    size: "large",
    weight: 55,
    color: "Golden",
    status: "available",
    foster_location: "Portland, OR",
    tagline: "A gentle soul who lives for belly rubs and long walks",
    bio: "Biscuit is the kind of dog who makes everyone smile. She greets every person like they're her long-lost best friend, tail wagging so hard her whole body wiggles. She was found as a stray but has adapted beautifully to home life.\n\nShe loves morning walks, playing fetch in the park, and curling up at your feet while you read. Biscuit is fully house-trained and knows basic commands — sit, stay, and an enthusiastic \"shake.\" She's looking for a family who will give her the love she so freely gives to everyone she meets.",
    personality_traits: ["Gentle", "Loyal", "Playful", "Loves Walks", "Couch Companion"],
    energy_level: "moderate",
    good_with_dogs: true,
    good_with_cats: true,
    good_with_kids: true,
    house_trained: true,
    spayed_neutered: true,
    vaccinated: true,
    microchipped: true,
    adoption_fee: 250,
    date_added: "2025-03-15T00:00:00.000Z",
    photos: [
      { url: "https://images.unsplash.com/photo-1633722715463-d30f4f325e24?w=800&h=1000&fit=crop", alt: "Biscuit the Golden Retriever smiling", width: 800, height: 1000, order: 0 },
      { url: "https://images.unsplash.com/photo-1612774412771-005ed8e861d2?w=600&h=600&fit=crop", alt: "Biscuit playing in the park", width: 600, height: 600, order: 1 },
      { url: "https://images.unsplash.com/photo-1625316708582-7c38734d5fd6?w=600&h=600&fit=crop", alt: "Biscuit resting on a couch", width: 600, height: 600, order: 2 },
    ],
  },
  {
    title: "Luna",
    slug: "luna-pit-mix",
    breed: "Pit Bull Terrier",
    breed_secondary: "Lab Mix",
    age: "1 year",
    age_category: "young",
    sex: "female",
    size: "medium",
    weight: 42,
    color: "Brindle",
    status: "available",
    foster_location: "Seattle, WA",
    tagline: "A wiggly lovebug with the sweetest smile in the shelter",
    bio: "Luna is pure joy wrapped in a brindle coat. She came to us from a crowded shelter down south and has been winning hearts ever since. Don't let her muscular build fool you — she thinks she's a lap dog and will try to prove it at every opportunity.\n\nLuna is incredibly smart and food-motivated, which makes training a breeze. She already knows sit, down, and is working on \"leave it\" (her biggest challenge when treats are involved). She'd thrive in an active home that can channel her enthusiasm into adventures.",
    personality_traits: ["Affectionate", "Smart", "Energetic", "Food Motivated", "Lap Dog"],
    energy_level: "high",
    good_with_dogs: true,
    good_with_cats: false,
    good_with_kids: true,
    house_trained: true,
    spayed_neutered: true,
    vaccinated: true,
    microchipped: true,
    adoption_fee: 200,
    date_added: "2025-03-18T00:00:00.000Z",
    photos: [
      { url: "https://images.unsplash.com/photo-1537151625747-768eb6cf92b2?w=800&h=1000&fit=crop", alt: "Luna the Pit Mix smiling", width: 800, height: 1000, order: 0 },
      { url: "https://images.unsplash.com/photo-1588943211346-0908a1fb0b01?w=600&h=600&fit=crop", alt: "Luna playing with a toy", width: 600, height: 600, order: 1 },
      { url: "https://images.unsplash.com/photo-1518020382113-a7e8fc38eac9?w=600&h=600&fit=crop", alt: "Luna on a walk", width: 600, height: 600, order: 2 },
    ],
  },
  {
    title: "Oakley",
    slug: "oakley-australian-shepherd",
    breed: "Australian Shepherd",
    age: "4 years",
    age_category: "adult",
    sex: "male",
    size: "large",
    weight: 52,
    color: "Blue Merle",
    status: "available",
    foster_location: "Denver, CO",
    tagline: "An adventure buddy who'll keep you on your toes",
    bio: "Oakley is a stunning blue merle Aussie with one blue eye and one brown — and a personality as striking as his looks. He's the kind of dog who needs a job to do, whether that's hiking a 14er, learning agility, or herding the neighborhood kids (gently, of course).\n\nHe spent his first years on a ranch but his previous owner could no longer care for him. Oakley is looking for an active household that understands the breed. He's incredibly loyal once bonded and will be your shadow in the best way possible.",
    personality_traits: ["Intelligent", "Athletic", "Loyal", "Driven", "Adventurous"],
    energy_level: "high",
    good_with_dogs: true,
    good_with_kids: true,
    house_trained: true,
    spayed_neutered: true,
    vaccinated: true,
    microchipped: true,
    adoption_fee: 300,
    date_added: "2025-03-20T00:00:00.000Z",
    photos: [
      { url: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=800&h=1000&fit=crop", alt: "Oakley the Australian Shepherd", width: 800, height: 1000, order: 0 },
      { url: "https://images.unsplash.com/photo-1503256207526-0d5d80fa2f47?w=600&h=600&fit=crop", alt: "Oakley running in a field", width: 600, height: 600, order: 1 },
      { url: "https://images.unsplash.com/photo-1477884213360-7e9d7dcc8f9b?w=600&h=600&fit=crop", alt: "Oakley portrait close-up", width: 600, height: 600, order: 2 },
    ],
  },
  {
    title: "Mochi",
    slug: "mochi-shiba-inu",
    breed: "Shiba Inu",
    age: "3 years",
    age_category: "adult",
    sex: "male",
    size: "small",
    weight: 22,
    color: "Red Sesame",
    status: "available",
    foster_location: "San Francisco, CA",
    tagline: "Independent, sassy, and impossibly photogenic",
    bio: "Mochi is a classic Shiba — dignified, a little dramatic, and absolutely convinced he's the most important being in any room. He was surrendered when his owner relocated overseas, and he's been patiently waiting for someone who appreciates his unique brand of companionship.\n\nHe's not a cuddler (he'll come to YOU when he's ready, thank you very much), but his loyalty runs deep. Mochi loves structured walks, puzzle toys, and judging you from across the room. If you want a dog with big personality in a compact package, Mochi is your guy.",
    personality_traits: ["Independent", "Sassy", "Clean", "Loyal", "Photogenic"],
    energy_level: "moderate",
    good_with_dogs: false,
    good_with_cats: false,
    good_with_kids: false,
    house_trained: true,
    spayed_neutered: true,
    vaccinated: true,
    microchipped: true,
    adoption_fee: 350,
    date_added: "2025-03-22T00:00:00.000Z",
    photos: [
      { url: "https://images.unsplash.com/photo-1583337130417-13104dec14a3?w=800&h=1000&fit=crop", alt: "Mochi the Shiba Inu", width: 800, height: 1000, order: 0 },
      { url: "https://images.unsplash.com/photo-1600804340584-c7db2eacf0ba?w=600&h=600&fit=crop", alt: "Mochi on a walk", width: 600, height: 600, order: 1 },
      { url: "https://images.unsplash.com/photo-1598133894008-61f7fdb8cc3a?w=600&h=600&fit=crop", alt: "Mochi lounging", width: 600, height: 600, order: 2 },
    ],
  },
  {
    title: "Rosie",
    slug: "rosie-beagle",
    breed: "Beagle",
    age: "6 years",
    age_category: "adult",
    sex: "female",
    size: "medium",
    weight: 28,
    color: "Tricolor",
    status: "available",
    foster_location: "Austin, TX",
    tagline: "A mellow sweetheart who just wants to be near you",
    bio: "Rosie is proof that the best things in life are simple. This gentle beagle spent years as a backyard dog before being rescued, and she's been making up for lost time by soaking up every ounce of love her foster family gives her.\n\nShe's past her puppy chaos phase and has settled into the most wonderful companion dog. Rosie's favorite activities include napping in sunbeams, gentle neighborhood strolls, and following her favorite human from room to room. She's the perfect dog for someone looking for a calm, loving presence in their life.",
    personality_traits: ["Mellow", "Sweet", "Gentle", "Quiet", "Devoted"],
    energy_level: "low",
    good_with_dogs: true,
    good_with_cats: true,
    good_with_kids: true,
    house_trained: true,
    spayed_neutered: true,
    vaccinated: true,
    microchipped: true,
    adoption_fee: 175,
    date_added: "2025-03-25T00:00:00.000Z",
    photos: [
      { url: "https://images.unsplash.com/photo-1505628346881-b72b27e84530?w=800&h=1000&fit=crop", alt: "Rosie the Beagle", width: 800, height: 1000, order: 0 },
      { url: "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=600&h=600&fit=crop", alt: "Rosie napping", width: 600, height: 600, order: 1 },
      { url: "https://images.unsplash.com/photo-1587764379990-58b3413b0e16?w=600&h=600&fit=crop", alt: "Rosie in the garden", width: 600, height: 600, order: 2 },
    ],
  },
  {
    title: "Bear",
    slug: "bear-bernese-mountain",
    breed: "Bernese Mountain Dog",
    age: "5 years",
    age_category: "adult",
    sex: "male",
    size: "extra-large",
    weight: 95,
    color: "Tricolor",
    status: "available",
    foster_location: "Boulder, CO",
    tagline: "A 95-pound teddy bear who thinks he fits in your lap",
    bio: "Bear is exactly what his name suggests — a big, warm, fluffy presence that makes everything feel cozier. This majestic Bernese came from a family that loved him dearly but had to move into a small apartment. Bear needs space to stretch his magnificent fluff.\n\nDespite his size, Bear is remarkably gentle. He moves through the house like a careful giant, stepping over toys and cat tails with surprising grace. He loves cool weather, slow hikes, and leaning his full weight against your legs while you pet him. If you have room in your home and heart for a giant gentleman, Bear is ready.",
    personality_traits: ["Gentle Giant", "Calm", "Affectionate", "Patient", "Fluffy"],
    energy_level: "low",
    good_with_dogs: true,
    good_with_cats: true,
    good_with_kids: true,
    house_trained: true,
    spayed_neutered: true,
    vaccinated: true,
    microchipped: true,
    adoption_fee: 350,
    date_added: "2025-03-27T00:00:00.000Z",
    photos: [
      { url: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=800&h=1000&fit=crop&q=80", alt: "Bear the Bernese Mountain Dog", width: 800, height: 1000, order: 0 },
      { url: "https://images.unsplash.com/photo-1530281700549-e82e7bf110d6?w=600&h=600&fit=crop", alt: "Bear playing in snow", width: 600, height: 600, order: 1 },
      { url: "https://images.unsplash.com/photo-1588022274642-f238f1f51b71?w=600&h=600&fit=crop", alt: "Bear resting", width: 600, height: 600, order: 2 },
    ],
  },
  {
    title: "Pepper",
    slug: "pepper-border-collie",
    breed: "Border Collie",
    age: "8 months",
    age_category: "puppy",
    sex: "female",
    size: "medium",
    weight: 30,
    color: "Black & White",
    status: "available",
    foster_location: "Bend, OR",
    tagline: "A brilliant puppy with energy to spare and tricks to learn",
    bio: "Pepper is eight months of pure Border Collie brilliance packed into a sleek black-and-white frame. She was born on a farm but showed more interest in chasing butterflies than sheep, so she's looking for a home that can appreciate her creative spirit.\n\nShe learns new tricks in minutes (she already has a repertoire of 12), gets the zoomies at exactly 5pm every day, and has an adorable habit of tilting her head when you talk to her like she's really, truly listening. Pepper needs an experienced owner who understands that a tired Border Collie is a happy Border Collie.",
    personality_traits: ["Brilliant", "Energetic", "Quick Learner", "Playful", "Curious"],
    energy_level: "high",
    good_with_dogs: true,
    good_with_kids: true,
    house_trained: false,
    spayed_neutered: true,
    vaccinated: true,
    microchipped: true,
    adoption_fee: 300,
    date_added: "2025-03-28T00:00:00.000Z",
    photos: [
      { url: "https://images.unsplash.com/photo-1503256207526-0d5d80fa2f47?w=800&h=1000&fit=crop&q=80", alt: "Pepper the Border Collie puppy", width: 800, height: 1000, order: 0 },
      { url: "https://images.unsplash.com/photo-1477884213360-7e9d7dcc8f9b?w=600&h=600&fit=crop&q=80", alt: "Pepper running", width: 600, height: 600, order: 1 },
      { url: "https://images.unsplash.com/photo-1568393691622-c7ba131d63b4?w=600&h=600&fit=crop", alt: "Pepper learning tricks", width: 600, height: 600, order: 2 },
    ],
  },
  {
    title: "Winston",
    slug: "winston-french-bulldog",
    breed: "French Bulldog",
    age: "4 years",
    age_category: "adult",
    sex: "male",
    size: "small",
    weight: 24,
    color: "Fawn",
    status: "pending",
    foster_location: "Los Angeles, CA",
    tagline: "A charming couch potato with a snore louder than his bark",
    bio: "Winston is a compact gentleman with impeccable manners and a fondness for the finer things in life — specifically, your couch, your bed, and whatever you're eating. He was surrendered when his owner's allergies became unmanageable, and he's been the star of his foster home ever since.\n\nHe's low-maintenance in the best way: a couple short walks a day, some playtime, and a warm spot to snooze and he's perfectly content. Winston does have some typical Frenchie quirks — he snores like a freight train and makes hilariously dramatic sounds when he yawns. He's currently pending adoption but we're accepting backup applications.",
    personality_traits: ["Charming", "Low-Key", "Funny", "Snuggly", "Well-Mannered"],
    energy_level: "low",
    good_with_dogs: true,
    good_with_cats: true,
    good_with_kids: true,
    house_trained: true,
    spayed_neutered: true,
    vaccinated: true,
    microchipped: true,
    adoption_fee: 400,
    date_added: "2025-03-29T00:00:00.000Z",
    photos: [
      { url: "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=800&h=1000&fit=crop&q=80", alt: "Winston the French Bulldog", width: 800, height: 1000, order: 0 },
      { url: "https://images.unsplash.com/photo-1575425186775-b8de9a427e67?w=600&h=600&fit=crop", alt: "Winston on the couch", width: 600, height: 600, order: 1 },
      { url: "https://images.unsplash.com/photo-1585559604959-6388fe69c92a?w=600&h=600&fit=crop", alt: "Winston yawning", width: 600, height: 600, order: 2 },
    ],
  },
  {
    title: "Sage",
    slug: "sage-greyhound",
    breed: "Greyhound",
    age: "3 years",
    age_category: "adult",
    sex: "female",
    size: "large",
    weight: 60,
    color: "Blue Fawn",
    status: "available",
    foster_location: "Portland, OR",
    tagline: "A graceful retired racer who's ready for the slow life",
    bio: "Sage spent her early years on the track, but now she's discovered the joy of doing absolutely nothing at impressive speed. This elegant greyhound is the definition of \"45 mph couch potato\" — she'll sprint joyfully for about five minutes, then sleep for the next five hours.\n\nShe's adjusting beautifully to home life. Stairs were a mystery at first (they don't have those at the track), but she's mastered them with the same grace she brings to everything. Sage is quiet, gentle, and has the most soulful eyes you've ever seen. She walks beautifully on leash and is content with two moderate walks per day.",
    personality_traits: ["Graceful", "Calm", "Elegant", "Quiet", "Sweet"],
    energy_level: "low",
    good_with_dogs: true,
    good_with_cats: false,
    good_with_kids: true,
    house_trained: true,
    spayed_neutered: true,
    vaccinated: true,
    microchipped: true,
    adoption_fee: 225,
    date_added: "2025-03-30T00:00:00.000Z",
    photos: [
      { url: "https://images.unsplash.com/photo-1534361960057-19889db9621e?w=800&h=1000&fit=crop", alt: "Sage the Greyhound", width: 800, height: 1000, order: 0 },
      { url: "https://images.unsplash.com/photo-1544568100-847a948585b9?w=600&h=600&fit=crop", alt: "Sage lounging", width: 600, height: 600, order: 1 },
      { url: "https://images.unsplash.com/photo-1535930749574-1399327ce78f?w=600&h=600&fit=crop", alt: "Sage on a walk", width: 600, height: 600, order: 2 },
    ],
  },
  {
    title: "Ziggy",
    slug: "ziggy-dachshund",
    breed: "Dachshund",
    age: "10 months",
    age_category: "puppy",
    sex: "male",
    size: "small",
    weight: 11,
    color: "Red",
    status: "available",
    foster_location: "Nashville, TN",
    tagline: "Tiny legs, huge personality, and a nose that never quits",
    bio: "Ziggy is ten months of dachshund determination in a long, low-rider body. He was found wandering a parking lot with no collar or chip, but his confident strut suggested he'd been on quite the adventure.\n\nThis little guy has a nose that could find a treat hidden in a vault. He's endlessly curious, surprisingly brave for his size, and has a bark that will make you laugh — it's about four sizes too big for him. Ziggy loves burrowing under blankets, chasing squeaky toys, and supervising everything from the highest spot he can reach (which admittedly isn't very high).",
    personality_traits: ["Bold", "Curious", "Funny", "Determined", "Snuggler"],
    energy_level: "moderate",
    good_with_dogs: true,
    good_with_kids: true,
    house_trained: false,
    spayed_neutered: true,
    vaccinated: true,
    microchipped: false,
    adoption_fee: 275,
    date_added: "2025-03-31T00:00:00.000Z",
    photos: [
      { url: "https://images.unsplash.com/photo-1612195583950-b8fd34c87093?w=800&h=1000&fit=crop", alt: "Ziggy the Dachshund", width: 800, height: 1000, order: 0 },
      { url: "https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=600&h=600&fit=crop", alt: "Ziggy playing", width: 600, height: 600, order: 1 },
      { url: "https://images.unsplash.com/photo-1517849845537-4d257902454a?w=600&h=600&fit=crop", alt: "Ziggy close-up", width: 600, height: 600, order: 2 },
    ],
  },
];

// ─── Home page entry ─────────────────────────────────────────────────────────

const homePageEntry = {
  title: "FurEver Friends - Home",
  url: "/",
  hero_heading: "Find your new best friend.",
  hero_description:
    "Give a dog a forever home. Browse our adoptable dogs and start your journey today.",
  hero_image_url:
    "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=1200&h=700&fit=crop",
  hero_cta_text: "Browse Dogs",
  hero_cta_link: "/dogs",
  featured_dogs_heading: "Meet a few of our friends",
  categories: [
    {
      title: "Puppies",
      description: "Young pups ready for their first home",
      icon: "baby",
      href: "/dogs?ageCategory=puppy",
    },
    {
      title: "Small Dogs",
      description: "Compact companions for any space",
      icon: "dog",
      href: "/dogs?size=small",
    },
    {
      title: "Calm & Gentle",
      description: "Relaxed dogs perfect for a quiet lifestyle",
      icon: "heart",
      href: "/dogs?energyLevel=low",
    },
    {
      title: "Ready Today",
      description: "Dogs available for immediate adoption",
      icon: "home",
      href: "/dogs?status=available",
    },
  ],
  how_it_works: [
    {
      number: 1,
      title: "Browse",
      description: "Explore our dogs and find your perfect match",
      icon: "search",
    },
    {
      number: 2,
      title: "Apply",
      description: "Submit a quick adoption application",
      icon: "file-text",
    },
    {
      number: 3,
      title: "Welcome Home",
      description: "Pick up your new family member",
      icon: "home",
    },
  ],
};

// ─── Main migration ──────────────────────────────────────────────────────────

async function createContentType(schema: unknown, name: string) {
  console.log(`Creating content type: ${name}...`);
  const res = await fetch(`${BASE_URL}/content_types`, {
    method: "POST",
    headers,
    body: JSON.stringify(schema),
  });
  const json = await res.json();
  if (!res.ok) {
    const msg = JSON.stringify(json);
    if (msg.includes("not unique") || msg.includes("already exists")) {
      console.log(`  ${name} already exists, skipping`);
      return;
    }
    console.error(`  Failed:`, json);
    throw new Error(`Failed to create ${name}`);
  }
  console.log(`  Created ${name}`);
}

async function createEntry(
  contentTypeUid: string,
  entry: Record<string, unknown>
): Promise<string> {
  const result = (await api(
    "POST",
    `/content_types/${contentTypeUid}/entries`,
    { entry }
  )) as { entry: { uid: string } };
  return result.entry.uid;
}

async function publishEntry(contentTypeUid: string, entryUid: string) {
  await api(
    "POST",
    `/content_types/${contentTypeUid}/entries/${entryUid}/publish`,
    {
      entry: {
        environments: [ENVIRONMENT],
        locales: ["en-us"],
      },
    }
  );
}

async function main() {
  console.log("=== Contentstack Migration ===\n");

  // 1. Create content types (dog first since home_page references it)
  await createContentType(dogContentType, "dog");
  await sleep(1000);
  await createContentType(homePageContentType, "home_page");
  await sleep(1000);

  // 2. Create dog entries
  console.log("\nCreating dog entries...");
  const dogUids: Record<string, string> = {};
  for (const dog of dogs) {
    try {
      const uid = await createEntry("dog", dog);
      dogUids[dog.slug] = uid;
      console.log(`  Created ${dog.title} (${uid})`);
      await sleep(500); // rate limit
    } catch (e) {
      console.error(`  Failed to create ${dog.title}:`, e);
    }
  }

  // 3. Create home page entry with featured dog references
  console.log("\nCreating home page entry...");
  // Feature the 3 most recent dogs (Ziggy, Sage, Winston by date_added)
  const featuredSlugs = ["ziggy-dachshund", "sage-greyhound", "pepper-border-collie"];
  const featuredRefs = featuredSlugs
    .map((slug) => dogUids[slug])
    .filter(Boolean)
    .map((uid) => ({ uid, _content_type_uid: "dog" }));

  const homeEntry = {
    ...homePageEntry,
    featured_dogs: featuredRefs,
  };

  let homeUid: string | undefined;
  try {
    homeUid = await createEntry("home_page", homeEntry);
    console.log(`  Created home page (${homeUid})`);
  } catch (e) {
    console.error("  Failed to create home page:", e);
  }

  // 4. Publish all entries
  console.log("\nPublishing entries...");
  for (const [name, uid] of Object.entries(dogUids)) {
    try {
      await publishEntry("dog", uid);
      console.log(`  Published ${name}`);
      await sleep(300);
    } catch (e) {
      console.error(`  Failed to publish ${name}:`, e);
    }
  }

  if (homeUid) {
    try {
      await publishEntry("home_page", homeUid);
      console.log("  Published home page");
    } catch (e) {
      console.error("  Failed to publish home page:", e);
    }
  }

  console.log("\n=== Migration complete ===");
}

main().catch(console.error);
