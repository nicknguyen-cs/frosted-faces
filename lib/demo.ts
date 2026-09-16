import type { DogEntry } from "@/lib/contentstack";

// The adopter question used for the before/after LLM-as-judge demo. It targets
// facts that the generated SEO/AEO/GEO layer makes explicit (good-with-kids +
// adoption fee) but that the raw page prose usually leaves ambiguous.
export function dogDemoQuestion(dog: DogEntry): string {
  return `I have two young kids at home and I'm on a tight budget. Is ${dog.title} a good fit for a family with children, and how much would it cost to adopt ${dog.title}?`;
}

// "Before": the unstructured page text an engine sees without any SEO/AEO/GEO
// layer — just the visible prose. The model has to infer, and usually can't
// confirm the fee or kid-compatibility.
export function buildBeforePrompt(dog: DogEntry): string {
  const q = dogDemoQuestion(dog);
  const prose = [dog.tagline, dog.bio].filter(Boolean).join("\n\n");
  return [
    `You are an AI search assistant answering a question about an adoptable dog.`,
    ``,
    `User question:`,
    `"${q}"`,
    ``,
    `Below is the ONLY information available from this dog's web page. It is`,
    `unstructured page text — there is no metadata, summary, FAQ, or structured`,
    `data of any kind.`,
    ``,
    `--- PAGE TEXT (${dog.title}) ---`,
    prose,
    `--- END PAGE TEXT ---`,
    ``,
    `Answer the user's question using ONLY the information above. If the page`,
    `does not clearly state something, say that the information isn't available`,
    `on the page.`,
  ].join("\n");
}

// "After": the structured data the optimized page exposes (schema.org Product
// facts + AI summary + FAQ). The model can answer directly and cite each fact.
export function buildAfterPrompt(dog: DogEntry): string {
  const q = dogDemoQuestion(dog);
  const seo = dog.seo ?? {};

  const facts: [string, string | number | undefined][] = [
    ["Name", dog.title],
    ["Breed", [dog.breed, dog.breed_secondary].filter(Boolean).join(" / ")],
    ["Age", dog.age],
    ["Sex", dog.sex],
    ["Size", dog.weight ? `${dog.size}, ${dog.weight} lb` : dog.size],
    ["Location", dog.foster_location],
    ["Adoption fee (USD)", dog.adoption_fee],
    ["Availability", dog.status],
    ["Good with kids", dog.good_with_kids],
    ["Good with dogs", dog.good_with_dogs],
    ["Good with cats", dog.good_with_cats],
    ["House-trained", dog.house_trained],
    ["Vaccinated", dog.vaccinated ? "yes" : undefined],
    ["Spayed/neutered", dog.spayed_neutered ? "yes" : undefined],
  ];
  const factLines = facts
    .filter(([, v]) => v !== undefined && v !== "" && v !== "unknown")
    .map(([k, v]) => `- ${k}: ${v}`);

  const lines: string[] = [
    `You are an AI search assistant answering a question about an adoptable dog.`,
    ``,
    `User question:`,
    `"${q}"`,
    ``,
    `Below is the STRUCTURED DATA this dog's web page exposes to search and AI`,
    `engines (schema.org Product/Offer, an AI summary, and an FAQ).`,
    ``,
    `--- ENTITY FACTS (${dog.title}) ---`,
    ...factLines,
  ];

  if (seo.ai_summary) {
    lines.push(``, `--- AI SUMMARY ---`, seo.ai_summary);
  }

  const faqs = (seo.faqs ?? []).filter((f) => f.question && f.answer);
  if (faqs.length) {
    lines.push(``, `--- FAQ ---`);
    for (const f of faqs) lines.push(`Q: ${f.question}`, `A: ${f.answer}`, ``);
  }

  lines.push(
    `--- END DATA ---`,
    ``,
    `Answer the user's question using ONLY the information above, and cite the`,
    `specific fact(s) you used.`
  );

  return lines.join("\n");
}
