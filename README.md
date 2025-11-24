
# Fastpass

Fastpass is a next-generation web app and SDK focused on streamlined authentication and autofill experiences for web apps. It combines a client-facing Next.js site, demo flows (autofill and SSO), and a small embeddable SDK (button) that sites can integrate to surface a passwordless/autofill experience to their users.

Key ideas:

- Make secure sign-in and credential autofill simple for developers to integrate.
- Provide interactive demos and a dashboard for managing client apps and configuration.
- Offer a lightweight SDK (embeddable button) and server endpoints for integration.

Core features

- Next.js app with demo pages: Autofill demo, SSO demo, and client-specific demo pages.
- Dashboard for managing apps, viewing activity, and updating settings (under `src/app/dashboard`).
- Embeddable SDK endpoint for a button integration (`src/api/sdk/button/route.ts` and `src/app/api/sdk/button/route.ts`).
- Firebase integration for auth and backend services (see `src/firebase`).
- Example app flows under `src/app/fastpass`, plus a `test` area for client-specific testing.

Project layout (high level)

- `src/app` — Main Next.js application (app directory). Contains pages for demos, dashboard, and developer tools.
- `src/api` — Server/edge route handlers used by the SDK and site.
- `src/components` — Reusable UI components and design system primitives.
- `src/firebase` — Firebase setup, providers, and auth helpers.
- `src/lib` — Utilities, types, and small helpers used across the app.

How it works (overview)

1. A site embeds the Fastpass SDK/button (or links to it) to offer users a quick sign-in/autofill option.
2. The SDK calls backend routes (`/api/sdk/button` and related endpoints) to fetch configuration and perform auth flows.
3. The Next.js site provides demo pages to show integration patterns and a dashboard to manage client app settings.

Running locally

1. Install dependencies: `npm install` (or `pnpm install` / `yarn`).
2. Create required environment variables (Firebase config, API keys) referenced in `src/firebase/config.ts`.
3. Start dev server: `npm run dev`.

Notes on configuration

- Firebase configuration is centralized under `src/firebase` — update `config.ts` with your project values.
- Many demo pages reference `clientId` or `appId` route params — these map to entries you would manage through the dashboard or seed data.

Contributing

Contributions are welcome. If you'd like help or want to add a feature, open an issue or a pull request. Keep changes focused and include tests where practical.

License

This repository does not specify a license file. Add a `LICENSE` if you want to make reuse terms explicit.

Where to look next

- Start at `src/app/page.tsx` for the main landing page.
- Explore demos in `src/app/fastpass` and `src/app/dev` to understand integration paths.
- Read `src/api/sdk/button/route.ts` to see how the embeddable button is served.

If you want, I can also:

- Add a short Quickstart section with exact env var names and example `.env.local`.
- Create a `CONTRIBUTING.md` and add a license.

---
Generated summary by the project maintainer assistant.
