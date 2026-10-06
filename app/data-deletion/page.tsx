import { Navbar } from "@/components/landing/navbar";
import { Footer } from "@/components/landing/footer";

export const metadata = {
  title: "User Data Deletion Instructions — Agent Elephant",
  description:
    "Instructions for requesting deletion of your personal data and connected social accounts from Agent Elephant.",
};

export default function DataDeletionPage() {
  return (
    <main className="min-h-screen bg-[#F5F0E8] text-zinc-900">
      <Navbar />
      <section className="mx-auto max-w-3xl px-6 py-16 sm:py-24">
        <header className="mb-10 border-b border-zinc-300 pb-8">
          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
            User Data Deletion Instructions
          </h1>
          <p className="mt-3 text-sm text-zinc-600">
            Effective date: 25 August 2026 &middot; Last updated: 06 October 2026
          </p>
        </header>

        <article className="space-y-6 text-zinc-700 leading-relaxed [&_h2]:mt-10 [&_h2]:mb-3 [&_h2]:text-2xl [&_h2]:font-semibold [&_h2]:text-zinc-900 [&_h3]:mt-6 [&_h3]:mb-2 [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:text-zinc-900 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-2 [&_li]:marker:text-zinc-400 [&_strong]:font-semibold [&_strong]:text-zinc-900">
          <p>
            At <strong>Agent Elephant</strong>, we respect your privacy and provide complete control over your connected social media accounts and personal data.
          </p>

          <h2>1. How to Disconnect Your Social Media Accounts</h2>
          <p>
            You can revoke access and remove your stored Facebook, Instagram, YouTube, LinkedIn, or TikTok credentials at any time directly from the platform:
          </p>
          <ul>
            <li>Log into your <strong>Agent Elephant</strong> account.</li>
            <li>Navigate to <strong>Dashboard &gt; Settings &gt; Social Media Connections</strong>.</li>
            <li>Locate your connected account (e.g., Facebook Page or Instagram Business Profile).</li>
            <li>Click <strong>Disconnect</strong> or <strong>Remove Integration</strong>.</li>
          </ul>
          <p>
            Disconnecting an account immediately purges all stored OAuth access tokens and refresh tokens associated with that social profile from our database.
          </p>

          <h2>2. How to Request Complete Data Deletion</h2>
          <p>
            If you wish to permanently delete your entire Agent Elephant user profile, including all scheduled posts, media files, campaigns, and account metadata:
          </p>
          <ul>
            <li>
              Send an email to <strong>hellostores.socials@gmail.com</strong> with the subject line <code>Data Deletion Request</code>.
            </li>
            <li>
              Please include your registered account email address in the message body.
            </li>
          </ul>
          <p>
            Our support team will process your request and permanently delete all your data within <strong>48 hours</strong>, sending you a final confirmation email.
          </p>

          <h2>3. Removing Facebook App Permissions via Facebook</h2>
          <p>
            You can also remove Agent Elephant&apos;s access directly from your Facebook account settings:
          </p>
          <ul>
            <li>Go to your Facebook account <strong>Settings &amp; Privacy &gt; Settings</strong>.</li>
            <li>Select <strong>Business Integrations</strong> (or <strong>Apps and Websites</strong>).</li>
            <li>Locate <strong>Agent Elephant</strong> in the list.</li>
            <li>Click <strong>Remove</strong> to revoke all permissions.</li>
          </ul>

          <h2>4. Data Retention Policy</h2>
          <p>
            Upon receiving a data deletion request or account closure, all active OAuth tokens, personal identifiers, and scheduled media are permanently removed from our Supabase production database within 48 hours. Aggregated, non-identifiable log data may be retained for up to 90 days strictly for security diagnostics before complete purge.
          </p>

          <h2>5. Contact &amp; Support</h2>
          <p>
            For any questions regarding data removal or privacy controls, please contact our Data Officer:
          </p>
          <p>
            <strong>Email:</strong> hellostores.socials@gmail.com<br />
            <strong>Response Time:</strong> Within 24 hours.
          </p>
        </article>
      </section>
      <Footer />
    </main>
  );
}
