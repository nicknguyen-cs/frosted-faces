import type { EditableTags } from "@/lib/contentstack";
import BackToDogsLink from "./BackToDogsLink";

type ProfileHeroProps = {
  photo: { url: string; alt: string };
  status: string;
  editTags?: EditableTags;
};

const statusColors: Record<string, string> = {
  available: "bg-emerald-600 text-white",
  pending: "bg-amber text-charcoal",
  adopted: "bg-terracotta text-white",
};

export default function ProfileHero({ photo, status, editTags }: ProfileHeroProps) {
  return (
    <div>
      <BackToDogsLink />

      <div className="relative">
        <img
          src={photo.url}
          alt={photo.alt}
          className="w-full max-h-[70vh] object-cover rounded-3xl"
        />
        <span
          className={`absolute bottom-4 left-4 px-4 py-1.5 rounded-full text-sm font-medium capitalize ${
            statusColors[status] ?? statusColors.available
          }`}
          {...(editTags && editTags.status)}
        >
          {status}
        </span>
      </div>
    </div>
  );
}
