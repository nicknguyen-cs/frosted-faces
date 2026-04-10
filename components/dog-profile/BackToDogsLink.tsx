"use client";

import { useRouter } from "next/navigation";

export default function BackToDogsLink() {
  const router = useRouter();

  return (
    <button
      onClick={() => router.back()}
      className="inline-flex items-center gap-1 text-sm text-stone hover:text-charcoal transition-colors mb-4 cursor-pointer"
    >
      &larr; Back to dogs
    </button>
  );
}
