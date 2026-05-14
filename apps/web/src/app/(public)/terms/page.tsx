import { MarketingNav, SiteFooter } from "@/components/marketing";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service | NextGenOutreach",
  description: "Terms and conditions governing the use of the NextGenOutreach platform.",
};

const LAST_UPDATED = "14 May 2026";
const COMPANY = "NextGenOutreach (Pty) Ltd";
const EMAIL = "directors@nextgenoutreach.co.za";

export default function TermsPage() {
  return (
    <main className="max-shell">
      <MarketingNav />

      <div className="pt-[120px] pb-24 px-4 md:px-10">
        <div className="container mx-auto max-w-4xl">
          <div className="mb-12">
            <span className="section-tag">Legal</span>
            <h1 className="section-h2 headline-shadow mt-4">
              <span className="grad-text">Terms of Service</span>
            </h1>
            <p className="text-white/50 mt-4 font-bold">
              Last updated: {LAST_UPDATED} &nbsp;·&nbsp; Governed by the laws of the Republic of South Africa
            </p>
          </div>

          <div className="prose-legal">
            <Section title="1. Acceptance of Terms">
              <p>
                By accessing or using the NextGenOutreach platform (&ldquo;Platform&rdquo;), you agree to be bound by
                these Terms of Service (&ldquo;Terms&rdquo;). If you do not agree to these Terms, do not use the Platform.
              </p>
              <p>
                These Terms constitute a legally binding agreement between you and{" "}
                <strong>{COMPANY}</strong> (&ldquo;NextGenOutreach&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;, or &ldquo;our&rdquo;).
              </p>
            </Section>

            <Section title="2. Description of the Platform">
              <p>
                NextGenOutreach is a B2B marketplace that connects businesses (&ldquo;Clients&rdquo;) with
                ID-verified LinkedIn outreach representatives (&ldquo;Reps&rdquo;) to execute human-led LinkedIn
                outreach campaigns. The Platform facilitates the matching, onboarding, and management of these
                relationships but is not itself a party to campaigns.
              </p>
            </Section>

            <Section title="3. Eligibility">
              <p>You may use the Platform only if:</p>
              <ul>
                <li>You are at least 18 years of age</li>
                <li>You have the legal capacity to enter into a binding contract</li>
                <li>You are not prohibited from using the Platform under South African law or any other applicable law</li>
                <li>For Reps: you are a natural person (not a company or automated system) who personally performs the outreach</li>
              </ul>
            </Section>

            <Section title="4. Account Registration">
              <p>
                To access Platform features, you must register an account. You agree to:
              </p>
              <ul>
                <li>Provide accurate, current, and complete information during registration</li>
                <li>Maintain the security of your password and accept responsibility for all activity under your account</li>
                <li>Notify us immediately of any unauthorised use at{" "}
                  <a href={`mailto:${EMAIL}`} className="text-accent-1 hover:underline font-bold">{EMAIL}</a>
                </li>
                <li>Not share your credentials or allow third parties to access your account</li>
              </ul>
              <p>
                We reserve the right to suspend or terminate accounts that violate these Terms or that we reasonably
                believe are involved in fraudulent activity.
              </p>
            </Section>

            <Section title="5. Rep Verification">
              <p>
                All outreach representatives must complete identity verification before being listed on the
                marketplace. This requires submission of a valid South African government-issued identity document.
                By submitting verification documents, you:
              </p>
              <ul>
                <li>Consent to the processing of your identity information as described in our Privacy Policy</li>
                <li>Warrant that all submitted documents are genuine and belong to you</li>
                <li>Acknowledge that submitting fraudulent documents may result in permanent account ban and
                  referral to relevant authorities</li>
              </ul>
            </Section>

            <Section title="6. Client Obligations">
              <p>As a Client, you agree to:</p>
              <ul>
                <li>Use the Platform only for lawful B2B outreach purposes</li>
                <li>Not instruct Reps to send spam, misleading, or illegal communications</li>
                <li>Comply with LinkedIn&apos;s Terms of Service and all applicable laws governing electronic communications</li>
                <li>Pay all fees in accordance with your selected subscription plan</li>
                <li>Not circumvent the Platform by directly hiring Reps you met through NextGenOutreach for a period
                  of 12 months after the last campaign, without our prior written consent</li>
              </ul>
            </Section>

            <Section title="7. Rep Obligations">
              <p>As a Rep, you agree to:</p>
              <ul>
                <li>Perform all assigned outreach personally and not delegate or automate tasks</li>
                <li>Maintain the confidentiality of Client information and campaign details</li>
                <li>Not misrepresent yourself or the Client in any communication</li>
                <li>Comply with LinkedIn&apos;s Terms of Service at all times</li>
                <li>Report any suspicious or unethical instructions from Clients to NextGenOutreach immediately</li>
                <li>Maintain accurate availability status on your profile</li>
              </ul>
            </Section>

            <Section title="8. Fees and Payment">
              <p>
                Subscription plans and pricing are published on our{" "}
                <a href="/pricing" className="text-accent-1 hover:underline font-bold">Pricing page</a>.
                All fees are displayed in USD and billed monthly unless stated otherwise.
              </p>
              <ul>
                <li>Payments are processed by <strong>PayFast</strong> in ZAR at the prevailing exchange rate</li>
                <li>Subscriptions renew automatically. You may cancel at any time from your dashboard</li>
                <li>Cancelled subscriptions remain active until the end of the current billing period — no pro-rata refunds</li>
                <li>We reserve the right to change pricing with 30 days&apos; notice to existing subscribers</li>
                <li>All prices are exclusive of VAT. VAT at the applicable South African rate will be added where required</li>
              </ul>
            </Section>

            <Section title="9. Intellectual Property">
              <p>
                All content, trademarks, logos, and software on the Platform are the property of NextGenOutreach or
                our licensors. You may not reproduce, distribute, or create derivative works without our written
                permission.
              </p>
              <p>
                You retain ownership of any content you submit to the Platform (campaign briefs, messages,
                profile information). By submitting content, you grant NextGenOutreach a non-exclusive,
                royalty-free licence to use it to provide and improve the Platform.
              </p>
            </Section>

            <Section title="10. Prohibited Conduct">
              <p>You must not:</p>
              <ul>
                <li>Use automated scripts, bots, or scraping tools on the Platform</li>
                <li>Attempt to gain unauthorised access to any account, system, or network</li>
                <li>Reverse-engineer, decompile, or disassemble any part of the Platform</li>
                <li>Use the Platform to harass, defame, or discriminate against any person</li>
                <li>Post false reviews or manipulate the Rep rating system</li>
                <li>Use the Platform in any way that violates applicable South African or international law</li>
              </ul>
            </Section>

            <Section title="11. Disclaimers and Limitation of Liability">
              <p>
                The Platform is provided &ldquo;as is&rdquo; without warranties of any kind. We do not warrant that the
                Platform will be uninterrupted, error-free, or secure. We are not liable for the results of any
                outreach campaign.
              </p>
              <p>
                To the maximum extent permitted by South African law, NextGenOutreach&apos;s total liability for any
                claim arising from your use of the Platform is limited to the fees you paid in the 3 months
                preceding the claim. We are not liable for indirect, incidental, or consequential damages.
              </p>
              <p>
                Nothing in these Terms limits liability for fraud, gross negligence, or anything that cannot be
                excluded by law.
              </p>
            </Section>

            <Section title="12. Indemnification">
              <p>
                You agree to indemnify and hold harmless NextGenOutreach and its directors, employees, and agents
                from any claims, damages, or expenses (including reasonable legal fees) arising from your breach
                of these Terms or your use of the Platform.
              </p>
            </Section>

            <Section title="13. Termination">
              <p>
                You may close your account at any time from your dashboard settings. We may suspend or terminate
                your account immediately if you breach these Terms or if we are required to do so by law.
              </p>
              <p>
                Upon termination, your right to access the Platform ceases immediately. Provisions of these Terms
                that by their nature should survive termination will do so, including sections on intellectual
                property, disclaimers, indemnification, and governing law.
              </p>
            </Section>

            <Section title="14. Governing Law and Disputes">
              <p>
                These Terms are governed by the laws of the Republic of South Africa. Any dispute arising from
                these Terms will be subject to the exclusive jurisdiction of the courts of South Africa.
              </p>
              <p>
                Before initiating formal proceedings, you agree to first attempt to resolve the dispute informally
                by contacting us at{" "}
                <a href={`mailto:${EMAIL}`} className="text-accent-1 hover:underline font-bold">{EMAIL}</a>.
                We will endeavour to respond within 10 business days.
              </p>
            </Section>

            <Section title="15. Changes to These Terms">
              <p>
                We may update these Terms from time to time. Material changes will be communicated by email at
                least 14 days before they take effect. Continued use of the Platform after that date constitutes
                acceptance of the updated Terms. The &ldquo;Last updated&rdquo; date at the top of this page indicates the
                current version.
              </p>
            </Section>

            <Section title="16. Contact">
              <p>
                Questions about these Terms? Contact us at:{" "}
                <a href={`mailto:${EMAIL}`} className="text-accent-1 hover:underline font-bold">
                  {EMAIL}
                </a>
              </p>
            </Section>
          </div>
        </div>
      </div>

      <SiteFooter />
    </main>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-10 border-l-4 border-accent-2/40 pl-6">
      <h2 className="text-xl font-black uppercase tracking-tight text-accent-2 mb-4">{title}</h2>
      <div className="space-y-3 text-white/75 leading-relaxed font-medium [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-2 [&_strong]:text-white [&_a]:transition-colors">
        {children}
      </div>
    </div>
  );
}
