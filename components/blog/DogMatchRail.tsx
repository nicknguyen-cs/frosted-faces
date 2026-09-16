import Link from "next/link";
import DogCard from "@/components/dogs/DogCard";
import type { DogEntry } from "@/lib/contentstack";

interface DogMatchRailProps {
  /** The post's `associated_dogs` reference, populated by AgentOS. */
  dogs?: DogEntry[];
  /** Optional heading override. */
  heading?: string;
}

// The live "available right now" rail for a blog post. The reference is curated
// by the AgentOS agent, but we filter to status:"available" at render time so a
// dog adopted between agent runs drops off immediately — the query is the
// freshness floor, the agent is the ceiling.
export default function DogMatchRail({ dogs, heading }: DogMatchRailProps) {
  const available = (dogs ?? []).filter((d) => d?.status === "available");

  if (available.length === 0) return null;

  return (
    <section className="mt-16 border-t border-sand-200 bg-sand-50/60">
      <div className="mx-auto max-w-3xl px-5 py-14">
        <div className="text-center mb-9">
          <p className="font-heading text-xs font-bold text-terracotta uppercase tracking-[0.15em] mb-2">
            From this story
          </p>
          <h2 className="font-heading text-2xl md:text-3xl font-bold text-charcoal">
            {heading || "Looking for a home right now"}
          </h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-5">
          {available.map((dog) => (
            <DogCard key={dog.uid} dog={dog} />
          ))}
        </div>

        <div className="mt-10 text-center">
          <Link
            href="/dogs"
            className="inline-block rounded-full border border-sand-200 bg-white px-6 py-3 font-heading text-sm font-semibold text-charcoal hover:border-terracotta hover:text-terracotta transition-colors"
          >
            See all adoptable dogs
          </Link>
        </div>
      </div>
    </section>
  );
}
