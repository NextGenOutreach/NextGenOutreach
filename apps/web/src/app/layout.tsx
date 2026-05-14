import type { Metadata } from "next";
import { Outfit, DM_Sans, Bungee } from "next/font/google";
import { Providers } from "@/components/Providers";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
});

const bungee = Bungee({
  variable: "--font-bungee",
  weight: "400",
  subsets: ["latin"],
});

export const metadata: Metadata = {
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${outfit.variable} ${dmSans.variable} ${bungee.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col"><Providers>{children}</Providers></body>
    </html>
  );
}
