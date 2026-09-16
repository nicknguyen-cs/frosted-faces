import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getBlogBySlug } from "@/lib/contentstack";
import type { LivePreviewParams } from "@/lib/contentstack";
import DogMatchRail from "@/components/blog/DogMatchRail";
import JsonLd from "@/components/seo/JsonLd";
import { buildArticleMetadata, buildArticleJsonLd, ORG_NAME } from "@/lib/seo";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<LivePreviewParams>;
};

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

// Reading-time estimate from the HTML body (tags stripped).
function readingTime(html?: string): number {
  const text = (html ?? "").replace(/<[^>]+>/g, " ");
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogBySlug(slug);
  if (!post) return { title: "Post not found" };

  return buildArticleMetadata({
    seo: post.seo,
    path: `/blog/${post.slug}`,
    title: post.title,
    fallbackDescription: post.excerpt,
    fallbackImage: post.hero_image?.url,
    datePublished: post.published_date,
    author: post.author,
  });
}

export default async function BlogPostPage({ params, searchParams }: PageProps) {
  const [{ slug }, previewParams] = await Promise.all([params, searchParams]);
  const post = await getBlogBySlug(slug, previewParams);

  if (!post) notFound();

  const date = formatDate(post.published_date);
  const minutes = readingTime(post.body);
  const author = post.author || ORG_NAME;
  const initials = author
    .split(/\s+/)
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  const bodyHtml = post.body ?? "";
  const faqs = (post.seo?.faqs ?? []).filter((f) => f.question && f.answer);

  return (
    <>
      {/* Article + BreadcrumbList + FAQPage structured data, sourced from the
          shared `seo` global field — same AEO/GEO treatment as dog pages. */}
      <JsonLd
        data={buildArticleJsonLd({
          seo: post.seo,
          path: `/blog/${post.slug}`,
          title: post.title,
          fallbackDescription: post.excerpt,
          fallbackImage: post.hero_image?.url,
          datePublished: post.published_date,
          author: post.author,
        })}
      />

      <article className="pb-4">
        {/* ── Masthead: title, dek, byline — centered reading column ── */}
        <div className="mx-auto max-w-[688px] px-5 pt-10 md:pt-16">
          <Link
            href="/blog"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-pebble hover:text-terracotta transition-colors"
          >
            <span aria-hidden>←</span> All posts
          </Link>

          <h1
            className="mt-7 font-heading text-[2.1rem] leading-[1.12] md:text-[3.1rem] md:leading-[1.08] font-bold tracking-tight text-charcoal text-balance"
            {...(post.$ && post.$.title)}
          >
            {post.title}
          </h1>

          {post.excerpt && (
            <p
              className="mt-5 font-reading text-xl md:text-[1.35rem] leading-snug text-stone"
              {...(post.$ && post.$.excerpt)}
            >
              {post.excerpt}
            </p>
          )}

          <div className="mt-8 flex items-center gap-3 border-y border-sand-200 py-4">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-terracotta font-heading text-sm font-bold text-white">
              {initials}
            </span>
            <div className="min-w-0">
              <p className="font-heading text-sm font-semibold text-charcoal">
                {author}
              </p>
              <p className="text-sm text-pebble">
                {date && <time dateTime={post.published_date}>{date}</time>}
                {date && <span aria-hidden> · </span>}
                {minutes} min read
              </p>
            </div>
          </div>
        </div>

        {/* ── Hero image, slightly wider than the text column ── */}
        {post.hero_image?.url && (
          <figure className="mx-auto max-w-3xl px-5 mt-10">
            <div className="relative aspect-[16/9] overflow-hidden rounded-2xl bg-sand-200">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={post.hero_image.url}
                alt={post.hero_image.title || post.title}
                className="h-full w-full object-cover"
              />
            </div>
          </figure>
        )}

        {/* ── Body (JSON RTE → HTML, styled as editorial prose) ── */}
        {bodyHtml && (
          <div className="mx-auto max-w-[688px] px-5 mt-10 md:mt-12">
            <div
              className="prose prose-lg max-w-none font-reading
                         prose-headings:font-heading prose-headings:font-bold prose-headings:text-charcoal prose-headings:tracking-tight
                         prose-p:text-charcoal/90 prose-p:leading-[1.8] prose-p:text-[1.2rem]
                         prose-a:text-terracotta prose-a:no-underline hover:prose-a:underline
                         prose-blockquote:border-l-terracotta prose-blockquote:text-charcoal prose-blockquote:not-italic
                         prose-img:rounded-2xl prose-strong:text-charcoal"
              {...(post.$ && post.$.body)}
              dangerouslySetInnerHTML={{ __html: bodyHtml }}
            />
          </div>
        )}

        {/* ── FAQ — visible on-page (Google requires this for FAQ rich results)
            and the source for the FAQPage JSON-LD above ── */}
        {faqs.length > 0 && (
          <div className="mx-auto max-w-[688px] px-5 mt-14 pt-10 border-t border-sand-200">
            <h2 className="font-heading text-2xl font-bold text-charcoal mb-7">
              Frequently asked questions
            </h2>
            <dl className="space-y-7">
              {faqs.map((faq, i) => (
                <div key={i}>
                  <dt className="font-heading text-lg font-semibold text-charcoal mb-1.5">
                    {faq.question}
                  </dt>
                  <dd className="font-reading text-[1.075rem] leading-relaxed text-stone">
                    {faq.answer}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        )}
      </article>

      {/* ── Live "available now" rail — AgentOS-curated reference, filtered to
          currently-available dogs at render time ── */}
      <DogMatchRail dogs={post.associated_dogs} />
    </>
  );
}
