import type { DogEntry, EditableTags } from "@/lib/contentstack";
import DogCard from "@/components/dogs/DogCard";
import SectionHeading from "@/components/ui/SectionHeading";

interface FeaturedDogsProps {
  dogs: DogEntry[];
  heading?: string;
  editTags?: EditableTags;
}

export default function FeaturedDogs({ dogs, heading, editTags }: FeaturedDogsProps) {
  return (
    <div className="space-y-6">
      <SectionHeading
        title={heading || ""}
        editTags={editTags}
        seeAllHref="/dogs"
        seeAllLabel="See all"
      />
      {dogs.length > 0 && (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {dogs.map((dog) => (
            <DogCard key={dog.uid} dog={dog} />
          ))}
        </div>
      )}
    </div>
  );
}
