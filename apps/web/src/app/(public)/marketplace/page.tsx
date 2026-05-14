import { FinalCTA, Hero, MarketingNav, Section, SiteFooter } from "@/components/marketing";
import { SDRMarketplace } from "@/components/SDRMarketplace";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Marketplace | NextGenOutreach",
  description: "Browse ID-verified outreach reps and launch LinkedIn campaigns with safer, human-led workflows.",
};

export default function MarketplacePage() {
  return (
    <main className="max-shell">
      <MarketingNav />
      <Hero
        title="Browse real outreach reps, not risky accounts."
        subtitle="The marketplace helps you discover human-led LinkedIn operators who align with your niche, audience, and growth goals."
        primaryHref="/contact"
        primaryLabel="Request Matched Reps"
        secondaryHref="/pricing"
        secondaryLabel="View Plans"
      />

      <Section 
        title="Verified Outreach Professionals" 
        intro="Browse our directory of ID-verified LinkedIn professionals. Every rep operates from their own profile with 100% transparency."
      >
        <SDRMarketplace />
      </Section>

      <Section 
        title="Why Hire From Our Marketplace?" 
        intro="We prioritize trust, safety, and human-led quality over automation shortcuts."
      >
        <div className="grid gap-8 md:grid-cols-3">
          {[
            { title: "Identity Verified", body: "Every rep completes a strict identity verification process before joining." },
            { title: "Zero Account Risk", body: "Reps use their own high-authority accounts. No password sharing required." },
            { title: "Transparent Flow", body: "Track every connection, DM, and reply through our secure workflow." }
          ].map((item, idx) => (
            <div key={item.title} className="max-card border-dashed" style={{ borderColor: idx === 0 ? "var(--accent-1)" : idx === 1 ? "var(--accent-2)" : "var(--accent-3)" }}>
              <h3 className="text-xl font-black uppercase tracking-tight">{item.title}</h3>
              <p className="mt-2 text-white/70">{item.body}</p>
            </div>
          ))}
        </div>
      </Section>

      <FinalCTA />
      <SiteFooter />
    </main>
  );
}
