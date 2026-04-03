import Link from "next/link";
import { Search } from "lucide-react";

export default function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="mb-4 rounded-full bg-sand-200 p-4">
        <Search className="h-8 w-8 text-pebble" />
      </div>
      <h3 className="font-heading text-xl font-semibold text-charcoal">
        No dogs match your filters
      </h3>
      <p className="mt-2 text-sm text-pebble max-w-sm">
        Try adjusting your filters or browse all dogs
      </p>
      <Link
        href="/dogs"
        className="mt-6 inline-block rounded-full bg-terracotta px-6 py-2.5 text-sm font-medium text-white transition hover:bg-terracotta-dark"
      >
        Browse all dogs
      </Link>
    </div>
  );
}
