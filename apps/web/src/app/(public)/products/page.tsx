import { CardGrid, FinalCTA, Hero, MarketingNav, Section, SiteFooter } from "@/components/marketing";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Products | NextGenOutreach",
  description: "Explore outreach modules from verified rep marketplace access to managed campaign execution.",
};

export default function ProductsPage() {
  const modules = [
    { title: "Rep Marketplace Access", body: "Source ID-verified outreach reps filtered by niche, location, and audience profile strength." },
    { title: "Campaign Setup + Warmup", body: "Prepare account flow, connection strategy, and outreach sequencing before volume ramps." },
    { title: "DM + Posting Execution", body: "Run outreach workflows from real rep accounts with transparent daily actions and support." },
  ];

  return (
    <main className="max-shell">
      <MarketingNav />
      <Hero
        title="Product modules designed for outreach velocity."
        subtitle="Mix and match service layers from self-directed marketplace hiring to managed execution and reply handling support."
        primaryHref="/pricing"
        primaryLabel="See Pricing"
        secondaryHref="/contact"
        secondaryLabel="Talk Strategy"
      />
      <Section title="Choose your operating model" intro="Every module is built to keep campaigns human-led, secure, and easy to scale.">
        <CardGrid items={modules} />
      </Section>
      <FinalCTA />
      <SiteFooter />
    </main>
  );
}
