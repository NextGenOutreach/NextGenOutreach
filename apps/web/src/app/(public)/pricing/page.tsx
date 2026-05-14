import { Metadata } from "next";
import PricingClient from "./PricingClient";

export const metadata: Metadata = {
  title: "Pricing | Cost to Hire LinkedIn SDRs",
  description: "Transparent pricing for LinkedIn outreach reps. Choose from Starter, Professional, or Managed plans to scale your B2B lead generation pipeline.",
  keywords: ["LinkedIn SDR pricing", "outreach rep cost", "hire sales rep price", "lead generation pricing"]
};

export default function PricingPage() {
  return <PricingClient />;
}
