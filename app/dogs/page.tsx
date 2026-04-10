export const dynamic = "force-dynamic";

import { Suspense } from "react";
import { getDogs } from "@/lib/contentstack";
import DogCard from "@/components/dogs/DogCard";
import DogGrid from "@/components/dogs/DogGrid";
import FilterBar from "@/components/dogs/FilterBar";
import EmptyState from "@/components/dogs/EmptyState";


interface PageProps {
  searchParams: Promise<{
    size?: string;
    ageCategory?: string;
    energyLevel?: string;
    live_preview?: string;
    entry_uid?: string;
    content_type_uid?: string;
  }>;
}

export default async function DogsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const { size, ageCategory, energyLevel, live_preview, entry_uid, content_type_uid } = params;

  const previewParams = { live_preview, entry_uid, content_type_uid };

  // Fetch all dogs (unfiltered) to compute which filter values exist,
  // then fetch filtered results for display
  const [allDogs, filtered] = await Promise.all([
    getDogs(undefined, previewParams),
    getDogs({ size, ageCategory, energyLevel }, previewParams),
  ]);

  const availableValues = {
    size: new Set(allDogs.dogs.map((d) => d.size)),
    ageCategory: new Set(allDogs.dogs.map((d) => d.age_category)),
    energyLevel: new Set(allDogs.dogs.map((d) => d.energy_level)),
  };

  const { dogs, count } = filtered;

  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-10">
        <h1 className="font-heading text-4xl font-bold text-charcoal">
          Our Dogs
        </h1>
        <p className="mt-2 text-pebble">
          {count} friend{count !== 1 && "s"} looking for a home
        </p>
      </div>

      <div className="mb-10">
        <Suspense fallback={null}>
          <FilterBar availableValues={availableValues} />
        </Suspense>
      </div>

      {dogs.length > 0 ? (
        <DogGrid>
          {dogs.map((dog) => (
            <DogCard key={dog.uid} dog={dog} />
          ))}
        </DogGrid>
      ) : (
        <EmptyState />
      )}
    </section>
  );
}
