import { Navbar } from "@/components/landing/navbar";
import { Footer } from "@/components/landing/footer";

export const metadata = {
  title: "Terms of Use — Agent Elephant",
  description:
    "The terms governing your access to and use of the Agent Elephant marketing platform.",
};

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-[#F5F0E8] text-zinc-900">
      <Navbar />
      <section className="mx-auto max-w-3xl px-6 py-16 sm:py-24">
        <header className="mb-10 border-b border-zinc-300 pb-8">
          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
            Terms of Use
          </h1>
          <p className="mt-3 text-sm text-zinc-600">
            Effective date: 25 August 2026 &middot; Last updated: 25 August 2026
          </p>
        </header>

        <article className="space-y-4 text-zinc-700 leading-relaxed [&_h2]:mt-10 [&_h2]:mb-3 [&_h2]:text-2xl [&_h2]:font-semibold [&_h2]:text-zinc-900 [&_h3]:mt-6 [&_h3]:mb-2 [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:text-zinc-900 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-2 [&_li]:marker:text-zinc-400 [&_strong]:font-semibold [&_strong]:text-zinc-900">
          <h2>1. Acceptance of Terms</h2>
          <p>
            These Terms of Use (&ldquo;Terms&rdquo;) govern your access to and
            use of <strong>Agent Elephant</strong> (the &ldquo;Service&rdquo;).
            By accessing or using the Service, you agree to be bound by these
            Terms. If you do not agree, do not use the Service.
          </p>
          <p>
            If you are using the Service on behalf of an organization, you
            represent that you have authority to bind that organization to these
            Terms.
          </p>

          <h2>2. Description of the Service</h2>
          <p>
            Agent Elephant is a multi-tenant marketing automation platform that
            allows users and host applications to:
          </p>
          <ul>
            <li>Connect third-party social media accounts.</li>
            <li>Schedule, publish, and manage marketing content.</li>
            <li>
              Organize content into campaigns, series, and calendars.
            </li>
            <li>
              Access analytics and publishing history returned by third-party
              platforms.
            </li>
          </ul>
          <p>
            The Service may be accessed directly or embedded within a host
            application via our SDK and shared-secret integration.
          </p>

          <h2>3. Eligibility</h2>
          <p>
            You must be at least 18 years old and legally capable of entering
            into a binding contract to use the Service. By using the Service,
            you represent that you meet these requirements.
          </p>

          <h2>4. Accounts</h2>
          <p>You are responsible for:</p>
          <ul>
            <li>Providing accurate and complete registration information.</li>
            <li>Maintaining the confidentiality of your credentials.</li>
            <li>All activity that occurs under your account.</li>
          </ul>
          <p>
            Notify us immediately at{" "}
            <strong>hellostores.socials@gmail.com</strong> if you suspect
            unauthorized use of your account.
          </p>

          <h2>5. Host Application Access</h2>
          <p>
            If you access Agent Elephant through a host application (e.g., an
            integrated partner platform), the host application may control
            certain aspects of your account. The host application&rsquo;s terms
            and privacy policy may apply in addition to these Terms.
          </p>

          <h2>6. Your Content</h2>
          <p>
            You retain ownership of all content you upload, create, or publish
            through the Service (&ldquo;Your Content&rdquo;).
          </p>
          <p>
            By using the Service, you grant Agent Elephant a{" "}
            <strong>
              limited, worldwide, non-exclusive, royalty-free license
            </strong>{" "}
            to store, process, transmit, and display Your Content solely to
            provide the Service — including publishing to the third-party
            platforms you connect.
          </p>
          <p>You represent and warrant that:</p>
          <ul>
            <li>You own or have all necessary rights to Your Content.</li>
            <li>
              Your Content does not infringe any third-party rights (copyright,
              trademark, privacy, publicity, etc.).
            </li>
            <li>
              Your Content complies with all applicable laws and the policies of
              the third-party platforms where it is published.
            </li>
          </ul>

          <h2>7. Third-Party Platforms</h2>
          <p>
            The Service publishes content to third-party platforms such as
            LinkedIn, Meta (Facebook/Instagram), TikTok, YouTube, and X. By
            connecting your accounts, you also agree to abide by those
            platforms&rsquo; terms of service and content policies.
          </p>
          <p>
            Agent Elephant is not affiliated with, endorsed by, or sponsored by
            these platforms. We are not responsible for:
          </p>
          <ul>
            <li>Changes to third-party APIs, features, or policies.</li>
            <li>
              Content moderation decisions made by third-party platforms.
            </li>
            <li>
              Interruptions, delays, or failures caused by third-party systems.
            </li>
          </ul>

          <h2>8. Acceptable Use</h2>
          <p>
            You agree <strong>not to</strong> use the Service to:
          </p>
          <ul>
            <li>
              Post or publish unlawful, defamatory, obscene, hateful, or
              infringing content.
            </li>
            <li>
              Publish spam, misleading advertising, or content that violates
              platform-specific policies.
            </li>
            <li>
              Impersonate any person or entity, or misrepresent your
              affiliation.
            </li>
            <li>
              Reverse-engineer, decompile, or attempt to extract source code
              from the Service.
            </li>
            <li>
              Interfere with, disrupt, or overload the Service or its
              infrastructure.
            </li>
            <li>
              Access the Service by any means other than the interfaces we
              provide.
            </li>
            <li>Use the Service to develop a competing product.</li>
            <li>
              Circumvent rate limits, quotas, or access controls of Agent
              Elephant or connected platforms.
            </li>
          </ul>
          <p>
            Violation may result in immediate suspension or termination of your
            account without refund.
          </p>

          <h2>9. Publishing on Your Behalf</h2>
          <p>
            You explicitly authorize Agent Elephant to publish content to
            third-party platforms <strong>on your behalf</strong> using the
            OAuth tokens you provide. You are solely responsible for the content
            you schedule and publish.
          </p>
          <p>
            You may revoke this authorization at any time by disconnecting the
            relevant social account or deleting your account.
          </p>

          <h2>10. Subscription, Fees, and Payment</h2>
          <p>If the Service offers paid plans:</p>
          <ul>
            <li>
              Fees, billing cycles, and payment terms will be presented at the
              time of purchase.
            </li>
            <li>Fees are non-refundable except where required by law.</li>
            <li>
              We reserve the right to change pricing with 30 days&rsquo; prior
              notice.
            </li>
            <li>Failure to pay may result in suspension or termination.</li>
          </ul>
          <p>
            Applicable taxes (including GST in India) are your responsibility
            unless expressly stated.
          </p>

          <h2>11. Intellectual Property</h2>
          <p>
            The Service, including its software, design, branding
            (&ldquo;Agent Elephant&rdquo; name and logo), and documentation, is
            owned by Agent Elephant and protected by intellectual property laws.
            No rights are granted to you other than the limited right to use the
            Service in accordance with these Terms.
          </p>

          <h2>12. Feedback</h2>
          <p>
            If you submit suggestions, ideas, or feedback about the Service, you
            grant us a perpetual, irrevocable, royalty-free license to use them
            without restriction or compensation.
          </p>

          <h2>13. Suspension and Termination</h2>
          <p>
            We may suspend or terminate your access to the Service at any time,
            with or without notice, if:
          </p>
          <ul>
            <li>You breach these Terms.</li>
            <li>
              Your use poses a security, legal, or reputational risk.
            </li>
            <li>
              Required by law or by a third-party platform whose policies you
              have violated.
            </li>
          </ul>
          <p>
            You may terminate your account at any time by contacting{" "}
            <strong>hellostores.socials@gmail.com</strong> or by using
            in-product deletion tools. Upon termination, your data will be
            handled as described in the Privacy Policy.
          </p>

          <h2>14. Disclaimers</h2>
          <p>
            THE SERVICE IS PROVIDED{" "}
            <strong>
              &ldquo;AS IS&rdquo; AND &ldquo;AS AVAILABLE&rdquo;
            </strong>{" "}
            WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING
            WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE,
            NON-INFRINGEMENT, AND UNINTERRUPTED OPERATION.
          </p>
          <p>We do not warrant that:</p>
          <ul>
            <li>
              The Service will be error-free, secure, or continuously available.
            </li>
            <li>
              Content will be successfully published to third-party platforms at
              any specific time.
            </li>
            <li>
              Third-party platforms will accept, retain, or display your
              content.
            </li>
          </ul>

          <h2>15. Limitation of Liability</h2>
          <p>
            TO THE MAXIMUM EXTENT PERMITTED BY LAW, AGENT ELEPHANT AND ITS
            AFFILIATES SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL,
            SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING LOSS OF
            PROFITS, REVENUE, DATA, OR GOODWILL, ARISING OUT OF OR RELATED TO
            YOUR USE OF THE SERVICE.
          </p>
          <p>
            OUR TOTAL AGGREGATE LIABILITY FOR ANY CLAIM ARISING OUT OF OR
            RELATING TO THE SERVICE SHALL NOT EXCEED THE GREATER OF (A) THE
            AMOUNT YOU PAID US IN THE <strong>THREE (3) MONTHS</strong>{" "}
            PRECEDING THE CLAIM, OR (B) <strong>INR 5,000</strong>.
          </p>

          <h2>16. Indemnification</h2>
          <p>
            You agree to indemnify, defend, and hold harmless Agent Elephant and
            its officers, employees, and affiliates from any claims, damages,
            liabilities, and expenses (including reasonable legal fees) arising
            out of:
          </p>
          <ul>
            <li>Your Content or your use of the Service.</li>
            <li>Your violation of these Terms.</li>
            <li>
              Your violation of any third-party rights or applicable law.
            </li>
          </ul>

          <h2>17. Governing Law and Dispute Resolution</h2>
          <p>
            These Terms are governed by the laws of <strong>India</strong>,
            without regard to conflict-of-laws principles.
          </p>
          <p>
            Any dispute arising out of or in connection with these Terms shall
            be subject to the{" "}
            <strong>exclusive jurisdiction of the courts in India</strong>. The
            parties agree to first attempt resolution through good-faith
            negotiation for a period of 30 days before initiating legal
            proceedings.
          </p>

          <h2>18. Changes to the Terms</h2>
          <p>
            We may modify these Terms at any time. Material changes will be
            notified via email or in-product notice at least 7 days before they
            take effect. Your continued use of the Service after the effective
            date constitutes acceptance.
          </p>

          <h2>19. Miscellaneous</h2>
          <ul>
            <li>
              <strong>Entire agreement:</strong> these Terms, together with the
              Privacy Policy, constitute the entire agreement between you and
              Agent Elephant.
            </li>
            <li>
              <strong>Severability:</strong> if any provision is found
              unenforceable, the remaining provisions remain in effect.
            </li>
            <li>
              <strong>No waiver:</strong> failure to enforce any provision is
              not a waiver of our rights.
            </li>
            <li>
              <strong>Assignment:</strong> you may not assign these Terms
              without our consent. We may assign these Terms to an affiliate or
              successor entity.
            </li>
          </ul>

          <h2>20. Contact</h2>
          <p>
            For any questions about these Terms, contact us at{" "}
            <strong>hellostores.socials@gmail.com</strong>.
          </p>
        </article>
      </section>
      <Footer />
    </main>
  );
}
