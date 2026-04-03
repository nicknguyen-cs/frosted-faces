import { Calendar, Weight, Ruler, Heart, Clock } from "lucide-react";
import type { EditableTags } from "@/lib/contentstack";

type QuickFactsProps = {
  age: string;
  weight: number;
  size: string;
  sex: string;
  breed: string;
  breedSecondary?: string | null;
  color: string;
  fosterLocation?: string | null;
  intakeDate?: string | null;
  editTags?: EditableTags;
};

const facts = [
  { key: "age", icon: Calendar, label: "Age" },
  { key: "weight", icon: Weight, label: "Weight" },
  { key: "size", icon: Ruler, label: "Size" },
  { key: "sex", icon: Heart, label: "Sex" },
] as const;

export default function QuickFacts({
  age,
  weight,
  size,
  sex,
  breed,
  breedSecondary,
  color,
  fosterLocation,
  intakeDate,
  editTags,
}: QuickFactsProps) {
  const values: Record<string, string> = {
    age,
    weight: `${weight} lbs`,
    size,
    sex,
  };

  return (
    <div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {facts.map(({ key, icon: Icon, label }) => (
          <div
            key={key}
            className="flex flex-col items-center gap-2 rounded-2xl bg-sand-100 px-4 py-5 text-center"
          >
            <Icon className="h-5 w-5 text-terracotta" />
            <span className="text-xs font-medium uppercase tracking-wide text-pebble">
              {label}
            </span>
            <span
              className="text-sm font-semibold text-charcoal capitalize"
              {...(editTags && editTags[key])}
            >
              {values[key]}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-4 space-y-1 text-sm text-stone">
        <p>
          <span className="font-medium text-charcoal">Breed:</span>{" "}
          <span {...(editTags && editTags.breed)}>{breed}</span>
          {breedSecondary ? ` / ${breedSecondary}` : ""}
        </p>
        <p>
          <span className="font-medium text-charcoal">Color:</span>{" "}
          <span {...(editTags && editTags.color)}>{color}</span>
        </p>
        {fosterLocation && (
          <p>
            <span className="font-medium text-charcoal">Location:</span>{" "}
            <span {...(editTags && editTags.foster_location)}>{fosterLocation}</span>
          </p>
        )}
        {intakeDate && (
          <p>
            <span className="font-medium text-charcoal">In shelter since:</span>{" "}
            <span {...(editTags && editTags.intake_date)}>
              {new Date(intakeDate).toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </span>
          </p>
        )}
      </div>
    </div>
  );
}
