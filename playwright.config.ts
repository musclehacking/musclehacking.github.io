import { defineConfig, devices } from '@playwright/test';

// AUD-05 needs the same specs to run against the isolated hosted review Worker.
// Setting `MUSCLEHACKING_BASE_URL` points the suite at that origin, suppresses the
// local `webServer`, and selects the portable suite by excluding `@local-runtime`
// checks (raw loopback sockets and the local Static Assets Host contract).
const hostedBaseUrl = process.env.MUSCLEHACKING_BASE_URL;

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  retries: 0,
  reporter: 'line',
  grepInvert: hostedBaseUrl ? /@local-runtime/ : undefined,
  use: {
    baseURL: hostedBaseUrl ?? 'http://127.0.0.1:8787',
    trace: 'retain-on-failure',
  },
  webServer: hostedBaseUrl ? undefined : {
    command: 'pnpm build && pnpm exec wrangler dev --port 8787',
    url: 'http://127.0.0.1:8787',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile-chromium', use: { ...devices['Pixel 7'] } },
  ],
});
