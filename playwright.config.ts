import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright configuration for E2E testing of Strata rendering examples
 * and Capacitor plugin integration
 */
export default defineConfig({
    testDir: './tests/e2e',
    fullyParallel: true,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 2 : 0,
    workers: process.env.CI ? 1 : undefined,

    // Enhanced reporter configuration for CI with JUnit XML and TestOmat.io
    reporter: process.env.CI
        ? [
              ['list'],
              [
                  'junit',
                  {
                      outputFile: 'test-results/junit.xml',
                      embedAnnotationsAsProperties: true,
                      embedAttachmentsAsProperty: 'attachments',
                  },
              ],
              // TestOmat.io reporter (if TESTOMATIO env var is set)
              ...(process.env.TESTOMATIO
                  ? [['@testomatio/reporter/lib/adapter/playwright.js']]
                  : []),
              [
                  'html',
                  {
                      outputFolder: 'test-results/html-report',
                      open: 'never',
                  },
              ],
          ]
        : [
              ['html', { open: 'on-failure' }],
              ['list'],
          ],

    use: {
        baseURL: 'http://localhost:3000',
        // Enhanced tracing for better debugging
        trace: process.env.CI ? 'retain-on-failure' : 'on-first-retry',
        // Capture screenshots on failure and during important steps
        screenshot: process.env.CI ? 'on' : 'only-on-failure',
        // Enable video recording for all tests in CI
        video: process.env.CI ? 'retain-on-failure' : 'off',
        // Additional context for debugging
        contextOptions: {
            recordVideo: process.env.CI
                ? {
                      dir: 'test-results/videos',
                      size: { width: 1280, height: 720 },
                  }
                : undefined,
        },
    },

    // Output directory for test artifacts
    outputDir: 'test-results/test-output',

    projects: [
        {
            name: 'chromium',
            use: { ...devices['Desktop Chrome'] },
        },
        {
            name: 'firefox',
            use: { ...devices['Desktop Firefox'] },
        },
        {
            name: 'webkit',
            use: { ...devices['Desktop Safari'] },
        },
        {
            name: 'Mobile Chrome',
            use: { ...devices['Pixel 5'] },
        },
        {
            name: 'Mobile Safari',
            use: { ...devices['iPhone 12'] },
        },
    ],

    webServer: {
        command: 'npm run dev',
        url: 'http://localhost:3000',
        reuseExistingServer: !process.env.CI,
    },
});
