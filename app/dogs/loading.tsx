export default function Loading() {
  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-10">
        <div className="h-10 w-48 animate-pulse rounded-lg bg-sand-200" />
        <div className="mt-3 h-5 w-64 animate-pulse rounded-lg bg-sand-200" />
      </div>

      <div className="mb-10 space-y-4">
        {[1, 2, 3].map((row) => (
          <div key={row} className="flex gap-2">
            <div className="h-9 w-16 animate-pulse rounded-full bg-sand-200" />
            {[1, 2, 3, 4].map((pill) => (
              <div
                key={pill}
                className="h-9 w-20 animate-pulse rounded-full bg-sand-200"
              />
            ))}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i}>
            <div className="aspect-[4/5] animate-pulse rounded-2xl bg-sand-200" />
            <div className="mt-3 space-y-2">
              <div className="h-5 w-28 animate-pulse rounded bg-sand-200" />
              <div className="h-4 w-40 animate-pulse rounded bg-sand-200" />
              <div className="h-5 w-16 animate-pulse rounded-full bg-sand-200" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
