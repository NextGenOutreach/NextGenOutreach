import { MarketingNav, SiteFooter } from "@/components/marketing";
import { MaxButton } from "@/components/ui/MaxButton";
import { BackgroundPatterns, FloatingDecoration } from "@/components/ui/Decoration";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "404 — Page Not Found | NextGenOutreach",
};

export default function NotFound() {
  return (
    <main className="max-shell">
      <MarketingNav />

      <section className="relative min-h-[80vh] flex items-center justify-center pt-[120px] px-4 overflow-hidden">
        <BackgroundPatterns opacity={0.1} />

        <FloatingDecoration emoji="🔍" top="15%" left="8%" animation="animate-float" />
        <FloatingDecoration emoji="🚀" top="10%" right="12%" animation="animate-float-reverse" />
        <FloatingDecoration shape="circle" color="var(--accent-3)" size="80px" bottom="20%" left="6%" animation="animate-spin-slow" opacity={0.2} />
        <FloatingDecoration emoji="⚡" bottom="18%" right="10%" animation="animate-wiggle" />

        <div
          className="absolute text-[20vw] font-black tracking-tighter select-none pointer-events-none"
          style={{ color: "var(--accent-1)", opacity: 0.04, fontFamily: "var(--font-bungee)" }}
        >
          404
        </div>

        <div className="relative z-10 text-center max-w-2xl">
          <div className="text-8xl md:text-9xl font-black tracking-tighter mb-4 headline-shadow" style={{ fontFamily: "var(--font-bungee)", color: "var(--accent-1)" }}>
            404
          </div>

          <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tight mb-6">
            <span className="grad-text">This page went missing.</span>
          </h1>

          <p className="text-white/60 text-lg font-bold mb-10 max-w-lg mx-auto">
            Looks like this URL doesn&apos;t exist. Maybe you followed a broken link, or the page was moved.
            Let&apos;s get you back on track.
          </p>

          <div className="flex flex-wrap justify-center gap-4">
            <MaxButton href="/" size="lg">
              Back to Homepage →
            </MaxButton>
            <MaxButton href="/marketplace" variant="secondary" size="lg">
              Browse Reps
            </MaxButton>
            <MaxButton href="/contact" variant="outline" size="lg">
              Contact Us
            </MaxButton>
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
