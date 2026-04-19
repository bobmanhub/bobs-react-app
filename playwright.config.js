import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: '.',
  timeout: 30000,
  testMatch: '**/*.spec.ts',
  use: {
    baseURL: 'http://localhost:5173/bobs-react-app',
    headless: true,
    trace: 'on-first-retry',
  },
});
