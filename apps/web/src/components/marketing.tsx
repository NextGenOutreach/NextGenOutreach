import type { ReactNode } from "react";
import { MarketingNav } from "./marketing-nav";
import { MaxButton } from "./ui/MaxButton";
import { MaxCard } from "./ui/MaxCard";
import { MaxInput } from "./ui/MaxInput";
import { FloatingDecoration, BackgroundPatterns } from "./ui/Decoration";

export { MarketingNav };

const accents = ["var(--accent-1)", "var(--accent-2)", "var(--accent-3)", "var(--accent-4)", "var(--accent-5)"];

export function Hero({
  title,
  subtitle,
  primaryHref,
  primaryLabel,
  secondaryHref,
  secondaryLabel,
}: {
  title: string;
  subtitle: string;
  primaryHref: string;
  primaryLabel: string;
  secondaryHref: string;
  secondaryLabel: string;
}) {
  return (
    <section className="relative min-h-[70vh] flex items-center pt-[120px] px-4 md:px-10 overflow-hidden">
      <BackgroundPatterns opacity={0.15} />
      <div className="bg-massive top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rotate-[-10deg] opacity-[0.05]">NEXTGEN</div>
      
      {/* Floating Decorations */}
      <FloatingDecoration emoji="🚀" top="15%" left="5%" animation="animate-float" />
      <FloatingDecoration emoji="✨" top="10%" right="10%" animation="animate-float-reverse" />
      <FloatingDecoration shape="circle" color="var(--accent-3)" size="60px" bottom="20%" left="8%" animation="animate-spin-slow" opacity={0.3} />
      <FloatingDecoration emoji="🎯" bottom="15%" right="12%" animation="animate-wiggle" />

      <div className="container mx-auto relative z-10 text-center">
        <h1 className="hero-h1 headline-shadow">
          <span className="grad-text">{title}</span>
        </h1>
        <p className="hero-sub max-w-[720px] mx-auto mb-10 text-white/75 text-[1.25rem] font-bold">
          {subtitle}
        </p>
        <div className="flex flex-wrap justify-center gap-6">
          <MaxButton href={primaryHref} size="lg">
            {primaryLabel}
          </MaxButton>
          <MaxButton href={secondaryHref} variant="secondary" size="lg">
            {secondaryLabel}
          </MaxButton>
        </div>
      </div>
    </section>
  );
}

export function Section({
  id,
  title,
  intro,
  children,
  tag,
}: {
  id?: string;
  title: string;
  intro: string;
  children: ReactNode;
  tag?: string;
}) {
  return (
    <section id={id} className="relative py-16 md:py-32 px-4 md:px-10 overflow-hidden">
      <div className="absolute inset-0 pattern-dots text-accent-1/5 opacity-50" />
      <div className="container mx-auto relative z-10">
        <div className="text-center mb-16">
          {tag && <span className="section-tag">{tag}</span>}
          <h2 className="section-h2 headline-shadow" style={{ textShadow: "4px 4px 0 var(--a5), 8px 8px 0 var(--a1)" }}>
            {title}
          </h2>
          <p className="text-white/65 max-w-[600px] mx-auto text-lg mt-4 font-bold">{intro}</p>
        </div>
        {children}
      </div>
    </section>
  );
}

export function CardGrid({ items }: { items: { title: string; body: string }[] }) {
  return (
    <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-3">
      {items.map((item, idx) => (
        <MaxCard
          key={item.title}
          accentColor={accents[idx % accents.length]}
          shadowColor={accents[(idx + 1) % accents.length]}
          dashed={idx % 2 !== 0}
        >
          <h3 className="text-2xl font-black uppercase tracking-tight mb-4" style={{ color: accents[idx % accents.length] }}>
            {item.title}
          </h3>
          <p className="text-white/80 leading-relaxed font-medium">
            {item.body}
          </p>
        </MaxCard>
      ))}
    </div>
  );
}

export function FinalCTA() {
  return (
    <section className="cta-banner relative overflow-hidden">
      <div className="absolute inset-0 pattern-checker text-accent-3/5" />
      <div className="container mx-auto relative z-10">
        <h2 className="cta-h2 headline-shadow">Ready to scale safely?</h2>
        <p className="text-[1.25rem] text-white/85 max-w-[600px] mx-auto mb-10 font-bold">
          Build your outreach engine with ID-verified professionals who protect your brand and account.
        </p>
        <div className="flex flex-wrap justify-center gap-6">
          <MaxButton href="/pricing" size="lg">
            Get Started Now →
          </MaxButton>
          <MaxButton href="mailto:directors@nextgenoutreach.co.za" variant="outline" size="lg">
            Email Directors
          </MaxButton>
        </div>
      </div>
    </section>
  );
}

export function InputField({
  label,
  name,
  type = "text",
  ...props
}: {
  label: string;
  name: string;
  type?: string;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <MaxInput 
      label={label} 
      name={name} 
      type={type} 
      accentColor="var(--accent-1)"
      {...(props as any)}
    />
  );
}

export function SiteFooter() {
  return (
    <footer className="bg-background border-t-8 border-accent-1 px-4 md:px-10 py-12 md:py-16 relative overflow-hidden">
      <div className="absolute inset-0 pattern-dots text-white/5 opacity-10" />
      <div className="container mx-auto relative z-10 flex flex-col md:flex-row flex-wrap justify-between items-start gap-8 md:gap-12">
        <div className="flex flex-col gap-4">
          <div className="footer-logo font-outfit font-black text-3xl uppercase tracking-tighter">
            Next<span className="text-accent-1">Gen</span>Outreach
          </div>
          <a href="mailto:directors@nextgenoutreach.co.za" className="text-lg font-black text-accent-2 hover:underline tracking-tight">
            directors@nextgenoutreach.co.za
          </a>
        </div>
        <nav className="footer-links flex flex-wrap gap-10">
          <MaxButton variant="ghost" href="/#how" size="sm">How It Works</MaxButton>
          <MaxButton variant="ghost" href="/pricing" size="sm">Pricing</MaxButton>
          <MaxButton variant="ghost" href="/#reps" size="sm">Become a Rep</MaxButton>
          <MaxButton variant="ghost" href="/about-us" size="sm">About Us</MaxButton>
          <MaxButton variant="ghost" href="/login" size="sm">Login</MaxButton>
        </nav>
        <nav className="footer-links flex flex-wrap gap-10">
          <MaxButton variant="ghost" href="/privacy" size="sm">Privacy Policy</MaxButton>
          <MaxButton variant="ghost" href="/terms" size="sm">Terms of Service</MaxButton>
          <MaxButton variant="ghost" href="/contact" size="sm">Contact</MaxButton>
        </nav>
        <div className="max-w-xl">
          <p className="footer-copy text-sm font-bold text-white/40 leading-relaxed">
            © 2026 NextGenOutreach. The world&apos;s #1 LinkedIn Reps Marketplace. 
            Facilitating human-led outreach through ID-verified professionals. 
            Safe, compliant, and results-driven. Registered in South Africa.
          </p>
        </div>
      </div>
    </footer>
  );
}

