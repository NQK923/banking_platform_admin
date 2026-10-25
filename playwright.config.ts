import { defineConfig, devices } from "@playwright/test";

const port = Number(process.env.ADMIN_E2E_PORT ?? 3100);

export default defineConfig({
  testDir: "./e2e",
  timeout: 120_000,
  expect: {
    timeout: 10_000,
  },
  use: {
    baseURL: `http://127.0.0.1:${port}`,
    trace: "retain-on-failure",
  },
  webServer: {
    command: `npm run dev -- --hostname 127.0.0.1 --port ${port}`,
    url: `http://127.0.0.1:${port}/login`,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    env: {
      GATEWAY_URL: process.env.GATEWAY_URL ?? "http://localhost:8080",
      SESSION_SECRET: process.env.SESSION_SECRET ?? "release-e2e-session-secret-at-least-32-chars",
    },
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});
