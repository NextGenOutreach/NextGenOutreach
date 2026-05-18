import type { Metadata } from "next";
import { Providers } from "@/components/Providers";
import "./globals.css";

export const metadata: Metadata = {
  manifest: '/manifest.json',
  title: {
    default: "NextGenOutreach | World's #1 LinkedIn SDR & Reps Marketplace",
    template: "%s | NextGenOutreach"
  },
  description: "Hire vetted LinkedIn SDRs and outreach reps to scale your B2B lead generation. Real people, real profiles, and 100% compliant outreach with zero password sharing.",
  keywords: ["LinkedIn SDR", "LinkedIn Reps Marketplace", "Hire LinkedIn SDR", "LinkedIn Lead Generation", "Outsourced Outreach", "B2B Appointment Setting", "Fractional SDR"],
  authors: [{ name: "Tshepo Khosi" }, { name: "Nobuhle Tshanini" }],
  openGraph: {
    type: "website",
    locale: "en_ZA",
    url: "https://nextgenoutreach.co.za",
    siteName: "NextGenOutreach",
    title: "NextGenOutreach | LinkedIn SDR & Reps Marketplace",
    description: "Scale your LinkedIn pipeline with ID-verified professionals. Safe, compliant, and results-driven outreach.",
  },
  twitter: {
    card: "summary_large_image",
    title: "NextGenOutreach | LinkedIn SDR Marketplace",
    description: "Scale your LinkedIn pipeline with ID-verified professionals.",
  }
};

const plausibleDomain = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className="h-full antialiased"
      suppressHydrationWarning
    >
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#ff3af2" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="NextGen" />
        {plausibleDomain && (
          <script
            defer
            data-domain={plausibleDomain}
            src="https://plausible.io/js/script.js"
          />
        )}
        <script dangerouslySetInnerHTML={{ __html: `if ('serviceWorker' in navigator) { window.addEventListener('load', () => navigator.serviceWorker.register('/sw.js')); }` }} />
      </head>
      <body className="min-h-full flex flex-col"><Providers>{children}</Providers></body>
    </html>
  );
}
