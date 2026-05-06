"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Button from "@/components/ui/Button";

type NavLeaf = { label: string; href: string; description?: string };
type NavItem = NavLeaf | { label: string; children: NavLeaf[] };

const links: NavItem[] = [
  { label: "Home", href: "/" },
  { label: "Our Dogs", href: "/dogs" },
  { label: "Foster", href: "/foster" },
  {
    label: "Demos",
    children: [
      {
        label: "Adoption Demo",
        href: "/demo",
        description: "Walkthrough of the adoption process, end-to-end",
      },
      {
        label: "Our History",
        href: "/history",
        description: "Twelve years of senior dog rescue",
      },
      {
        label: "About Us",
        href: "/about",
        description: "Mission, values, and the people behind the work",
      },
    ],
  },
];

const isLeaf = (item: NavItem): item is NavLeaf => "href" in item;

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const navRef = useRef<HTMLElement>(null);

  // Click-outside + Escape close the dropdown.
  useEffect(() => {
    if (!openDropdown) return;
    const onClick = (e: MouseEvent) => {
      if (!navRef.current?.contains(e.target as Node)) setOpenDropdown(null);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpenDropdown(null);
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [openDropdown]);

  const openOnHover = (label: string) => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setOpenDropdown(label);
  };
  const closeOnLeave = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setOpenDropdown(null), 120);
  };

  return (
    <header className="sticky top-0 z-50 bg-sand-50/80 backdrop-blur-md">
      <nav
        ref={navRef}
        className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8"
      >
        <Link
          href="/"
          className="font-heading text-xl font-bold text-charcoal"
        >
          Frosted Faces
        </Link>

        {/* Desktop links */}
        <ul className="hidden items-center gap-8 md:flex">
          {links.map((item) => {
            if (isLeaf(item)) {
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-sm font-medium text-stone transition-colors hover:text-charcoal"
                  >
                    {item.label}
                  </Link>
                </li>
              );
            }
            const isOpen = openDropdown === item.label;
            return (
              <li
                key={item.label}
                className="relative"
                onMouseEnter={() => openOnHover(item.label)}
                onMouseLeave={closeOnLeave}
              >
                <button
                  type="button"
                  aria-haspopup="menu"
                  aria-expanded={isOpen}
                  onClick={() =>
                    setOpenDropdown(isOpen ? null : item.label)
                  }
                  className="inline-flex items-center gap-1 text-sm font-medium text-stone transition-colors hover:text-charcoal"
                >
                  {item.label}
                  <svg
                    className={`h-3 w-3 transition-transform ${
                      isOpen ? "rotate-180" : ""
                    }`}
                    viewBox="0 0 12 12"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M3 4.5L6 7.5L9 4.5" />
                  </svg>
                </button>

                {isOpen && (
                  <div
                    role="menu"
                    className="absolute left-1/2 top-full z-50 mt-3 w-80 -translate-x-1/2 rounded-2xl border border-sand-200 bg-white p-2 shadow-xl"
                  >
                    {item.children.map((child) => (
                      <Link
                        key={child.href}
                        href={child.href}
                        role="menuitem"
                        onClick={() => setOpenDropdown(null)}
                        className="group block rounded-xl px-4 py-3 transition-colors hover:bg-sand-100"
                      >
                        <div className="font-heading text-sm font-semibold text-charcoal">
                          {child.label}
                        </div>
                        {child.description && (
                          <div className="mt-0.5 text-xs text-stone leading-snug">
                            {child.description}
                          </div>
                        )}
                      </Link>
                    ))}
                  </div>
                )}
              </li>
            );
          })}
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
          <ul className="flex flex-col gap-1 py-3">
            {links.map((item) => {
              if (isLeaf(item)) {
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      className="block py-2 text-sm font-medium text-stone transition-colors hover:text-charcoal"
                    >
                      {item.label}
                    </Link>
                  </li>
                );
              }
              return (
                <li key={item.label} className="pt-2">
                  <div className="pb-1 text-xs font-semibold uppercase tracking-wider text-pebble">
                    {item.label}
                  </div>
                  <ul className="flex flex-col gap-1 border-l-2 border-sand-200 pl-3">
                    {item.children.map((child) => (
                      <li key={child.href}>
                        <Link
                          href={child.href}
                          onClick={() => setMobileOpen(false)}
                          className="block py-1.5 text-sm font-medium text-stone transition-colors hover:text-charcoal"
                        >
                          {child.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </li>
              );
            })}
          </ul>
          <Button asChild href="/dogs" size="sm" className="w-full">
            Browse Dogs
          </Button>
        </div>
      )}
    </header>
  );
}
