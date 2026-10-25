# banking_platform_admin

Internal E-Wallet operations console built with Next.js, React Query, Tailwind and shadcn/ui. It provides account/transaction search, audited account suspension, risk review, reconciliation, audit logs, DLQ replay and support-case handling.

## Setup

```powershell
$env:DETECT_CHROMEDRIVER_VERSION = 'true'
npm ci
```

The ChromeDriver installer environment setting selects a binary matching installed Chrome; the npm tool version is separate. After a browser update, run `npm rebuild chromedriver` with that setting. The tool is used by the Flutter web release integration, not the production admin server.

Set `GATEWAY_URL` to the backend gateway origin (default `http://localhost:8080`) and supply `SESSION_SECRET` through your environment or a local, uncommitted `.env.local`. Backend tokens remain in the httpOnly session cookie and server-side BFF calls; never put secrets in `NEXT_PUBLIC_*` variables.

```powershell
npm run dev
```

## Verification

```powershell
npm run lint
npm audit --audit-level=high
npm test
npm run build
```

These checks do not require Docker or a running backend. The workspace `scripts/verify.ps1` runs them alongside Docker-free backend and Flutter checks.

`npm run e2e:release` requires a live gateway and `ADMIN_E2E_PASSWORD` (or `BANKING_SEED_ADMIN_PASSWORD`). It exercises real backend operations; do not point it at production data. The separate workspace `scripts/release-e2e.ps1` starts infrastructure unless `-SkipBackendStart` is supplied.

## Security and money

Admin roles are checked before session creation and by the backend for privileged requests. Gateway fetches use `no-store`. The proxy applies CSP with per-request script nonces; the dynamic root layout passes the nonce to theme initialization. Development allows script evaluation for the Next.js debugger; production does not.

All monetary fields are decimal strings. Formatting preserves precision without converting amounts to JavaScript numbers; missing or malformed amounts display `—` instead of zero. Currency precision is owned by the backend currency contract.

The lockfile includes security updates for Next.js 16.4.3, Zod, Vitest and ChromeDriver tooling. `shadcn` is a development dependency used for CSS/build tooling. The PostCSS 8.5.31 override prevents resolving an affected nested PostCSS version; basic-ftp 6.2.3 patches the ChromeDriver proxy-download dependency chain while preserving the `Client` API used by get-uri.
