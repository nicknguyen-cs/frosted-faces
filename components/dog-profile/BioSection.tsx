import type { EditableTags } from "@/lib/contentstack";

type BioSectionProps = {
  name: string;
  bio: string;
  editTags?: EditableTags;
};

export default function BioSection({ name, bio, editTags }: BioSectionProps) {
  const paragraphs = bio.split("\n\n").filter(Boolean);

  return (
    <div>
      <h3 className="font-heading text-lg font-semibold text-charcoal mb-3">
        About {name}
      </h3>

      <div className="max-w-prose space-y-4" {...(editTags && editTags.bio)}>
        {paragraphs.map((paragraph, i) => (
          <p key={i} className="text-stone leading-relaxed">
            {paragraph}
          </p>
        ))}
      </div>
    </div>
  );
}
