import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy | Sex by Design",
  description:
    "How Sex by Design handles information submitted to request The Intimacy Audit.",
};

export default function PrivacyPage() {
  const supportUrl = process.env.NEXT_PUBLIC_SUPPORT_URL;

  return (
    <>
      <a className="skip-link" href="#main">
        Skip to main content
      </a>
      <header className="site-header">
        <div className="shell header-inner">
          <Link className="wordmark" href="/sexbydesign" aria-label="Sex by Design, home">
            SEX BY DESIGN
          </Link>
          <Link className="header-cta" href="/sexbydesign">
            Back to the audit
          </Link>
        </div>
      </header>

      <main id="main" className="legal-page section">
        <article className="shell legal-content">
          <p className="eyebrow">Sex by Design</p>
          <h1>Privacy Policy</h1>
          <p>
            This notice explains the information handled when you request The
            Intimacy Audit through this website.
          </p>

          <h2>Information you provide</h2>
          <p>
            The signup form asks for your first name and email address. A hidden anti-spam
            field may also be submitted. Do not enter intimate details,
            relationship information, audit answers, or information about
            another person in the form.
          </p>

          <h2>Information handled with the request</h2>
          <p>
            The request includes a submission timestamp and may include
            allowlisted campaign values from the page URL: source, medium,
            campaign, and content. The server may use a network address supplied
            by the hosting platform to enforce short-term rate limits. Email and
            network values are converted to keyed digests for the process-local
            rate limiter rather than stored there as readable values.
          </p>

          <h2>How the information is used</h2>
          <p>
            Your first name and email address are used to process your request, ask you to
            confirm the address, deliver the audit after confirmation, and send
            the follow-up described at signup. The technical request data is
            used to validate submissions, limit abuse, and maintain reliable
            delivery.
          </p>

          <h2>Kit email processing</h2>
          <p>
            Kit processes the email signup for Sex by Design. When delivery is
            live and a request is accepted, the server sends your first name and email address
            to Kit and associates it with the dedicated audit signup form. Kit
            then handles confirmation and email delivery under its own data
            processing terms.
          </p>

          <h2>Retention and your choices</h2>
          <p>
            Signup information is retained in Kit according to the configured
            email program and applicable requirements. You can unsubscribe
            using the link in an email. Unsubscribing stops future email covered
            by that request, subject to records that may need to be retained for
            legal, security, or suppression purposes.
          </p>

          <h2>Audit answers and analytics</h2>
          <p>
            This landing page does not ask for or submit audit answers. No
            advertising pixels, session replay, or heatmap capture are used by
            the current implementation. If measurement is added later, this
            notice must be updated before that processing begins.
          </p>

          <h2>Contact</h2>
          {supportUrl ? (
            <p>
              For privacy questions or requests, use the{" "}
              <a href={supportUrl}>contact page</a>.
            </p>
          ) : (
            <p>
              A privacy contact channel will be published here before live
              email collection is enabled.
            </p>
          )}

          <p className="legal-updated">Last updated: July 24, 2026.</p>
        </article>
      </main>

      <footer className="site-footer">
        <div className="shell footer-inner">
          <span className="wordmark">SEX BY DESIGN</span>
          <div className="footer-links">
            <Link href="/sexbydesign">The Intimacy Audit</Link>
            <p>© {new Date().getFullYear()} Sex by Design</p>
          </div>
        </div>
      </footer>
    </>
  );
}
