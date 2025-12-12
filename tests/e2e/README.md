# Strata E2E Tests

End-to-end tests for Strata, including comprehensive tests for the Capacitor plugin.

## Test Structure

```
tests/e2e/
├── fixtures/
│   └── capacitor-test-app.html    # Standalone test application for capacitor plugin
├── capacitor-plugin.spec.ts        # Comprehensive capacitor plugin tests
└── rendering.spec.ts               # Strata rendering tests
```

## Running Tests

### All E2E Tests
```bash
npm run test:e2e
```

### Capacitor Plugin Tests Only
```bash
npm run test:e2e:capacitor
```

### With UI Mode (Interactive)
```bash
npm run test:e2e:ui
```

### In Headed Mode (See Browser)
```bash
npm run test:e2e:headed
```

### Debug Mode (Step Through Tests)
```bash
npm run test:e2e:debug
```

### Specific Browser
```bash
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit
```

## Capacitor Plugin Test Coverage

The `capacitor-plugin.spec.ts` test suite provides comprehensive coverage of the `@strata/capacitor-plugin` package:

### Device Profiling Tests
- ✅ Platform detection (iOS, Android, Windows, macOS, Linux, Web)
- ✅ Device type detection (mobile, tablet, foldable, desktop)
- ✅ Input mode detection (touch, keyboard, gamepad, hybrid)
- ✅ Orientation detection (portrait, landscape)
- ✅ Screen dimensions and pixel ratio
- ✅ Touch and gamepad capability detection
- ✅ Orientation change handling

### Keyboard Input Tests
- ✅ WASD movement keys
- ✅ Arrow keys for camera control
- ✅ Multiple simultaneous key presses
- ✅ Spacebar for action button
- ✅ Joystick visualization updates

### Touch Input Tests
- ✅ Touch start detection
- ✅ Multiple touch points tracking
- ✅ Touch end/clear behavior
- ✅ Touch point visualization

### Haptics Tests
- ✅ Light intensity haptics
- ✅ Medium intensity haptics
- ✅ Heavy intensity haptics
- ✅ Custom intensity and duration
- ✅ Vibration patterns
- ✅ Multiple haptics in sequence

### Control Hints Tests
- ✅ Movement hints
- ✅ Camera hints
- ✅ Action hints
- ✅ Menu hints
- ✅ Context-aware hint adaptation

### Visual Regression Tests
- ✅ Full page screenshot comparison
- ✅ Device section screenshot
- ✅ Input visualization screenshot
- ✅ Haptics section screenshot

### Performance Tests
- ✅ Page load time verification
- ✅ Rapid input handling
- ✅ UI responsiveness during input

### Cross-browser Compatibility
- ✅ Chromium (Chrome, Edge)
- ✅ Firefox
- ✅ WebKit (Safari)

## Test Reports

### JUnit XML (for CI/CD)

JUnit XML reports are generated automatically in CI environments:

```
test-results/junit.xml
```

This format is compatible with:
- ✅ Mergify CI Insights
- ✅ GitHub Actions
- ✅ Jenkins
- ✅ Azure DevOps
- ✅ CircleCI
- ✅ GitLab CI

### TestOmat.io Integration

To enable TestOmat.io reporting:

1. Set the `TESTOMATIO` environment variable with your project API key:
   ```bash
   export TESTOMATIO=your-api-key
   ```

2. Run tests:
   ```bash
   npm run test:e2e
   ```

3. View results at https://app.testomat.io/

### HTML Report

Interactive HTML reports are generated after test runs:

```bash
npx playwright show-report
```

Or in CI:
```
test-results/html-report/index.html
```

## Screenshots and Videos

### Screenshots

Screenshots are captured:
- ✅ On test failure (always)
- ✅ During visual regression tests
- ✅ At key test steps (in CI)

Location: `test-results/screenshots/`

### Videos

Videos are recorded in CI environments for failed tests:

Location: `test-results/videos/`

Configuration:
- Resolution: 1280x720
- Retention: On failure only (CI)
- Format: WebM

## Test Fixtures

### Capacitor Test Application

The `capacitor-test-app.html` fixture is a standalone web application that:

- ✅ Implements a mock Capacitor plugin for web testing
- ✅ Provides visual feedback for all plugin features
- ✅ Supports keyboard, touch, and gamepad input
- ✅ Displays real-time input state
- ✅ Logs all events for verification
- ✅ Can be opened directly in a browser for manual testing

**Manual Testing:**
```bash
open tests/e2e/fixtures/capacitor-test-app.html
```

## CI Configuration

### GitHub Actions

The tests run automatically on:
- ✅ Pull requests
- ✅ Pushes to main branch
- ✅ Manual workflow dispatch

Configuration features:
- Retries: 2 (in CI)
- Workers: 1 (in CI for stability)
- Parallel execution: Enabled
- Fail fast: Disabled (run all tests)

### Environment Variables

Set these in your CI environment:

| Variable | Description | Required |
|----------|-------------|----------|
| `CI` | Enables CI mode (set automatically by most CI systems) | Auto |
| `TESTOMATIO` | TestOmat.io API key for test management | Optional |

## Debugging Failed Tests

### View Trace

When a test fails, a trace file is generated:

```bash
npx playwright show-trace test-results/.../trace.zip
```

This shows:
- Screenshots at each step
- Network requests
- Console logs
- DOM snapshots

### Run in Debug Mode

```bash
npm run test:e2e:debug
```

This opens Playwright Inspector where you can:
- Step through tests
- Set breakpoints
- Inspect elements
- View console output

### Run in Headed Mode

```bash
npm run test:e2e:headed
```

See the browser window and watch tests execute in real-time.

## Writing New Tests

### Test Structure

```typescript
import { test, expect } from '@playwright/test';

test.describe('Feature Name', () => {
    test.beforeEach(async ({ page }) => {
        // Setup
        await page.goto('/your-test-page');
    });

    test('should do something', async ({ page }) => {
        // Arrange
        const element = page.locator('[data-testid="element"]');

        // Act
        await element.click();

        // Assert
        await expect(element).toHaveText('Expected Text');
    });
});
```

### Best Practices

1. **Use data-testid attributes** for stable selectors
2. **Take screenshots** at key verification points
3. **Wait for elements** before interacting
4. **Test cross-browser** when features differ
5. **Add timeouts** for async operations
6. **Group related tests** with describe blocks
7. **Clean up state** in beforeEach/afterEach hooks

### Screenshot Naming

Convention: `{feature}-{variant}.png`

Examples:
- `device-profile.png`
- `keyboard-input.png`
- `haptics-controls.png`

## Performance Benchmarks

Target metrics for Capacitor plugin tests:

| Metric | Target | Current |
|--------|--------|---------|
| Page Load | < 2s | ✅ |
| Input Response | < 100ms | ✅ |
| Haptics Trigger | < 50ms | ✅ |
| Total Test Suite | < 5min | ✅ |

## Troubleshooting

### Tests Timeout

Increase timeout in playwright.config.ts:
```typescript
test.setTimeout(60000); // 60 seconds
```

### Screenshots Don't Match

Update baseline screenshots:
```bash
npx playwright test --update-snapshots
```

### Tests Fail in CI but Pass Locally

Check for:
- Different screen resolutions
- Timing issues (add waitForTimeout)
- Browser differences (skip test for specific browsers)

### Video Recording Disabled

Videos are only recorded in CI. To enable locally:
```bash
CI=1 npm run test:e2e
```

## Resources

- [Playwright Documentation](https://playwright.dev)
- [TestOmat.io Documentation](https://docs.testomat.io)
- [Strata GitHub](https://github.com/jbcom/strata)
- [Capacitor Plugin README](../../packages/capacitor-plugin/README.md)
