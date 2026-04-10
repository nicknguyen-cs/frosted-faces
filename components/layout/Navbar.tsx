"use client";

import { useState } from "react";
import Link from "next/link";
import Button from "@/components/ui/Button";

const links = [
  { label: "Home", href: "/" },
  { label: "Our Dogs", href: "/dogs" },
  { label: "Foster", href: "/foster" },
  { label: "About", href: "/about" },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-sand-50/80 backdrop-blur-md">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8">
        {/* Logo */}
        <Link
          href="/"
          className="font-heading text-xl font-bold text-charcoal"
        >
          Frosted Faces
        </Link>

        {/* Desktop links */}
        <ul className="hidden items-center gap-8 md:flex">
          {links.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="text-sm font-medium text-stone transition-colors hover:text-charcoal"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Desktop CTA */}
        <div className="hidden md:block">
          <Button asChild href="/dogs" size="sm">
            Browse Dogs
          </Button>
        </div>

        {/* Mobile hamburger */}
        <button
          type="button"
          onClick={() => setMobileOpen((prev) => !prev)}
          className="inline-flex items-center justify-center rounded-lg p-2 text-stone hover:bg-sand-100 md:hidden"
          aria-label="Toggle menu"
        >
          <svg
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
          >
            {mobileOpen ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3.75 6.75h16.5M3.75 12h16.5M3.75 17.25h16.5"
              />
            )}
          </svg>
        </button>
      </nav>

      {/* Mobile dropdown */}
      {mobileOpen && (
        <div className="border-t border-sand-200 bg-sand-50 px-6 pb-4 md:hidden">
          <ul className="flex flex-col gap-3 py-3">
            {links.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="block text-sm font-medium text-stone transition-colors hover:text-charcoal"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
          <Button asChild href="/dogs" size="sm" className="w-full">
            Browse Dogs
          </Button>
        </div>
      )}
    </header>
  );
}
