import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ContentstackVisualBuilder from "@/components/ContentstackVisualBuilder";
import DogTicker from "@/components/layout/DogTicker";

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const inter = Inter({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "Frosted Faces — Senior Dog Adoption",
  description:
    "Frosted Faces Foundation rescues and rehomes senior dogs. Browse adoptable dogs and give a frosted face a warm home.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${plusJakarta.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-sand-50 font-body text-charcoal">
        <ContentstackVisualBuilder />
        <Navbar />
        <DogTicker />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
