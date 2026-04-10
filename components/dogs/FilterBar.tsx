"use client";

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
  activeFilters: {
    size: string;
    ageCategory: string;
    energyLevel: string;
  };
  onFilter: (key: string, value: string) => void;
  onClear: () => void;
};

export default function FilterBar({ availableValues, activeFilters, onFilter, onClear }: FilterBarProps) {
  const activeCount = Object.values(activeFilters).filter(Boolean).length;

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
                onClick={() => onFilter(group.key, option)}
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
            onClick={onClear}
            className="text-sm text-terracotta hover:text-terracotta-dark underline cursor-pointer transition"
          >
            Clear all
          </button>
        </div>
      )}
    </div>
  );
}
