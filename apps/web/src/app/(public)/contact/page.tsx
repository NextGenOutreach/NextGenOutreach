import { FinalCTA, Hero, MarketingNav, Section, SiteFooter } from "@/components/marketing";
import type { Metadata } from "next";
import { ContactForm } from "./ContactForm";

export const metadata: Metadata = {
  title: "Contact | NextGenOutreach",
  description: "Contact the NextGenOutreach team for client onboarding, outreach rep applications, partnerships, or support.",
};

export default async function ContactPage() {
  return (
    <main className="max-shell">
      <MarketingNav />
      <Hero
        title="Tell us your goal and we will route you fast."
        subtitle="Whether you are hiring reps, applying as a rep, or exploring partnerships, we route your request to the right specialist."
        primaryHref="/marketplace"
        primaryLabel="Browse Marketplace"
        secondaryHref="/pricing"
        secondaryLabel="View Pricing"
      />
      <Section title="Contact routing form" intro="Share context and our team will reply with your best next step.">
        <div className="mb-10 text-center">
          <p className="text-white/60 mb-2">Want to reach us directly?</p>
          <a href="mailto:directors@nextgenoutreach.co.za" className="text-2xl font-black text-accent-1 hover:text-accent-2 transition-colors">directors@nextgenoutreach.co.za</a>
        </div>
        
        <ContactForm />
      </Section>
      <FinalCTA />
      <SiteFooter />
    </main>
  );
}
