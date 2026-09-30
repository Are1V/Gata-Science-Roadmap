import { defineConfig, devices } from '@playwright/test';
const base = (process.env.BASE_PATH || '/').replace(/\/$/, '');
export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  workers: 2,
  retries: process.env.CI ? 1 : 0,
  use: { baseURL: `http://localhost:4321${base}/`, trace: 'retain-on-failure' },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 1050 } },
    },
  ],
  webServer: {
    command: 'npm run preview -- --port 4321 --ignore-lock',
    url: `http://localhost:4321${base}/`,
    reuseExistingServer: !process.env.CI,
  },
  reporter: 'list',
});
