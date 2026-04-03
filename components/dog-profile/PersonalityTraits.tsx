import type { EditableTags } from "@/lib/contentstack";

type PersonalityTraitsProps = {
  personalityTraits: string | string[];
  energyLevel: string;
  editTags?: EditableTags;
};

const energyDots: Record<string, number> = {
  low: 1,
  moderate: 2,
  high: 3,
};

export default function PersonalityTraits({
  personalityTraits,
  energyLevel,
  editTags,
}: PersonalityTraitsProps) {
  const traits: string[] = Array.isArray(personalityTraits)
    ? personalityTraits
    : personalityTraits
      ? JSON.parse(personalityTraits)
      : [];
  const filled = energyDots[energyLevel] ?? 1;

  return (
    <div className="space-y-5">
      <h3 className="font-heading text-lg font-semibold text-charcoal">
        Personality
      </h3>

      <div className="flex flex-wrap gap-2" {...(editTags && editTags.personality_traits)}>
        {traits.map((trait) => (
          <span
            key={trait}
            className="rounded-full bg-sage-light/30 px-4 py-1.5 text-sm font-medium text-sage"
          >
            {trait}
          </span>
        ))}
      </div>

      <div className="flex items-center gap-3">
        <span className="text-sm font-medium text-charcoal">Energy level</span>
        <div className="flex gap-1.5">
          {[1, 2, 3].map((dot) => (
            <span
              key={dot}
              className={`h-3 w-3 rounded-full ${
                dot <= filled ? "bg-terracotta" : "bg-sand-200"
              }`}
            />
          ))}
        </div>
        <span className="text-sm capitalize text-pebble" {...(editTags && editTags.energy_level)}>{energyLevel}</span>
      </div>
    </div>
  );
}
