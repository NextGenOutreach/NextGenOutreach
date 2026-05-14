import { CardGrid, FinalCTA, Hero, MarketingNav, Section, SiteFooter } from "@/components/marketing";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Us | The Team Behind the Marketplace",
  description: "Learn about NextGenOutreach, the world's leading marketplace for ID-verified LinkedIn reps. We're on a mission to make B2B outreach safe, human, and scalable.",
  keywords: ["LinkedIn outreach team", "B2B sales experts", "lead generation company", "ID-verified sales network"]
};

export default function AboutUsPage() {
  const details = [
    { title: "Founder insight", body: "Built by LinkedIn agency veterans who saw unsafe outsourcing patterns damage outcomes." },
    { title: "Marketplace model", body: "Connect growth teams with real professionals who operate from their own verified accounts." },
    { title: "Safety benchmark", body: "Prioritize trust safeguards and transparent process boundaries over shortcut growth tactics." },
  ];

  return (
    <main className="max-shell">
      <MarketingNav />
      <Hero
        title="The story behind NextGenOutreach."
        subtitle="We created infrastructure for real LinkedIn collaboration that protects both brands and reps."
        primaryHref="/company"
        primaryLabel="Our Company"
        secondaryHref="/why-nextgenoutreach"
        secondaryLabel="Why Us"
      />
      <Section title="Who we are" intro="A marketplace team focused on outreach outcomes, quality control, and ethical execution.">
        <CardGrid items={details} />
      </Section>
      <FinalCTA />
      <SiteFooter />
    </main>
  );
}
