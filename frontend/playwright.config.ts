import { defineConfig, devices } from '@playwright/test';

/** Port of the dev server the suite starts; override with E2E_PORT when it is taken. */
const port = Number(process.env['E2E_PORT'] ?? 4317);

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env['CI'],
  retries: process.env['CI'] ? 1 : 0,
  expect: { timeout: 10_000 },
  reporter: [['list']],
  use: {
    baseURL: `http://localhost:${port}`,
    trace: 'retain-on-failure',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: `npx ng serve the-debate-app --configuration production --port ${port}`,
    url: `http://localhost:${port}`,
    reuseExistingServer: !process.env['CI'],
    timeout: 180_000,
  },
});
