import { Check, X, HelpCircle } from "lucide-react";
import type { EditableTags } from "@/lib/contentstack";

type CompatibilityChartProps = {
  goodWithDogs?: string;
  goodWithCats?: string;
  goodWithKids?: string;
  houseTrained?: string;
  editTags?: EditableTags;
};

const items = [
  { key: "goodWithDogs", cslpKey: "good_with_dogs", label: "dogs" },
  { key: "goodWithCats", cslpKey: "good_with_cats", label: "cats" },
  { key: "goodWithKids", cslpKey: "good_with_kids", label: "kids" },
  { key: "houseTrained", cslpKey: "house_trained", label: "house trained" },
] as const;

function Row({ label, value }: { label: string; value?: string }) {
  if (value === "yes") {
    return (
      <div className="flex items-center gap-2.5">
        <Check className="h-5 w-5 text-sage" />
        <span className="text-sm text-charcoal">
          {label === "house trained" ? "House trained" : `Good with ${label}`}
        </span>
      </div>
    );
  }

  if (value === "no") {
    return (
      <div className="flex items-center gap-2.5">
        <X className="h-5 w-5 text-terracotta" />
        <span className="text-sm text-charcoal">
          {label === "house trained"
            ? "Not house trained"
            : `Not good with ${label}`}
        </span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2.5">
      <HelpCircle className="h-5 w-5 text-pebble" />
      <span className="text-sm text-pebble">
        {label === "house trained"
          ? "House training unknown"
          : `Unknown with ${label}`}
      </span>
    </div>
  );
}

export default function CompatibilityChart(props: CompatibilityChartProps) {
  return (
    <div>
      <h3 className="font-heading text-lg font-semibold text-charcoal mb-3">
        Compatibility
      </h3>

      <ul className="space-y-2.5">
        {items.map(({ key, cslpKey, label }) => (
          <li key={key} {...(props.editTags && props.editTags[cslpKey])}>
            <Row label={label} value={props[key]} />
          </li>
        ))}
      </ul>
    </div>
  );
}
