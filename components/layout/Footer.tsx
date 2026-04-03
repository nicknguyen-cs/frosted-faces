import Link from "next/link";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Our Dogs", href: "/dogs" },
];

export default function Footer() {
  return (
    <footer className="mt-auto bg-sand-100">
      <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {/* Brand */}
          <div>
            <p className="font-heading text-lg font-bold text-charcoal">
              Frosted Faces
            </p>
            <p className="mt-2 text-sm text-pebble font-body">
              Connecting loving homes with dogs who deserve a second chance.
            </p>
          </div>

          {/* Links */}
          <div>
            <p className="font-heading text-sm font-semibold text-charcoal">
              Navigation
            </p>
            <ul className="mt-3 space-y-2">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-stone transition-colors hover:text-charcoal"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <p className="font-heading text-sm font-semibold text-charcoal">
              Contact
            </p>
            <ul className="mt-3 space-y-2 text-sm text-stone">
              <li>
                <a
                  href="mailto:info@frostedfacesfoundation.org"
                  className="transition-colors hover:text-charcoal"
                >
                  info@frostedfacesfoundation.org
                </a>
              </li>
              <li>
                <a
                  href="tel:+15551234567"
                  className="transition-colors hover:text-charcoal"
                >
                  (555) 123-4567
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-10 border-t border-sand-200 pt-6 text-center text-xs text-pebble">
          &copy; {new Date().getFullYear()} Frosted Faces Foundation. All rights
          reserved.
        </div>
      </div>
    </footer>
  );
}
