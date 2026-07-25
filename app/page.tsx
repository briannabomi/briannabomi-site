import type { Metadata } from "next";
import Image from "next/image";
import { AuditAnchorLink } from "./components/AuditAnchorLink";
import { AuditSignupForm } from "./components/AuditSignupForm";

export const metadata: Metadata = {
  title: "Why You’re Not Having the Sex You Want | Sex by Design",
  description:
    "Get clear on what’s blocking sex and connection so you can decide whether to repair your current relationship or create a new one that actually fits.",
};

const areas = [
  {
    title: "Desire",
    body: "The sexual pull has changed, and you want language for what you are noticing.",
  },
  {
    title: "Resentment",
    body: "Unresolved experiences may be shaping how close you feel.",
  },
  {
    title: "Avoidance",
    body: "Something feels off, but it remains unspoken.",
  },
  {
    title: "Compatibility",
    body: "You may want different things from sex, intimacy, or the relationship.",
  },
  {
    title: "Truth",
    body: "What you want has been difficult to name, even to yourself.",
  },
];

const auditContents = [
  {
    title: "Map the disconnection",
    body: "Work through five areas to notice where intimacy feels strained, absent, or unclear right now.",
  },
  {
    title: "Explore a recurring pattern",
    body: "Consider five lenses—the Performer, Shapeshifter, Controller, Ghost, and Compromiser. Each includes what the pattern can look like, what may shape it, what it can cost, and one practice for working with it.",
  },
  {
    title: "Name the relationship you want",
    body: "Put words to relationship structure, how responsibility and decisions are shared, emotional and sexual agreements, and personal non-negotiables.",
  },
  {
    title: "Choose what deserves attention next",
    body: "Identify a question, conversation, professional resource, or decision you may want to explore. You do not need to make a relationship decision today.",
  },
];

const questions = [
  {
    question: "Is this therapy or a diagnosis?",
    answer:
      "No. It is an educational reflection tool for adults. It does not provide therapy, medical advice, a diagnosis, or a verdict about your relationship.",
  },
  {
    question: "Do I need to share my answers with a partner?",
    answer:
      "No. Share only what you choose, and only when sharing feels safe.",
  },
  {
    question: "What do you ask for in the signup form?",
    answer:
      "Your first name and email address. Do not enter intimate or relationship details in the form.",
  },
  {
    question: "What happens after I submit?",
    answer:
      "We’ll ask you to confirm your email. After confirmation, we’ll send the audit. Delivery can take a few minutes.",
  },
];

export default function Home() {
  return (
    <>
      <a className="skip-link" href="#main">
        Skip to main content
      </a>

      <header className="site-header">
        <div className="shell header-inner">
          <a className="wordmark" href="#main" aria-label="Sex by Design, home">
            SEX BY DESIGN
          </a>
          <AuditAnchorLink className="header-cta" href="#audit-signup">
            Get the audit
          </AuditAnchorLink>
        </div>
      </header>

      <main id="main">
        <section className="hero section">
          <div className="shell hero-grid">
            <div className="hero-copy">
              <p className="eyebrow">Sex by Design</p>
              <h1>Why You’re Not Having the Sex You Want</h1>
              <p className="hero-deck">
                Get clear on what’s blocking sex and connection so you can
                decide whether to repair your current relationship or create a
                new one that actually fits.
              </p>
              <p className="hero-details">
                For adults 18+ <span aria-hidden="true">·</span> Delivered by
                email <span aria-hidden="true">·</span> Complete at your own pace
              </p>
              <AuditSignupForm
                id="hero-audit-form"
                location="hero"
                heading="Get the Intimacy Audit"
                description="Enter your first name and email, and we’ll send a confirmation message."
              />
            </div>

            <div className="hero-photo">
              <div className="hero-photo-frame">
                <Image
                  className="hero-portrait"
                  src="/creator-portrait.jpeg"
                  alt="Portrait of the creator of Sex by Design"
                  width={2237}
                  height={1792}
                  sizes="(min-width: 64rem) 40vw, 100vw"
                  priority
                />
              </div>
            </div>
          </div>
        </section>

        <section className="recognition section" aria-labelledby="recognition-title">
          <div className="shell recognition-grid">
            <div>
              <p className="eyebrow">The familiar loop</p>
              <h2 id="recognition-title">You do not need another communication tip</h2>
              <p>
                The problem is not just stress or busyness.
              </p>
              <p>
                It is avoiding what you truly want while chasing a persona.
              </p>
              <p>
                What do you want from this relationship?
              </p>
              <p>
                Until that is clear, the loop continues:
              </p>
            </div>
            <ul className="recognition-list">
              <li>Telling yourself it’s “not that bad”</li>
              <li>Feeling more alone than when you were single</li>
              <li>Debating whether to repair the relationship or leave it</li>
            </ul>
          </div>
        </section>

        <section className="mechanism section" aria-labelledby="mechanism-title">
          <div className="shell">
            <div className="section-intro">
              <p className="eyebrow">Five areas to consider</p>
              <h2 id="mechanism-title">See where disconnection is showing up</h2>
              <p>
                This is not a personality quiz or a verdict about your
                relationship. It is a structured reflection across five areas:
              </p>
            </div>
            <ol className="areas-grid">
              {areas.map((area, index) => (
                <li className="area-item" key={area.title}>
                  <span className="item-number" aria-hidden="true">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <h3>{area.title}</h3>
                  <p>{area.body}</p>
                </li>
              ))}
            </ol>
            <p className="mechanism-close">
              First, notice the area that resonates today. Then explore a
              recurring pattern that may be keeping it in place.
            </p>
          </div>
        </section>

        <section className="inside section" aria-labelledby="inside-title">
          <div className="shell">
            <div className="section-intro">
              <p className="eyebrow">What you’ll explore</p>
              <h2 id="inside-title">Inside The Intimacy Audit</h2>
            </div>
            <ol className="deliverables-grid">
              {auditContents.map((item, index) => (
                <li className="deliverable" key={item.title}>
                  <span className="deliverable-number" aria-hidden="true">
                    {index + 1}
                  </span>
                  <div>
                    <h3>{item.title}</h3>
                    <p>{item.body}</p>
                  </div>
                </li>
              ))}
            </ol>
            <AuditAnchorLink className="primary-cta inside-cta" href="#audit-signup">
              Get the Intimacy Audit
            </AuditAnchorLink>
          </div>
        </section>

        <section className="fit section" aria-labelledby="fit-title">
          <div className="shell fit-grid">
            <div>
              <p className="eyebrow">A considered starting point</p>
              <h2 id="fit-title">This audit may be useful if…</h2>
              <ul className="fit-list">
                <li>You are in a relationship and feel sexually or emotionally disconnected</li>
                <li>Your work, health, or routines feel easier to manage than your relationship</li>
                <li>You are tired of calling it stress when you know it is something deeper</li>
                <li>You want structured prompts rather than generic advice</li>
                <li>You want to reflect before deciding what kind of conversation or support comes next</li>
              </ul>
            </div>
            <aside className="fit-boundaries" aria-label="Important boundaries">
              <h3>This is not for you if</h3>
              <ul>
                <li>You want to stay numb and keep calling that “being busy”</li>
                <li>You are looking for a quick trick instead of an honest diagnosis</li>
                <li>You are unwilling to tell yourself the truth about what you want</li>
              </ul>
            </aside>
          </div>
        </section>

        <section className="process section" aria-labelledby="process-title">
          <div className="shell">
            <div className="section-intro">
              <p className="eyebrow">What happens next</p>
              <h2 id="process-title">
                A clear request, with no intimate details in the form
              </h2>
            </div>
            <ol className="process-list">
              <li>
                <span aria-hidden="true">01</span>
                <h3>Request the audit</h3>
                <p>Enter your first name and email address.</p>
              </li>
              <li>
                <span aria-hidden="true">02</span>
                <h3>Confirm your email</h3>
                <p>
                  Check your inbox for a confirmation message from Sex by
                  Design.
                </p>
              </li>
              <li>
                <span aria-hidden="true">03</span>
                <h3>Receive the audit</h3>
                <p>
                  After you confirm, we’ll send the audit. Delivery can take a
                  few minutes.
                </p>
              </li>
            </ol>
          </div>
        </section>

        <section className="faq section" aria-labelledby="faq-title">
          <div className="shell faq-grid">
            <div>
              <p className="eyebrow">The essentials</p>
              <h2 id="faq-title">Questions before you begin</h2>
            </div>
            <div className="faq-list">
              {questions.map((item) => (
                <details key={item.question}>
                  <summary>{item.question}</summary>
                  <p>{item.answer}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section
          className="final-signup section"
          id="audit-signup"
          aria-labelledby="audit-signup-title"
        >
          <div className="shell final-signup-grid">
            <div>
              <p className="eyebrow">Begin privately</p>
              <h2 id="audit-signup-title">Give the questions your full attention</h2>
              <p>
                Use The Intimacy Audit to examine where disconnection is showing
                up, what pattern may be repeating, and what deserves attention
                next.
              </p>
            </div>
            <div>
              <AuditSignupForm id="final-audit-form" location="final" />
            </div>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="shell footer-inner">
          <span className="wordmark">SEX BY DESIGN</span>
          <div className="footer-links">
            <a href="/privacy">Privacy Policy</a>
            <p>© {new Date().getFullYear()} Sex by Design</p>
          </div>
        </div>
      </footer>
    </>
  );
}
