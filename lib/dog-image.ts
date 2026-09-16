import type { DogEntry } from "@/lib/contentstack";

// Alt text for dog images is derived on the frontend (the CMS stores only
// URLs). Kept in its own side-effect-free module so client components can
// import it without pulling in the Contentstack SDK initialization.
export function dogImageAlt(dog: Pick<DogEntry, "title" | "breed">): string {
  return dog.breed ? `${dog.title}, a ${dog.breed}` : dog.title;
}
