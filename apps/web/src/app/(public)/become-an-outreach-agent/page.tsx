import { FinalCTA, Hero, MarketingNav, Section, SiteFooter } from "@/components/marketing";
import { MaxCard } from "@/components/ui/MaxCard";
import { FloatingDecoration, BackgroundPatterns } from "@/components/ui/Decoration";
import { RepApplicationForm } from "@/components/RepApplicationForm";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Earn with LinkedIn | Become an Outreach Agent",
  description: "Join our marketplace as an ID-verified LinkedIn outreach agent. Get matched with high-value brands, manage campaigns safely, and earn recurring monthly income.",
};

export default function BecomeAgentPage() {
  const tracks = [
    { 
      title: "1. Identity Intel", 
      body: "Submit your profile and pass a strict identity verification (ID + 2FA). We only work with the realest operators." 
    },
    { 
      title: "2. Tactical Match", 
      body: "Our system matches you with brands in your niche. You pick the missions that align with your profile strength." 
    },
    { 
      title: "3. Mission Launch", 
      body: "Execute human-led outreach from your own profile using our secured tactical environments. No bots, just skill." 
    },
    {
      title: "4. Recurring Loot",
      body: "Earn predictable monthly payouts for every active campaign. Scale your income by managing multiple missions."
    }
  ];

  const accents = ["var(--accent-1)", "var(--accent-2)", "var(--accent-3)", "var(--accent-4)", "var(--accent-5)"];

  return (
    <main className="max-shell overflow-hidden bg-background min-h-screen text-white">
      <MarketingNav />
      <BackgroundPatterns opacity={0.1} />
      
      {/* Massive Background Decor */}
      <div className="bg-massive top-20 -left-20 rotate-[-15deg]">EARN</div>
      <div className="bg-massive bottom-40 -right-40 rotate-[10deg] opacity-[0.03]">SCALE</div>

      <Hero
        title="Turn your LinkedIn profile into a monthly income engine."
        subtitle="Join the world's #1 marketplace for human-led outreach. We match ID-verified pros with brands that need real influence, not bots."
        primaryHref="#apply"
        primaryLabel="Start Application"
        secondaryHref="/how-it-works"
        secondaryLabel="View Protocol →"
      />

      <Section 
        title="The Operator's Path" 
        intro="We've built the infrastructure. You bring the profile and the human touch. Here's how you get deployed."
      >
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
          {tracks.map((track, i) => (
            <MaxCard 
              key={track.title} 
              accentColor={accents[i % accents.length]}
              shadowColor={accents[(i + 1) % accents.length]}
              dashed={i % 2 !== 0}
            >
              <h3 className="text-2xl font-black uppercase tracking-tight mb-4 headline-shadow" style={{ textShadow: `2px 2px 0 ${accents[(i + 2) % accents.length]}` }}>
                {track.title}
              </h3>
              <p className="text-white/80 font-bold leading-relaxed">
                {track.body}
              </p>
            </MaxCard>
          ))}
        </div>
      </Section>

      <Section id="apply" title="Apply for Deployment" intro="Ready to turn your LinkedIn into a passive income machine? Submit your intel below.">
        <MaxCard accentColor="var(--accent-1)" shadowColor="var(--accent-5)" className="max-w-4xl mx-auto p-12">
          <RepApplicationForm />
        </MaxCard>
      </Section>

      <Section 
        title="Why Agents Join NextGen" 
        intro="We protect your reputation and your profile while maximizing your earning potential."
      >
        <div className="grid gap-16 lg:grid-cols-2">
          <MaxCard accentColor="var(--accent-4)" shadowColor="var(--accent-3)" className="p-12">
            <h4 className="text-4xl font-black uppercase mb-8 text-accent-4 headline-shadow">Safe Ops Only</h4>
            <p className="text-xl text-white/90 mb-10 font-bold leading-relaxed">
              No account sharing. No password handovers. You operate via our secured, remote-access tactical environments that keep your account safe and compliant.
            </p>
            <ul className="grid grid-cols-2 gap-6 text-accent-2 font-black uppercase tracking-widest text-sm">
              <li className="flex items-center gap-3">✅ ID-Verified Network</li>
              <li className="flex items-center gap-3">✅ Zero Password Sharing</li>
              <li className="flex items-center gap-3">✅ Branded Assets</li>
              <li className="flex items-center gap-3">✅ Automated Payouts</li>
            </ul>
          </MaxCard>
          
          <MaxCard accentColor="var(--accent-1)" shadowColor="var(--accent-2)" className="p-12 rotate-[-1deg]" dashed>
            <h4 className="text-4xl font-black uppercase mb-8 text-accent-1 headline-shadow">Top Tier Payouts</h4>
            <p className="text-xl text-white/90 mb-10 font-bold leading-relaxed">
              We match you with high-value clients who understand the worth of a real human profile. Earn more than typical freelancing.
            </p>
            <div className="bg-background/40 border-8 border-dashed border-accent-3 p-10 rounded-3xl text-center">
              <p className="text-xs font-black uppercase tracking-[0.4em] text-accent-3 mb-4">Estimated Monthly Earning</p>
              <p className="text-6xl font-black headline-shadow grad-text">$750 - $2,500+</p>
              <p className="text-sm font-bold text-white/40 mt-4 italic tracking-widest">3-8 Active Missions</p>
            </div>
          </MaxCard>
        </div>
      </Section>

      <FinalCTA />
      <SiteFooter />
    </main>
  );
}

