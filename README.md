# Why You Keep Having the Same Fight

A dependency-free, browser-based 12-question relationship quiz. It answers one practical question: when tension starts, which response does the visitor reach for first? The complete result is ungated, answers remain in the browser, and optional guide, PDF, and session destinations are controlled from one configuration file.

Every completion ends with one primary role: The Fixer (Body-inspired), The Performer (Heart-inspired), or The Analyst (Head-inspired). These are reflection lenses—not fixed identities, an official Enneagram typing instrument, a diagnosis, or percentages of a personality. Results are derived locally from 12 required single-choice answers. A one- or two-choice lead is described as close. An exact top tie opens one visible clarifying question between only the tied roles; that answer is counted and disclosed, so a completed report never invents a hidden winner.

The report reflects the visitor's own choices in four dynamic areas: how the pattern may show up, why the primary role was selected, what they may want most, and a small practice plus safe conversation prompt. The full Body, Heart, and Head response mix remains visible as choice shares, not personality percentages.

## Preview locally

From this directory, start any static file server:

```sh
python3 -m http.server 8765 --bind 127.0.0.1
```

Then open <http://127.0.0.1:8765/>. The legacy `/quiz.html` path is also retained for hosts that do not apply `_redirects` locally.

Do not test by double-clicking the HTML file: ES modules may be blocked on `file://` URLs.

## Verify

```sh
node --test tests/*.test.mjs
```

With the local server running, open <http://127.0.0.1:8765/tests/quiz-browser-flow.html>. Wait for its visible `PASS` or `FAIL` summary; it deterministically times out rather than remaining in a running state. The served harness covers all three leading profiles, a one-choice close result, every pairwise tie and a three-way tie, unsubmitted core selection restoration, direct and clarified result restoration, clarifier Back/reload/submit, edit invalidation, answer-shaped report modules, settled landmark/live-region semantics, scoped deletion, fail-closed conversion links, and runtime errors. It removes only the quiz storage key and preserves unrelated site storage.

Before launch, also complete `tests/quiz-browser-checklist.md` in the intended production host and browsers. At minimum, exercise all primary and clarifier paths, Back/edit, reload/restore, deletion, keyboard navigation, 320px reflow, 400% zoom, reduced motion, forced colors, and print preview.

## Configure Kit and the session link

Edit only the top-level launch values in `src/quiz/quiz-launch-config.js`:

- `kitFormUrl`: the published **hosted Kit form URL** for the universal companion guide.
- `sessionUrl`: the published session details/booking page.
- `privacyUrl`: the current privacy notice. The guide remains hidden until both this and `kitFormUrl` are valid.
- `supportUrl`: the intended support/safety resource.
- `guideName`: the exact name of the universal resource delivered through Kit.
- `profilePdfUrls.body`, `.heart`, and `.head`: optional direct HTTPS links to the corresponding general profile PDFs. Leave each unavailable resource empty. A completed result may show only its singular primary profile's configured PDF.

Leave an unavailable URL as an empty string. Its card must remain hidden; do not add a disabled or “coming soon” control. Only `https:` production destinations are accepted. The Kit destination receives what a visitor enters on Kit—not quiz answers, Body/Heart/Head keys, profile identity, counts, percentages, result kind, relationship or sexual content, or result prose.

In Kit, create a form/tag specifically for the companion guide, enable the confirmation/delivery email, confirm the linked asset exactly matches the on-page promise, and test new, existing, unsubscribed, and malformed-address paths. The quiz intentionally does not claim to email the personalized map; visitors can print or save that result in the browser.

The session destination should disclose provider identity and qualifications, audience, scope, format, price, cancellation terms, privacy, booking/sales expectations, and what the session is not before its URL is enabled. Missing or partial configuration fails closed: no disabled or dead card is rendered.

## Deploy

This is a dependency-free static site. The included preparation script copies only runtime files into `dist/`, keeping research, tests, and operational notes out of the public deployment.

```sh
node tools/prepare-deploy.mjs
```

### Netlify

- Publish directory: `dist`
- Build command: `node tools/prepare-deploy.mjs`
- `_redirects` makes `/quiz.html` redirect to `/`.
- Verify the included security headers in `netlify.toml` against the live response.

### Other static hosts

Run `node tools/prepare-deploy.mjs`, then upload the contents of `dist/`. Configure a permanent `/quiz.html` → `/` redirect in the host dashboard if it does not read `_redirects`. No server runtime or environment variables are required after deployment.

## Production launch gate

The repository ships with `noindex` in both HTML entry points and `Disallow: /` in `robots.txt`. This prevents accidental staging indexing. After the real domain, Kit/session/privacy destinations, browser checklist, content, and share image have been approved:

1. Add the production canonical URL and absolute `og:url`/`og:image` URLs to both entry points.
2. Change both robots meta tags to `index, follow`.
3. Change `robots.txt` to `Allow: /` and add the production sitemap if one exists.
4. Re-run automated and live smoke tests after the final deploy.

Until all four steps are deliberately completed, treat the deployment as preview/staging—not a public SEO launch.

## Privacy and storage

Quiz answers are stored under `starship-aligned-quiz-session-v3` in local browser storage so an interrupted session can resume. In-progress data expires after one day and completed data after seven days. The known v2 and v1 records are incompatible with the new questions and result rules; they are replaced instead of being reinterpreted. Scoped deletion removes only quiz records and never clears unrelated site storage. A visitor can review, retake, print, or delete the current quiz record from the result/exit controls. Results, report modules, and response-share percentages are always recomputed locally from sanitized answers. No answers, profile, center, counts, percentages, report prose, or relationship/sexual information are added to URLs or sent to Kit. No analytics or marketing pixels are enabled by default.

## Roll back

Use the hosting provider’s previous-deploy restore function or redeploy the last known-good Git commit. After rollback, verify `/`, `/quiz.html`, leading and clarifier result paths, delete, print, and every configured external destination. If a broken external destination caused the incident, first clear that URL in `src/quiz/quiz-launch-config.js` so the optional card disappears, then redeploy.

Research, decisions, release gates, and the audit/revise record live under `planning/`.
