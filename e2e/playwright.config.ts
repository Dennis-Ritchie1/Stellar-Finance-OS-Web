import { defineConfig, devices } from '@playwright/test';

const CI = !!process.env.CI;
const RELAY = 'http://localhost:5190';

// Both apps run their dev servers with the MSW mock API plus the e2e hooks (fake wallet, shared state).
const env = {
  VITE_ENABLE_MOCKS: 'true',
  VITE_E2E: 'true',
  VITE_E2E_RELAY_URL: RELAY,
  VITE_API_URL: 'http://localhost:3000/v1',
  VITE_PAY_APP_URL: 'http://localhost:5174',
  VITE_HORIZON_URL: 'https://horizon-testnet.stellar.org',
};

export default defineConfig({
  testDir: './specs',
  // All specs share one mock database through the relay, so they run one at a time.
  fullyParallel: false,
  workers: 1,
  forbidOnly: CI,
  retries: CI ? 1 : 0,
  reporter: [['list'], ['html', { open: 'never' }]],
  timeout: 60_000,
  expect: { timeout: 10_000 },
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    // The pay app is mobile-first: run the whole suite under WebKit with a phone viewport too.
    { name: 'webkit-mobile', use: { ...devices['iPhone 14'] } },
  ],
  webServer: [
    {
      command: 'node state-relay.mjs',
      url: `${RELAY}/health`,
      reuseExistingServer: !CI,
    },
    {
      command: 'pnpm --filter @finance-os/dashboard dev',
      url: 'http://localhost:5173',
      env,
      reuseExistingServer: !CI,
      timeout: 120_000,
    },
    {
      command: 'pnpm --filter @finance-os/pay dev',
      url: 'http://localhost:5174',
      env,
      reuseExistingServer: !CI,
      timeout: 120_000,
    },
  ],
});
