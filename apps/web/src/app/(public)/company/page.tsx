import { CardGrid, FinalCTA, Hero, MarketingNav, Section, SiteFooter } from "@/components/marketing";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Company | NextGenOutreach",
  description: "Learn the founder story, mission, and operating principles behind NextGenOutreach.",
};

export default function CompanyPage() {
  const values = [
    { title: "Mission", body: "Help businesses scale LinkedIn outreach safely through real professionals, not synthetic account shortcuts." },
    { title: "Origin", body: "Founded by veteran LinkedIn agency operators who saw a gap for trust-first collaboration infrastructure." },
    { title: "Operating principle", body: "Mutual value for clients and reps through clear workflows, support, and transparent campaign accountability." },
  ];

  return (
    <main className="max-shell">
      <MarketingNav />
      <Hero
        title="Built by operators who lived the outreach grind."
        subtitle="NextGenOutreach was created to replace unsafe account-rental tactics with a verified, people-first marketplace model."
        primaryHref="/contact"
        primaryLabel="Talk To Team"
        secondaryHref="/become-an-outreach-agent"
        secondaryLabel="Become A Rep"
      />
      <Section title="What drives the company" intro="We balance growth ambition with safety discipline, and we keep both sides of the marketplace aligned.">
        <CardGrid items={values} />
      </Section>
      <FinalCTA />
      <SiteFooter />
    </main>
  );
}
