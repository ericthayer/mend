import { defineConfig } from '@playwright/test';

const isCI = Boolean(process.env.CI);
const isFastMode = process.env.PLAYWRIGHT_FAST === '1';
const skipWebServer = process.env.PLAYWRIGHT_SKIP_WEBSERVER === '1';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: !isCI,
  retries: 0,
  workers: isCI ? 1 : isFastMode ? 3 : 2,
  timeout: isFastMode ? 45_000 : 60_000,
  expect: {
    timeout: isFastMode ? 7_500 : 10_000,
  },
  use: {
    baseURL: 'http://127.0.0.1:4173',
    browserName: 'chromium',
    headless: true,
    trace: isFastMode ? 'off' : 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'off',
  },
  webServer: skipWebServer
    ? undefined
    : {
        command: 'npm run dev -- --host 127.0.0.1 --port 4173',
        url: 'http://127.0.0.1:4173',
        reuseExistingServer: !isCI,
        timeout: isFastMode ? 60_000 : 120_000,
      },
});
