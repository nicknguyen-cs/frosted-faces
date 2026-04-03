import { Shield, Syringe, Scan } from "lucide-react";
import type { EditableTags } from "@/lib/contentstack";

type MedicalBadgesProps = {
  spayedNeutered: boolean;
  vaccinated: boolean;
  microchipped: boolean;
  specialNeeds?: string | null;
  editTags?: EditableTags;
};

export default function MedicalBadges({
  spayedNeutered,
  vaccinated,
  microchipped,
  specialNeeds,
  editTags,
}: MedicalBadgesProps) {
  const badges = [
    { show: spayedNeutered, icon: Shield, label: "Spayed / Neutered" },
    { show: vaccinated, icon: Syringe, label: "Vaccinated" },
    { show: microchipped, icon: Scan, label: "Microchipped" },
  ].filter((b) => b.show);

  if (badges.length === 0 && !specialNeeds) return null;

  return (
    <div>
      <h3 className="font-heading text-lg font-semibold text-charcoal mb-3">
        Medical
      </h3>

      {badges.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {badges.map(({ icon: Icon, label }) => (
            <span
              key={label}
              className="inline-flex items-center gap-1.5 rounded-full bg-sage-light/20 px-4 py-1.5 text-sm font-medium text-sage"
            >
              <Icon className="h-4 w-4" />
              {label}
            </span>
          ))}
        </div>
      )}

      {specialNeeds && (
        <p
          className="mt-3 rounded-2xl bg-amber/10 px-4 py-3 text-sm text-charcoal"
          {...(editTags && editTags.special_needs)}
        >
          <span className="font-medium">Special needs:</span> {specialNeeds}
        </p>
      )}
    </div>
  );
}
