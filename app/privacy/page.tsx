import { Navbar } from "@/components/landing/navbar";
import { Footer } from "@/components/landing/footer";

export const metadata = {
  title: "Privacy Policy — Agent Elephant",
  description:
    "How Agent Elephant collects, uses, shares, and protects your information.",
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-[#F5F0E8] text-zinc-900">
      <Navbar />
      <section className="mx-auto max-w-3xl px-6 py-16 sm:py-24">
        <header className="mb-10 border-b border-zinc-300 pb-8">
          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
            Privacy Policy
          </h1>
          <p className="mt-3 text-sm text-zinc-600">
            Effective date: 25 August 2026 &middot; Last updated: 25 August 2026
          </p>
        </header>

        <article className="space-y-4 text-zinc-700 leading-relaxed [&_h2]:mt-10 [&_h2]:mb-3 [&_h2]:text-2xl [&_h2]:font-semibold [&_h2]:text-zinc-900 [&_h3]:mt-6 [&_h3]:mb-2 [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:text-zinc-900 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-2 [&_li]:marker:text-zinc-400 [&_strong]:font-semibold [&_strong]:text-zinc-900 [&_code]:rounded [&_code]:bg-zinc-200/70 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:text-sm [&_code]:text-zinc-800">
          <h2>1. Introduction</h2>
          <p>
            This Privacy Policy explains how <strong>Agent Elephant</strong>{" "}
            (&ldquo;Agent Elephant&rdquo;, &ldquo;we&rdquo;, &ldquo;our&rdquo;,
            or &ldquo;us&rdquo;) collects, uses, shares, and protects
            information when you use our marketing automation platform (the
            &ldquo;Service&rdquo;). The Service enables users and businesses
            (&ldquo;host applications&rdquo;) to schedule, publish, and manage
            marketing content across third-party social media platforms.
          </p>
          <p>
            By using Agent Elephant, you agree to the practices described in
            this Privacy Policy. If you do not agree, please do not use the
            Service.
          </p>

          <h2>2. Who we are</h2>
          <p>
            Agent Elephant is a multi-tenant marketing automation platform. We
            act as a <strong>data processor</strong> when handling content on
            behalf of host applications that embed our platform, and as a{" "}
            <strong>data controller</strong> for information we collect directly
            (e.g., account signups, direct users).
          </p>
          <p>
            <strong>Contact:</strong> hellostores.socials@gmail.com
          </p>

          <h2>3. Information we collect</h2>
          <p>We collect the following categories of information:</p>

          <h3>a) Account information</h3>
          <ul>
            <li>Name, email address, and authentication identifiers.</li>
            <li>
              Host application identifiers (<code>host_app_id</code>,{" "}
              <code>external_user_id</code>) when accessed through an integrated
              partner application.
            </li>
          </ul>

          <h3>b) Social media account information (with your explicit consent)</h3>
          <p>
            When you connect a social media account (LinkedIn, Facebook,
            Instagram, TikTok, YouTube, X/Twitter, or others), we collect and
            store:
          </p>
          <ul>
            <li>OAuth access tokens and refresh tokens.</li>
            <li>
              Account identifiers, page IDs, handles, and public profile
              information.
            </li>
            <li>Permissions/scopes you have granted.</li>
          </ul>
          <p>
            We store these tokens{" "}
            <strong>only to publish content on your behalf</strong> and to
            display connection status. We never sell or share these tokens with
            third parties.
          </p>

          <h3>c) Content you provide</h3>
          <ul>
            <li>
              Posts, captions, images, videos, hashtags, schedules, series,
              campaigns, and any content you upload or generate.
            </li>
            <li>Comments, notes, and metadata related to your campaigns.</li>
          </ul>

          <h3>d) Usage data</h3>
          <ul>
            <li>
              Log data (IP address, browser type, device information,
              timestamps).
            </li>
            <li>Feature usage, click events, and error diagnostics.</li>
            <li>
              Publishing history and analytics returned by third-party
              platforms.
            </li>
          </ul>

          <h3>e) Payment information (if applicable)</h3>
          <p>
            Handled by our payment processor. We do not store your full card
            details.
          </p>

          <h2>4. How we use your information</h2>
          <ul>
            <li>Provide, operate, and maintain the Service.</li>
            <li>
              Publish content to third-party social platforms{" "}
              <strong>on your explicit instruction</strong>.
            </li>
            <li>
              Authenticate users, including via HMAC-signed host-app
              integrations.
            </li>
            <li>
              Communicate with you about your account, updates, and support
              requests.
            </li>
            <li>
              Detect, prevent, and address fraud, abuse, or security incidents.
            </li>
            <li>Improve the Service, including debugging and analytics.</li>
            <li>
              Comply with legal obligations under applicable Indian law,
              including the{" "}
              <strong>
                Digital Personal Data Protection Act, 2023 (DPDP Act)
              </strong>
              .
            </li>
          </ul>
          <p>
            We do <strong>not</strong> use your content to train AI models
            without your explicit consent.
          </p>

          <h2>5. How we share your information</h2>

          <h3>a) Third-party social media platforms</h3>
          <p>
            When you publish content, we transmit that content and required
            metadata to the relevant platform (LinkedIn, Meta/Facebook/Instagram,
            TikTok, YouTube, X, etc.) via their official APIs. Their handling of
            your data is governed by their own privacy policies.
          </p>

          <h3>b) Host applications (multi-tenant model)</h3>
          <p>
            If you access Agent Elephant through a host application (e.g.,
            hellostores or another integrated partner), your account data and
            content are scoped to that host application. The host application
            administrator may have access to activity within their tenant.
          </p>

          <h3>c) Service providers</h3>
          <p>
            We use trusted vendors for hosting (Vercel), databases (Supabase),
            background jobs (Inngest), and analytics. These providers process
            data only on our instructions and under contractual confidentiality
            obligations.
          </p>

          <h3>d) Legal requirements</h3>
          <p>
            We may disclose information if required by law, court order, or
            valid governmental request, or to protect our rights, users, or the
            public.
          </p>

          <h3>e) Business transfers</h3>
          <p>
            In the event of a merger, acquisition, or asset sale, information
            may be transferred to the successor entity, subject to this Privacy
            Policy.
          </p>

          <p>
            We do <strong>not</strong> sell your personal information.
          </p>

          <h2>6. Third-party integrations</h2>
          <ul>
            <li>
              <strong>Meta (Facebook, Instagram)</strong> — subject to Meta
              Platform Terms.
            </li>
            <li>
              <strong>LinkedIn</strong> — subject to LinkedIn API Terms.
            </li>
            <li>
              <strong>TikTok</strong> — subject to TikTok Developer Terms.
            </li>
            <li>
              <strong>YouTube (Google)</strong> — subject to YouTube API
              Services Terms and the Google Privacy Policy.
            </li>
            <li>
              <strong>X (Twitter)</strong> — subject to X Developer Agreement.
            </li>
          </ul>
          <p>
            By connecting these accounts, you also agree to the applicable
            third-party terms. You may disconnect any integration at any time
            from your account settings; disconnecting revokes our stored tokens
            for that platform.
          </p>

          <h2>7. Data retention</h2>
          <ul>
            <li>
              <strong>Account data:</strong> retained while your account is
              active and for up to 90 days after account deletion, unless a
              longer period is required by law.
            </li>
            <li>
              <strong>Content and analytics:</strong> retained while your
              account is active. Deleted upon account closure or upon request,
              subject to legal holds.
            </li>
            <li>
              <strong>OAuth tokens:</strong> deleted immediately when you
              disconnect a social account or delete your account.
            </li>
            <li>
              <strong>Log data:</strong> retained for up to 12 months for
              security and diagnostic purposes.
            </li>
          </ul>

          <h2>8. Your rights under the DPDP Act, 2023</h2>
          <p>If you are located in India, you have the following rights:</p>
          <ul>
            <li>
              <strong>Right to access</strong> — request a copy of the personal
              data we hold about you.
            </li>
            <li>
              <strong>Right to correction and erasure</strong> — request that
              inaccurate data be corrected or that your data be deleted.
            </li>
            <li>
              <strong>Right to grievance redressal</strong> — raise concerns
              with us; if unresolved, escalate to the Data Protection Board of
              India.
            </li>
            <li>
              <strong>Right to nominate</strong> — appoint another individual to
              exercise rights on your behalf in the event of death or
              incapacity.
            </li>
            <li>
              <strong>Right to withdraw consent</strong> — you may withdraw
              consent for processing at any time; this does not affect
              processing done prior to withdrawal.
            </li>
          </ul>
          <p>
            To exercise any of these rights, contact{" "}
            <strong>hellostores.socials@gmail.com</strong>. We will respond
            within the statutory timeframe.
          </p>

          <h2>9. Data security</h2>
          <ul>
            <li>Encryption of data in transit (TLS) and at rest.</li>
            <li>HMAC signature verification for host-app authentication.</li>
            <li>
              Row-level security (RLS) in our database to scope tenant data.
            </li>
            <li>Restricted access to production systems.</li>
          </ul>
          <p>
            No method of transmission or storage is 100% secure. We cannot
            guarantee absolute security, but we notify affected users of a data
            breach in accordance with the DPDP Act.
          </p>

          <h2>10. Children&rsquo;s privacy</h2>
          <p>
            Agent Elephant is not intended for individuals under 18 years of
            age. We do not knowingly collect personal information from children.
            If we learn that we have collected such information, we will delete
            it promptly.
          </p>

          <h2>11. International transfers</h2>
          <p>
            Our infrastructure providers may process data in regions outside
            India. Where such transfers occur, we ensure appropriate safeguards
            are in place consistent with the DPDP Act.
          </p>

          <h2>12. Changes to this Privacy Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. Material
            changes will be notified via email or in-product notice at least 7
            days before they take effect. Continued use of the Service after the
            effective date constitutes acceptance.
          </p>

          <h2>13. Grievance Officer</h2>
          <p>
            In accordance with the DPDP Act, 2023, complaints may be directed to
            our Grievance Officer:
          </p>
          <p>
            <strong>Email:</strong> hellostores.socials@gmail.com
            <br />
            <strong>Response time:</strong> within 30 days of receipt.
          </p>

          <h2>14. Contact</h2>
          <p>
            For any questions about this Privacy Policy, please contact us at{" "}
            <strong>hellostores.socials@gmail.com</strong>.
          </p>
        </article>
      </section>
      <Footer />
    </main>
  );
}
