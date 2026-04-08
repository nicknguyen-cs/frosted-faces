import TrackClick from "@/components/tracking/TrackClick";
import type { EditableTags } from "@/lib/contentstack";

type AdoptionCTAProps = {
  name: string;
  adoptionFee: number;
  editTags?: EditableTags;
};

export default function AdoptionCTA({ name, adoptionFee, editTags }: AdoptionCTAProps) {
  return (
    <div id="adoption-cta" className="flex flex-wrap items-center gap-4">
      <TrackClick event="adoption_cta_clicked" data={{ dog_name: name, adoption_fee: adoptionFee }}>
        <a
          href="#inquiry"
          className="inline-flex items-center justify-center rounded-full bg-terracotta px-7 py-3 text-base font-medium text-white transition-colors hover:bg-terracotta-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-terracotta"
        >
          Apply to Adopt {name}
        </a>
      </TrackClick>
      <span className="text-sm text-pebble">
        Adoption fee:{" "}
        <span
          className="font-semibold text-charcoal"
          {...(editTags && editTags.adoption_fee)}
        >
          ${adoptionFee.toFixed(0)}
        </span>
      </span>
    </div>
  );
}
