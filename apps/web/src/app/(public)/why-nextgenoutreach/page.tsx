import { CardGrid, FinalCTA, Hero, MarketingNav, Section, SiteFooter } from "@/components/marketing";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Why NextGenOutreach",
  description: "See why growth teams choose NextGenOutreach for verified reps, safer processes, and compliance-first outreach.",
};

export default function WhyNextGenPage() {
  const points = [
    { title: "No password sharing", body: "Clients never trade credentials. Reps operate from their own accounts in secure remote workflows." },
    { title: "No fake profile tactics", body: "Marketplace participation is identity-verified and structured for transparent performance." },
    { title: "No bot impersonation", body: "Campaign actions are human-led and monitored, reducing risk from grey-market automation patterns." },
  ];

  return (
    <main className="max-shell">
      <MarketingNav />
      <Hero
        title="Why growth teams choose NextGenOutreach."
        subtitle="We combine scale, compliance-first operating standards, and verified talent so outreach quality does not collapse at higher volumes."
        primaryHref="/marketplace"
        primaryLabel="See Verified Reps"
        secondaryHref="/contact"
        secondaryLabel="Ask Questions"
      />
      <Section title="Built as the safer alternative" intro="Every core process is designed to reduce account risk while preserving outreach speed.">
        <CardGrid items={points} />
      </Section>
      <FinalCTA />
      <SiteFooter />
    </main>
  );
}
