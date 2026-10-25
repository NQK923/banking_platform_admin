# E-Wallet Admin Console

Internal operations console for the E-Wallet platform, built with Next.js and TypeScript. Administrators can inspect accounts and transfers, review risk decisions, run reconciliation, query audit records, replay notification DLQ messages, and handle support cases.

Related repositories: [Backend](https://github.com/NQK923/banking_platform) · [Flutter client](https://github.com/NQK923/banking_platform_user).

## Features

- Dashboard with operational summaries and charts.
- Account and transaction search, pagination, and account suspension.
- Risk evaluation review and approval/rejection workflows.
- Reconciliation runs and audit log inspection.
- Notification dead-letter queue inspection and replay.
- Support case management, English/Vietnamese localization, and theme switching.

## Technology stack

Next.js 16, React 19, TypeScript, TanStack Query, Tailwind CSS 4, shadcn/ui, React Hook Form, Zod, and Recharts. Tests use Vitest, Testing Library, and Playwright. Exact dependency versions are recorded in `package-lock.json`.

## Prerequisites

- Node.js 22 and npm, matching CI.
- A running [E-Wallet API Gateway](https://github.com/NQK923/banking_platform#readme) for login and operational features.
- An administrator account; the backend seeds `admin@local.test` with the configured seed password.

Docker is not required for frontend linting, unit tests, or production builds.

## Installation

Run the following commands from this repository's root:

```powershell
npm ci
Copy-Item .env.example .env.local
```

Edit `.env.local` before starting the application:

```dotenv
GATEWAY_URL=http://localhost:8080
SESSION_SECRET=<replace-with-a-random-secret-at-least-32-characters-long>
```

| Variable | Description |
| --- | --- |
| `GATEWAY_URL` | Server-side gateway origin; defaults to `http://localhost:8080` |
| `SESSION_SECRET` | Required signing secret for admin sessions; use at least 32 random characters |

Use the published gateway port if it differs from `8080`. Keep `.env.local` uncommitted and never place credentials in `NEXT_PUBLIC_*` variables.

## Development

```powershell
npm run dev
```

Open `http://localhost:3000` and sign in with a backend administrator account. Ordinary wallet users cannot create an admin session.

## Production build

```powershell
npm run build
npm run start
```

Provide the required environment variables when building and running the server. Production session cookies use `Secure`, so serve the deployed console over HTTPS.

## Verification

```powershell
npm run lint
npm audit --audit-level=high
npm test
npm run build
```

These checks run without Docker or a live backend. They do not validate operational requests against deployed services. CI runs the same checks on Node.js 22.

### Browser release smoke

The Playwright suite requires a live development gateway and the configured seed administrator password. It creates test data and performs administrative actions; use a disposable environment.

```powershell
npx playwright install chromium
$env:GATEWAY_URL = 'http://localhost:8080'
$env:ADMIN_E2E_PASSWORD = '<your-local-admin-password>'
npm run e2e:release
```

| Variable | Default / behavior |
| --- | --- |
| `ADMIN_E2E_EMAIL` | `admin@local.test` |
| `ADMIN_E2E_PASSWORD` | Falls back to `BANKING_SEED_ADMIN_PASSWORD` |
| `ADMIN_E2E_PORT` | `3100`; port for the Playwright-managed Next.js development server |

The suite uses a development server, so a passing run is not a production deployment test. Its gateway/password settings must be available in the shell environment.

### ChromeDriver for Flutter integration

The `chromedriver` development dependency supports the separate workspace Flutter web integration gate. Playwright uses its own browser installation.

When matching ChromeDriver to locally installed Chrome, set this before dependency installation or rebuilding the driver:

```powershell
$env:DETECT_CHROMEDRIVER_VERSION = 'true'
npm rebuild chromedriver
```

The npm package version and the downloaded browser-driver version are separate.

## Project structure

```text
src/
├── actions/       # Server actions and authentication
├── app/           # App Router pages and layouts
├── components/    # Feature tables, charts, forms, and shared UI
├── lib/           # Gateway client, session handling, contracts, and utilities
└── proxy.ts       # Request/session policy and CSP

e2e/               # Live gateway release smoke tests
playwright.config.ts
vitest.config.mts
```

## Security and money handling

- Backend access/refresh tokens are kept in the signed httpOnly session cookie and used by server-side BFF requests.
- Admin roles are checked before session creation; privileged operations are also authorized by the backend.
- Gateway fetches use `no-store`. Authentication failures clear cached operator data before navigation.
- The proxy supplies per-request CSP nonces to server rendering and theme initialization. Development permits script evaluation for debugging; production does not.
- Monetary fields are decimal strings and are formatted without converting amounts to JavaScript numbers. Missing or malformed values display `—`.
- Dependency overrides for PostCSS and basic-ftp are recorded in `package.json`; review them alongside the lockfile when updating dependencies. `shadcn` is development tooling.

## Workspace documentation

The complete local workspace contains design documents and `scripts/verify.ps1`, which runs Docker-free checks across all three projects. These files are maintained outside this repository and are not downloaded by a standalone clone.

The workspace `scripts/release-e2e.ps1` starts backend infrastructure by default. Supply `-SkipBackendStart` to use an existing local gateway. See the workspace release audit for outstanding integration and deployment validation; unit tests and a frontend build alone do not establish release readiness.
