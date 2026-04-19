import { defineConfig } from '@playwright/test';
import { config } from '@utils/config.js';

export default defineConfig({
  // Global setup/teardown
  testDir: './tests',
  globalSetup: './tests/global.setup.ts',
  
  // Timeouts
  timeout: 60000,
  
  // Test workers - sequential to avoid conflicts
  workers: 1,
  fullyParallel: false,
  
  // Retries
  retries: 1,
  
  // Expect timeout
  expect: {
    timeout: 30000
  },
  
  use: {
    baseURL: config.baseURL,
    headless: true,
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'on-first-retry',
    navigationTimeout: 30000,
    actionTimeout: 30000
  },
  
  reporter: [
    ['list'],
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    ['junit', { outputFile: 'test-results/results.xml' }]
  ],
});