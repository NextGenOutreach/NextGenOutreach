import type { Metadata } from "next";
import Link from "next/link";
import { MarketingNav, SiteFooter } from "@/components/marketing";

export const metadata: Metadata = {
  title: "Contact Submitted | NextGenOutreach",
  description: "Your inquiry has been submitted to the NextGenOutreach team.",
};

export default function ContactSuccessPage() {
  return (
    <main className="max-shell">
      <MarketingNav />
      <section className="relative z-10 mx-auto max-w-4xl px-6 py-20">
        <div className="max-section border-accent-2 p-10 text-center">
          <p className="text-sm font-black uppercase tracking-[0.25em] text-accent-3">Success</p>
          <h1 className="mt-4 text-5xl font-black uppercase headline-shadow">Inquiry received</h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-white/90">
            Thanks for reaching out. Our team will review your request and route you to the right specialist.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link href="/marketplace" className="max-button">
              Explore Marketplace
            </Link>
            <Link href="/" className="rounded-full border-4 border-accent-4 px-6 py-3 text-sm font-extrabold uppercase tracking-wider">
              Back to Homepage
            </Link>
          </div>
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
