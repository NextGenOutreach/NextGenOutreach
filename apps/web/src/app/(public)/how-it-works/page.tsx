import { CardGrid, FinalCTA, Hero, MarketingNav, Section, SiteFooter } from "@/components/marketing";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "How It Works | Hire and Deploy LinkedIn Reps",
  description: "Explore our step-by-step process for hiring, vetting, and launching campaigns with ID-verified LinkedIn outreach agents. Scale your pipeline safely.",
  keywords: ["LinkedIn outreach workflow", "hire SDR process", "sales rep onboarding", "lead generation campaign setup"]
};

export default function HowItWorksPage() {
  const steps = [
    { title: "1. Select reps", body: "Filter and shortlist verified reps based on your audience and vertical." },
    { title: "2. Match + onboard", body: "Align messaging, outreach limits, and campaign setup through supported workflows." },
    { title: "3. Launch + optimize", body: "Run DMs, connection requests, and posting cadence with ongoing support options." },
  ];

  return (
    <main className="max-shell">
      <MarketingNav />
      <Hero
        title="A clear workflow from selection to meetings."
        subtitle="NextGenOutreach gives clients and reps one structured operating model that stays fast and compliant-focused."
        primaryHref="/marketplace"
        primaryLabel="Start Matching"
        secondaryHref="/contact"
        secondaryLabel="Need Help?"
      />
      <Section title="Process overview" intro="Simple sequence, transparent ownership, and optional managed support where needed.">
        <CardGrid items={steps} />
      </Section>
      <FinalCTA />
      <SiteFooter />
    </main>
  );
}
