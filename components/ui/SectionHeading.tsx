import Link from "next/link";
import type { EditableTags } from "@/lib/contentstack";

type SectionHeadingProps = {
  title: string;
  subtitle?: string;
  seeAllHref?: string;
  seeAllLabel?: string;
  className?: string;
  editTags?: EditableTags;
};

export default function SectionHeading({
  title,
  subtitle,
  seeAllHref,
  seeAllLabel = "See all",
  className = "",
  editTags,
}: SectionHeadingProps) {
  return (
    <div className={`flex items-end justify-between gap-4 ${className}`}>
      <div>
        <h2
          className="font-heading text-2xl font-bold text-charcoal md:text-3xl"
          {...(editTags && editTags.title)}
        >
          {title}
        </h2>
        {subtitle && (
          <p className="mt-1 text-sm text-pebble font-body md:text-base">
            {subtitle}
          </p>
        )}
      </div>

      {seeAllHref && (
        <Link
          href={seeAllHref}
          className="shrink-0 text-sm font-medium text-terracotta hover:text-terracotta-dark transition-colors"
        >
          {seeAllLabel} &rarr;
        </Link>
      )}
    </div>
  );
}
