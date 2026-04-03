import Link from "next/link";
import { Baby, Dog, Heart, Home, type LucideIcon } from "lucide-react";
import SectionHeading from "@/components/ui/SectionHeading";
import Container from "@/components/layout/Container";
import type { EditableTags } from "@/lib/contentstack";

const iconMap: Record<string, LucideIcon> = {
  baby: Baby,
  dog: Dog,
  heart: Heart,
  home: Home,
};


interface CategoryItem {
  title: string;
  description: string;
  icon: string;
  href: string;
  $?: EditableTags;
}

interface CategoryBrowserProps {
  categories?: CategoryItem[];
  editTags?: EditableTags;
}

export default function CategoryBrowser({ categories, editTags }: CategoryBrowserProps) {
  const items = categories ?? [];

  return (
    <section className="bg-sand-200 py-14">
      <Container>
        <div className="space-y-6">
          <SectionHeading title="Browse by type" />
          <div
            className="grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-6"
            {...(editTags && editTags.categories)}
          >
            {items.length === 0 && (
              <div className="col-span-full rounded-2xl border-2 border-dashed border-sand-200/60 p-8 text-center text-sm text-pebble">
                Add categories to browse by type
              </div>
            )}
            {items.map((cat, index) => {
              const Icon = iconMap[cat.icon] || Dog;
              return (
                <Link
                  key={cat.title}
                  href={cat.href}
                  className="rounded-2xl bg-white p-6 pb-8 shadow-sm transition-all hover:bg-sand-50 hover:shadow-md"
                  {...(editTags && editTags[`categories__${index}`])}
                >
                  <Icon size={40} className="text-terracotta" />
                  <h3
                    className="mt-4 font-heading text-lg font-semibold text-charcoal"
                    {...(cat.$ && cat.$.title)}
                  >
                    {cat.title}
                  </h3>
                  <p
                    className="mt-1 text-sm text-pebble font-body"
                    {...(cat.$ && cat.$.description)}
                  >
                    {cat.description}
                  </p>
                </Link>
              );
            })}
          </div>
        </div>
      </Container>
    </section>
  );
}
