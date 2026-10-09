# GBP Manager

A dummy Next.js app for integrating with the Google Business Profile APIs:
sign in with Google, list the locations on your Business Profile, edit
business info & hours, publish posts, and reply to reviews / answer
questions.

## Why everything is "mocked" by default

Google deprecated most of the old **My Business API v4** and now gates
*every* Business Profile API behind an access-request process — there is no
tier that's open by default:

- **Basic API Access** gates the Account Management and Business
  Information APIs (accounts, locations, business info, hours, photos).
  A brand-new Google Cloud project gets **0 quota** for these until Google
  approves a request — every call 429s with `RESOURCE_EXHAUSTED` until then.
  Request it at https://support.google.com/business/contact/api_default
  ("Application For Basic API Access"). You'll need: company name, contact
  email, project number, a website domain matching your email domain, and
  a Google Business Profile that's been verified and active for 60+ days.
  Review takes anywhere from days to a few weeks.
- **Standard API Access** (on top of Basic) additionally gates Posts,
  Reviews and Q&A.

Because of this, the app mocks all of it by default — in-memory data
(`lib/google/mock-data.ts` for posts/reviews/Q&A; a module-level mock
account+location in `accounts.ts`/`locations.ts`) seeded with sample
content, so the full UI works immediately with no Google approval at all.
Flip the flags below to `false` independently as each tier gets approved,
and the app calls the real Google endpoints instead — no other code
changes needed. Mock state is in-memory and resets whenever the dev server
restarts.

## Setup

1. **Create a Google Cloud project** at console.cloud.google.com (or reuse
   one you have).

2. **Enable the APIs** (APIs & Services > Library) — this makes the calls
   reach Google at all, but they'll still 429 until Basic Access is
   approved (see above):
   - My Business Account Management API
   - My Business Business Information API
   - (Optional, only needed once you flip off mock mode and have Standard
     access too) My Business API, My Business Q&A API

3. **Configure the OAuth consent screen** (APIs & Services > OAuth consent
   screen). "External" + "Testing" mode is fine for a dummy project — add
   your own Google account as a test user.

4. **Create an OAuth client ID** (APIs & Services > Credentials > Create
   Credentials > OAuth client ID > Web application). Add this authorized
   redirect URI (then click **Save** at the bottom of the page — just
   typing it into the field isn't enough):
   ```
   http://localhost:3000/api/auth/google/callback
   ```

5. **Copy the env file and fill it in:**
   ```bash
   cp .env.local.example .env.local
   ```
   - `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` — from the OAuth client
     you just created.
   - `SESSION_SECRET` — generate with `openssl rand -base64 32`.
   - Leave `GBP_MOCK_LOCATIONS` / `GBP_MOCK_POSTS` / `GBP_MOCK_REVIEWS` /
     `GBP_MOCK_QNA` as `true` until you've been approved for the
     corresponding access tier (see above).

6. **(Optional) Request Basic / Standard API Access** at
   https://support.google.com/business/contact/api_default if you want the
   real data instead of mocks. Not required to run the app.

7. **Install and run:**
   ```bash
   npm install
   npm run dev
   ```
   Open http://localhost:3000 and sign in with the Google account that
   manages your Business Profile (the account/location itself is mocked by
   default, so it doesn't need to actually manage anything yet).

## How it's built

- Next.js App Router, TypeScript, Tailwind CSS.
- OAuth2 tokens are kept **server-side only**, in an encrypted HTTP-only
  session cookie (`iron-session`) — never sent to the browser.
- `lib/google/` wraps the Google REST endpoints: `oauth.ts` (token
  exchange/refresh), `accounts.ts` + `locations.ts` + `posts.ts` +
  `reviews.ts` + `qna.ts` (real calls, each with a mock fallback used by
  default — see above).
- `app/api/` has the Next.js route handlers the frontend calls; they're the
  only place access tokens are read/refreshed.
- `app/dashboard/` has the UI: a location list, and per-location tabs for
  Info & Hours, Posts, and Reviews & Q&A.

## Limitations (it's a dummy project)

- Single-user: the session cookie holds one Google account's tokens at a
  time. No database, no multi-tenant support.
- Hours editing assumes one open/close period per day (no split shifts).
- No image/photo upload UI (Business Information API supports it; not
  wired up here).
