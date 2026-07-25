# Brianna Bomi website

Standard Next.js App Router project configured for Vercel.

## Routes

- `/` — reserved for the main Brianna Bomi offer
- `/sexbydesign` — Sex by Design landing page
- `/sexbydesign/privacy` — Sex by Design privacy notice
- `/api/audit-signup` — server-side signup endpoint

## Local development

Requires Node.js 22 or later.

```bash
npm install
npm run dev
```

Open `http://localhost:3000/sexbydesign`.

## Production validation

```bash
npm run build
```

The build must complete with the standard Next.js output before deploying.

## Vercel

Import the GitHub repository as a Next.js project. Keep the root directory at
the repository root and use the default commands detected from `package.json`.

Set these environment variables in Vercel:

- `PUBLIC_SITE_URL=https://www.briannabomi.com`
- `NEXT_PUBLIC_SITE_URL=https://www.briannabomi.com`
- `SIGNUP_MODE`
- `KIT_API_KEY`
- `KIT_FORM_ID`
- `SIGNUP_HASH_SECRET`
- `NEXT_PUBLIC_PRIVACY_URL=/sexbydesign/privacy`
- `NEXT_PUBLIC_SUPPORT_URL` when a real support page is available

Do not commit real secret values. See `.env.example` for the complete contract.
