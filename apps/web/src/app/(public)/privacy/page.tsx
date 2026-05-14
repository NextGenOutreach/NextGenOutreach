import { MarketingNav, SiteFooter } from "@/components/marketing";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | NextGenOutreach",
  description: "How NextGenOutreach collects, uses, and protects your personal information in compliance with POPIA.",
};

const LAST_UPDATED = "14 May 2026";
const COMPANY = "NextGenOutreach (Pty) Ltd";
const EMAIL = "directors@nextgenoutreach.co.za";
const REGULATOR = "The Information Regulator (South Africa)";
const REGULATOR_URL = "https://www.justice.gov.za/inforeg/";

export default function PrivacyPage() {
  return (
    <main className="max-shell">
      <MarketingNav />

      <div className="pt-[120px] pb-24 px-4 md:px-10">
        <div className="container mx-auto max-w-4xl">
          <div className="mb-12">
            <span className="section-tag">Legal</span>
            <h1 className="section-h2 headline-shadow mt-4">
              <span className="grad-text">Privacy Policy</span>
            </h1>
            <p className="text-white/50 mt-4 font-bold">
              Last updated: {LAST_UPDATED} &nbsp;·&nbsp; Compliant with POPIA (Act 4 of 2013)
            </p>
          </div>

          <div className="prose-legal">
            <Section title="1. Who We Are">
              <p>
                <strong>{COMPANY}</strong> (&ldquo;NextGenOutreach&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;, or &ldquo;our&rdquo;) operates the
                platform at <strong>nextgenoutreach.co.za</strong>. We are the responsible party as defined in the
                Protection of Personal Information Act, 2013 (&ldquo;POPIA&rdquo;).
              </p>
              <p>
                Contact us regarding this policy at:{" "}
                <a href={`mailto:${EMAIL}`} className="text-accent-1 hover:underline font-bold">
                  {EMAIL}
                </a>
              </p>
            </Section>

            <Section title="2. Personal Information We Collect">
              <p>We collect the following categories of personal information:</p>
              <ul>
                <li><strong>Identity data</strong> — full name, government-issued ID (for outreach rep verification), profile photo</li>
                <li><strong>Contact data</strong> — email address, phone number, WhatsApp number</li>
                <li><strong>Account data</strong> — username, password (hashed), role (client or rep), account status</li>
                <li><strong>Professional data</strong> — LinkedIn profile URL, industry, location, follower count, availability status</li>
                <li><strong>Financial data</strong> — billing plan, payment history (processed by PayFast — we do not store card details)</li>
                <li><strong>Usage data</strong> — pages visited, features used, campaign activity, connection counts</li>
                <li><strong>Communications</strong> — messages submitted via our contact form, support requests</li>
              </ul>
            </Section>

            <Section title="3. How We Use Your Information">
              <p>We process your personal information only for the following lawful purposes:</p>
              <ul>
                <li>Creating and managing your account on the platform</li>
                <li>Verifying the identity of outreach representatives (POPIA §11(1)(a) — consent)</li>
                <li>Facilitating the matching of clients with outreach representatives</li>
                <li>Processing payments and managing billing subscriptions</li>
                <li>Sending transactional emails (campaign updates, payment receipts, task assignments)</li>
                <li>Responding to contact form enquiries and support requests</li>
                <li>Complying with applicable South African law</li>
                <li>Improving platform performance and user experience through aggregated analytics</li>
              </ul>
              <p>
                We will not process your information for any purpose incompatible with the above without your explicit
                consent (POPIA §13).
              </p>
            </Section>

            <Section title="4. Sharing Your Information">
              <p>
                We do not sell, rent, or trade your personal information. We share it only where necessary:
              </p>
              <ul>
                <li>
                  <strong>PayFast</strong> — for payment processing. PayFast is PCI-DSS compliant. Their privacy policy
                  applies to data they process.
                </li>
                <li>
                  <strong>SendGrid</strong> — for transactional email delivery. Email content and recipient addresses are
                  transmitted to SendGrid solely for delivery purposes.
                </li>
                <li>
                  <strong>Firebase (Google)</strong> — for authentication. Firebase processes authentication credentials
                  in accordance with Google&apos;s privacy policy.
                </li>
                <li>
                  <strong>Amazon Web Services (S3)</strong> — for secure file storage (profile images, verification
                  documents).
                </li>
                <li>
                  <strong>Law enforcement</strong> — when required by law, court order, or to protect the rights,
                  property, or safety of users or the public.
                </li>
              </ul>
              <p>
                All third-party processors are contractually bound to process data only as instructed and in
                compliance with applicable privacy law.
              </p>
            </Section>

            <Section title="5. ID Verification">
              <p>
                Outreach representatives are required to submit a South African government-issued identity document
                for verification. This information is:
              </p>
              <ul>
                <li>Collected with your explicit consent (POPIA §11(1)(a))</li>
                <li>Stored encrypted at rest on AWS S3 in the <strong>af-south-1 (Cape Town)</strong> region</li>
                <li>Accessed only by authorised NextGenOutreach administrators for verification purposes</li>
                <li>Retained for a maximum of 3 years after account closure, or as required by law</li>
                <li>Never shared with clients or other third parties</li>
              </ul>
            </Section>

            <Section title="6. Data Retention">
              <p>We retain personal information for as long as necessary to fulfil the purposes described above:</p>
              <ul>
                <li><strong>Active account data</strong> — retained for the duration of your account</li>
                <li><strong>Closed account data</strong> — deleted or anonymised within 90 days of closure, unless legal obligations require longer retention</li>
                <li><strong>ID verification documents</strong> — up to 3 years post-closure</li>
                <li><strong>Financial records</strong> — up to 5 years as required by the Companies Act</li>
                <li><strong>Contact form submissions</strong> — 12 months from receipt</li>
              </ul>
            </Section>

            <Section title="7. Your Rights Under POPIA">
              <p>As a data subject under POPIA, you have the right to:</p>
              <ul>
                <li><strong>Access</strong> — request a copy of the personal information we hold about you</li>
                <li><strong>Correction</strong> — request correction of inaccurate or incomplete information</li>
                <li><strong>Deletion</strong> — request deletion of your personal information (subject to legal obligations)</li>
                <li><strong>Objection</strong> — object to the processing of your information for direct marketing</li>
                <li><strong>Withdrawal of consent</strong> — where processing is based on consent, you may withdraw at any time</li>
                <li><strong>Complaint</strong> — lodge a complaint with the Information Regulator</li>
              </ul>
              <p>
                To exercise any of these rights, email us at{" "}
                <a href={`mailto:${EMAIL}`} className="text-accent-1 hover:underline font-bold">
                  {EMAIL}
                </a>
                . We will respond within 30 days.
              </p>
            </Section>

            <Section title="8. Security Measures">
              <p>We implement the following technical and organisational measures to protect your information:</p>
              <ul>
                <li>All data in transit is encrypted via TLS 1.2+</li>
                <li>Passwords are hashed using bcrypt (12 rounds) — we never store plaintext passwords</li>
                <li>Access tokens expire in 15 minutes; refresh tokens in 7 days</li>
                <li>Role-based access control restricts data access to authorised personnel only</li>
                <li>Two-factor authentication is available for all accounts</li>
                <li>Regular security audits and dependency updates</li>
              </ul>
              <p>
                Despite these measures, no system is 100% secure. In the event of a data breach that poses a risk to
                data subjects, we will notify affected individuals and the Information Regulator within the timeframes
                required by POPIA.
              </p>
            </Section>

            <Section title="9. Cookies and Analytics">
              <p>
                We use cookies and similar technologies for authentication (session management) and analytics. We do
                not use advertising cookies or cross-site tracking.
              </p>
              <p>
                Analytics are collected in aggregate form (no individual tracking) using privacy-friendly tooling.
                You may opt out of analytics by using a browser extension that blocks analytics scripts.
              </p>
            </Section>

            <Section title="10. Children">
              <p>
                Our platform is not intended for persons under 18 years of age. We do not knowingly collect personal
                information from minors. If you believe a minor has submitted information to us, contact us
                immediately at{" "}
                <a href={`mailto:${EMAIL}`} className="text-accent-1 hover:underline font-bold">
                  {EMAIL}
                </a>{" "}
                and we will delete it promptly.
              </p>
            </Section>

            <Section title="11. Changes to This Policy">
              <p>
                We may update this Privacy Policy from time to time. Material changes will be communicated by email
                to registered account holders and by a prominent notice on the platform at least 7 days before the
                change takes effect. The &ldquo;Last updated&rdquo; date at the top of this page reflects the most recent
                version.
              </p>
            </Section>

            <Section title="12. Contact & Complaints">
              <p>
                For privacy-related queries or to exercise your rights, contact our Information Officer at:
              </p>
              <p>
                <strong>Email:</strong>{" "}
                <a href={`mailto:${EMAIL}`} className="text-accent-1 hover:underline font-bold">
                  {EMAIL}
                </a>
              </p>
              <p>
                If you are not satisfied with our response, you have the right to lodge a complaint with the{" "}
                <strong>{REGULATOR}</strong>:
              </p>
              <p>
                <a href={REGULATOR_URL} target="_blank" rel="noopener noreferrer" className="text-accent-2 hover:underline font-bold">
                  {REGULATOR_URL}
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
    <div className="mb-10 border-l-4 border-accent-1/40 pl-6">
      <h2 className="text-xl font-black uppercase tracking-tight text-accent-1 mb-4">{title}</h2>
      <div className="space-y-3 text-white/75 leading-relaxed font-medium [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-2 [&_strong]:text-white [&_a]:transition-colors">
        {children}
      </div>
    </div>
  );
}
