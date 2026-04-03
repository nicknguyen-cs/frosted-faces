"use client";

import { useSearchParams, useRouter } from "next/navigation";
import FilterPill from "./FilterPill";

const FILTER_GROUPS = [
  {
    key: "size",
    label: "Size",
    options: ["All", "Small", "Medium", "Large", "Extra-Large"],
  },
  {
    key: "ageCategory",
    label: "Age",
    options: ["All", "Puppy", "Young", "Adult", "Senior"],
  },
  {
    key: "energyLevel",
    label: "Energy",
    options: ["All", "Low", "Moderate", "High"],
  },
] as const;

type FilterBarProps = {
  availableValues?: {
    size: Set<string>;
    ageCategory: Set<string>;
    energyLevel: Set<string>;
  };
};

export default function FilterBar({ availableValues }: FilterBarProps) {
  const searchParams = useSearchParams();
  const router = useRouter();

  const activeFilters = {
    size: searchParams.get("size") ?? "",
    ageCategory: searchParams.get("ageCategory") ?? "",
    energyLevel: searchParams.get("energyLevel") ?? "",
  };

  const activeCount = Object.values(activeFilters).filter(Boolean).length;

  function handleToggle(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "All" || params.get(key) === value) {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    router.push(`/dogs?${params.toString()}`);
  }

  function clearAll() {
    router.push("/dogs");
  }

  return (
    <div className="space-y-4">
      {FILTER_GROUPS.map((group) => (
        <div key={group.key} className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium text-charcoal mr-1">
            {group.label}:
          </span>
          {group.options.map((option) => {
            const filterKey = group.key as keyof typeof activeFilters;
            const isActive =
              option === "All"
                ? !activeFilters[filterKey]
                : activeFilters[filterKey] === option;
            const isDisabled =
              option !== "All" &&
              availableValues !== undefined &&
              !availableValues[filterKey]?.has(option.toLowerCase());
            return (
              <FilterPill
                key={option}
                label={option}
                active={isActive}
                disabled={isDisabled}
                onClick={() => handleToggle(group.key, option)}
              />
            );
          })}
        </div>
      ))}

      {activeCount > 0 && (
        <div className="flex items-center gap-3 pt-1">
          <span className="text-sm text-pebble">
            {activeCount} filter{activeCount !== 1 && "s"} active
          </span>
          <button
            onClick={clearAll}
            className="text-sm text-terracotta hover:text-terracotta-dark underline cursor-pointer transition"
          >
            Clear all
          </button>
        </div>
      )}
    </div>
  );
}
