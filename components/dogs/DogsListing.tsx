"use client";

import { useState, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import type { DogEntry } from "@/lib/contentstack";
import DogCard from "./DogCard";
import DogGrid from "./DogGrid";
import FilterBar from "./FilterBar";
import EmptyState from "./EmptyState";

interface DogsListingProps {
  dogs: DogEntry[];
}

export default function DogsListing({ dogs }: DogsListingProps) {
  const searchParams = useSearchParams();
  const router = useRouter();

  const filters = {
    size: searchParams.get("size") ?? "",
    ageCategory: searchParams.get("ageCategory") ?? "",
    energyLevel: searchParams.get("energyLevel") ?? "",
  };

  const filtered = useMemo(() => {
    return dogs.filter((dog) => {
      if (filters.size && dog.size !== filters.size.toLowerCase()) return false;
      if (filters.ageCategory && dog.age_category !== filters.ageCategory.toLowerCase()) return false;
      if (filters.energyLevel && dog.energy_level !== filters.energyLevel.toLowerCase()) return false;
      return true;
    });
  }, [dogs, filters.size, filters.ageCategory, filters.energyLevel]);

  const availableValues = useMemo(() => ({
    size: new Set(dogs.map((d) => d.size)),
    ageCategory: new Set(dogs.map((d) => d.age_category)),
    energyLevel: new Set(dogs.map((d) => d.energy_level)),
  }), [dogs]);

  function handleFilter(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "All" || params.get(key) === value) {
      params.delete(key);
    } else {
      params.set(key, value);
      window.dataLayer?.push({ event: "filter_applied", filter_type: key, filter_value: value.toLowerCase() });
    }
    const qs = params.toString();
    router.push(qs ? `/dogs?${qs}` : "/dogs");
  }

  function clearAll() {
    router.push("/dogs");
  }

  return (
    <>
      <div className="mb-10">
        <h1 className="font-heading text-4xl font-bold text-charcoal">
          Our Dogs
        </h1>
        <p className="mt-2 text-pebble">
          {filtered.length} friend{filtered.length !== 1 && "s"} looking for a home
        </p>
      </div>

      <div className="mb-10">
        <FilterBar
          availableValues={availableValues}
          onFilter={handleFilter}
          onClear={clearAll}
          activeFilters={filters}
        />
      </div>

      {filtered.length > 0 ? (
        <DogGrid>
          {filtered.map((dog) => (
            <DogCard key={dog.uid} dog={dog} />
          ))}
        </DogGrid>
      ) : (
        <EmptyState />
      )}
    </>
  );
}
