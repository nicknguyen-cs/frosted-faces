export const dynamic = "force-dynamic";

import Link from "next/link";
import type { Metadata } from "next";
import { getBlogPosts } from "@/lib/contentstack";
import type { LivePreviewParams } from "@/lib/contentstack";
import Container from "@/components/layout/Container";

export const metadata: Metadata = {
  title: "Blog — Frosted Faces Foundation",
  description:
    "Guides and stories on adopting and caring for senior dogs, with dogs available for adoption right now.",
};

interface PageProps {
  searchParams: Promise<LivePreviewParams>;
}

function formatDate(iso?: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default async function BlogIndexPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const posts = await getBlogPosts(params);

  return (
    <Container className="py-12 md:py-16">
      <header className="max-w-2xl mb-12">
        <p className="font-heading text-sm font-bold text-terracotta uppercase tracking-wider mb-3">
          Frosted Faces Journal
        </p>
        <h1 className="font-heading text-4xl md:text-5xl font-bold text-charcoal">
          Stories &amp; guides
        </h1>
        <p className="mt-4 font-reading text-xl leading-relaxed text-stone">
          Evergreen guides on adopting and caring for senior dogs — each one
          linked to dogs looking for a home right now.
        </p>
      </header>

      {posts.length === 0 ? (
        <p className="text-stone">No posts yet. Check back soon.</p>
      ) : (
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => {
            const date = formatDate(post.published_date);
            return (
              <Link
                key={post.uid}
                href={`/blog/${post.slug}`}
                className="group block"
              >
                <div className="relative aspect-[3/2] overflow-hidden rounded-2xl bg-sand-200">
                  {post.hero_image?.url && (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={post.hero_image.url}
                      alt={post.hero_image.title || post.title}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                    />
                  )}
                </div>
                <div className="mt-4 space-y-2">
                  {date && (
                    <p className="text-xs font-medium text-pebble uppercase tracking-wider">
                      {date}
                    </p>
                  )}
                  <h2 className="font-heading text-xl font-semibold text-charcoal group-hover:text-terracotta transition-colors">
                    {post.title}
                  </h2>
                  {post.excerpt && (
                    <p className="font-reading text-[0.95rem] text-stone leading-relaxed line-clamp-3">
                      {post.excerpt}
                    </p>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </Container>
  );
}
