import Link from "next/link";
import type { DogEntry } from "@/lib/contentstack";

interface DogCardProps {
  dog: DogEntry;
}

export default function DogCard({ dog }: DogCardProps) {
  const primaryPhoto = [...(dog.photos || [])]
    .sort((a, b) => a.order - b.order)
    .at(0);

  const showBadge = dog.status === "pending" || dog.status === "adopted";

  return (
    <Link href={`/dogs/${dog.slug}`} className="group block">
      <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-sand-200">
        {primaryPhoto && (
          <img
            src={primaryPhoto.url}
            alt={primaryPhoto.alt}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
          />
        )}

        {/* Status badge */}
        {showBadge && (
          <span className="absolute top-3 right-3 rounded-full bg-amber px-3 py-1 text-xs font-medium text-white capitalize">
            {dog.status}
          </span>
        )}

        {/* Tagline overlay on hover */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 translate-y-2 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
          <div className="bg-gradient-to-t from-black/70 to-transparent px-4 pt-10 pb-4">
            <p className="text-sm text-white font-body">{dog.tagline}</p>
          </div>
        </div>
      </div>

      <div className="mt-3 space-y-1">
        <h3
          className="font-heading font-semibold text-lg text-charcoal"
          {...(dog.$ && dog.$.title)}
        >
          {dog.title}
        </h3>
        <p className="text-sm text-pebble" {...(dog.$ && dog.$.breed)}>
          {dog.breed} &middot; {dog.age}
        </p>
        <span className="inline-block rounded-full bg-sage-light/30 px-2.5 py-0.5 text-xs font-medium text-sage">
          {dog.size}
        </span>
      </div>
    </Link>
  );
}
