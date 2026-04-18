import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: '.github/resources',
  timeout: 30000,
  use: {
    baseURL: 'http://localhost:5173/bobs-react-app',
    headless: true,
    trace: 'on-first-retry',
  },
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173/bobs-react-app',
    reuseExistingServer: true,
    timeout: 30000,
  },
});
