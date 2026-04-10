export const dynamic = "force-dynamic";

import { getDogs } from "@/lib/contentstack";
import DogsListing from "@/components/dogs/DogsListing";
import type { LivePreviewParams } from "@/lib/contentstack";

interface PageProps {
  searchParams: Promise<LivePreviewParams>;
}

export default async function DogsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const { dogs } = await getDogs(undefined, params);

  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
      <DogsListing dogs={dogs} />
    </section>
  );
}
