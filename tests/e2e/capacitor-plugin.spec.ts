import { test, expect, Page } from '@playwright/test';
import * as path from 'path';

/**
 * E2E tests for @strata/capacitor-plugin
 *
 * Tests device detection, input handling (touch, keyboard, gamepad),
 * haptics functionality, and React hooks integration.
 *
 * Test Categories:
 * - Device Profiling
 * - Input State (Keyboard, Touch, Gamepad simulation)
 * - Haptics
 * - Control Hints
 * - Event Listeners
 */

const TEST_APP_PATH = path.join(__dirname, 'fixtures', 'capacitor-test-app.html');

test.describe('Capacitor Plugin - Device Profiling', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto(`file://${TEST_APP_PATH}`);
        await page.waitForSelector('[data-testid="page-title"]', { timeout: 5000 });
    });

    test('should detect platform information', async ({ page }) => {
        const platform = await page.locator('[data-testid="platform"]').textContent();
        expect(platform).toMatch(/^(web|android|ios|windows|macos|linux)$/);

        // Take screenshot for visual verification
        await expect(page.locator('[data-testid="device-section"]')).toBeVisible();
        await page.screenshot({
            path: 'test-results/screenshots/device-profile.png',
            fullPage: false,
        });
    });

    test('should detect device type correctly', async ({ page }) => {
        const deviceType = await page.locator('[data-testid="device-type"]').textContent();
        expect(deviceType).toMatch(/^(mobile|tablet|desktop|foldable)$/);
    });

    test('should detect input mode', async ({ page }) => {
        const inputMode = await page.locator('[data-testid="input-mode"]').textContent();
        expect(inputMode).toMatch(/^(touch|keyboard|gamepad|hybrid)$/);
    });

    test('should detect orientation', async ({ page }) => {
        const orientation = await page.locator('[data-testid="orientation"]').textContent();
        expect(orientation).toMatch(/^(portrait|landscape)$/);
    });

    test('should report screen dimensions', async ({ page }) => {
        const screenSize = await page.locator('[data-testid="screen-size"]').textContent();
        expect(screenSize).toMatch(/^\d+ × \d+$/);

        const pixelRatio = await page.locator('[data-testid="pixel-ratio"]').textContent();
        expect(parseFloat(pixelRatio || '0')).toBeGreaterThan(0);
    });

    test('should detect touch capability', async ({ page }) => {
        const hasTouch = await page.locator('[data-testid="has-touch"]').textContent();
        expect(hasTouch).toMatch(/^(Yes|No)$/);
    });

    test('should update device profile on orientation change', async ({ page, browserName }) => {
        test.skip(browserName !== 'chromium', 'Orientation simulation only supported in Chromium');

        const initialOrientation = await page.locator('[data-testid="orientation"]').textContent();

        // Rotate to portrait
        await page.setViewportSize({ width: 375, height: 812 });
        await page.waitForTimeout(100);
        const portraitOrientation = await page.locator('[data-testid="orientation"]').textContent();
        expect(portraitOrientation).toBe('portrait');

        // Rotate to landscape
        await page.setViewportSize({ width: 812, height: 375 });
        await page.waitForTimeout(100);
        const landscapeOrientation = await page.locator('[data-testid="orientation"]').textContent();
        expect(landscapeOrientation).toBe('landscape');
    });
});

test.describe('Capacitor Plugin - Keyboard Input', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto(`file://${TEST_APP_PATH}`);
        await page.waitForSelector('[data-testid="input-section"]', { timeout: 5000 });
    });

    test('should handle WASD movement keys', async ({ page }) => {
        // Press W (forward)
        await page.keyboard.press('w');
        await page.waitForTimeout(100);
        let leftY = await page.locator('[data-testid="left-y"]').textContent();
        expect(parseFloat(leftY || '0')).toBeLessThan(0);

        // Release W
        await page.keyboard.up('w');
        await page.waitForTimeout(100);
        leftY = await page.locator('[data-testid="left-y"]').textContent();
        expect(parseFloat(leftY || '0')).toBe(0);

        // Press S (backward)
        await page.keyboard.press('s');
        await page.waitForTimeout(100);
        leftY = await page.locator('[data-testid="left-y"]').textContent();
        expect(parseFloat(leftY || '0')).toBeGreaterThan(0);

        // Press A (left)
        await page.keyboard.down('a');
        await page.waitForTimeout(100);
        const leftX = await page.locator('[data-testid="left-x"]').textContent();
        expect(parseFloat(leftX || '0')).toBeLessThan(0);

        await page.keyboard.up('a');
        await page.keyboard.up('s');
    });

    test('should handle arrow keys for camera control', async ({ page }) => {
        // Press ArrowUp
        await page.keyboard.press('ArrowUp');
        await page.waitForTimeout(100);
        let rightY = await page.locator('[data-testid="right-y"]').textContent();
        expect(parseFloat(rightY || '0')).toBeLessThan(0);

        // Release and press ArrowRight
        await page.keyboard.up('ArrowUp');
        await page.keyboard.press('ArrowRight');
        await page.waitForTimeout(100);
        const rightX = await page.locator('[data-testid="right-x"]').textContent();
        expect(parseFloat(rightX || '0')).toBeGreaterThan(0);

        await page.keyboard.up('ArrowRight');

        // Take screenshot showing input state
        await page.screenshot({
            path: 'test-results/screenshots/keyboard-input.png',
            clip: { x: 0, y: 200, width: 800, height: 400 },
        });
    });

    test('should handle multiple simultaneous keys', async ({ page }) => {
        // Press W + D (forward-right diagonal)
        await page.keyboard.down('w');
        await page.keyboard.down('d');
        await page.waitForTimeout(100);

        const leftX = await page.locator('[data-testid="left-x"]').textContent();
        const leftY = await page.locator('[data-testid="left-y"]').textContent();

        expect(parseFloat(leftX || '0')).toBeGreaterThan(0);
        expect(parseFloat(leftY || '0')).toBeLessThan(0);

        await page.keyboard.up('w');
        await page.keyboard.up('d');
    });

    test('should handle spacebar for action button', async ({ page }) => {
        await page.keyboard.press('Space');
        await page.waitForTimeout(100);

        const buttonA = page.locator('[data-testid="button-a"]');
        await expect(buttonA).toHaveClass(/pressed/);

        await page.keyboard.up('Space');
        await page.waitForTimeout(100);
        await expect(buttonA).not.toHaveClass(/pressed/);
    });

    test('should visualize joystick movement', async ({ page }) => {
        // Press right
        await page.keyboard.down('d');
        await page.waitForTimeout(200);

        // Check that joystick thumb has moved
        const leftThumb = page.locator('[data-testid="left-thumb"]');
        const transform = await leftThumb.evaluate(el =>
            window.getComputedStyle(el).transform
        );
        expect(transform).not.toBe('none');

        await page.keyboard.up('d');
    });
});

test.describe('Capacitor Plugin - Touch Input', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto(`file://${TEST_APP_PATH}`);
        await page.waitForSelector('[data-testid="touch-area"]', { timeout: 5000 });
    });

    test('should detect touch start', async ({ page, browserName }) => {
        test.skip(browserName === 'webkit', 'Touch simulation not supported in WebKit');

        const touchArea = page.locator('[data-testid="touch-area"]');

        // Simulate touch
        await touchArea.dispatchEvent('touchstart', {
            touches: [{
                identifier: 0,
                clientX: 100,
                clientY: 100,
                pageX: 100,
                pageY: 100,
            }],
            changedTouches: [{
                identifier: 0,
                clientX: 100,
                clientY: 100,
                pageX: 100,
                pageY: 100,
            }]
        });

        await page.waitForTimeout(100);
        const activeCount = await page.locator('[data-testid="active-touches"]').textContent();
        expect(parseInt(activeCount || '0')).toBeGreaterThan(0);
    });

    test('should track multiple touch points', async ({ page, browserName }) => {
        test.skip(browserName === 'webkit', 'Touch simulation not supported in WebKit');

        const touchArea = page.locator('[data-testid="touch-area"]');

        // Simulate two-finger touch
        await touchArea.dispatchEvent('touchstart', {
            touches: [
                { identifier: 0, clientX: 100, clientY: 100, pageX: 100, pageY: 100 },
                { identifier: 1, clientX: 200, clientY: 200, pageX: 200, pageY: 200 }
            ],
            changedTouches: [
                { identifier: 0, clientX: 100, clientY: 100, pageX: 100, pageY: 100 },
                { identifier: 1, clientX: 200, clientY: 200, pageX: 200, pageY: 200 }
            ]
        });

        await page.waitForTimeout(100);
        const activeCount = await page.locator('[data-testid="active-touches"]').textContent();
        expect(parseInt(activeCount || '0')).toBe(2);

        // Take screenshot showing touch points
        await page.screenshot({
            path: 'test-results/screenshots/touch-input.png',
            clip: { x: 0, y: 600, width: 800, height: 300 },
        });
    });

    test('should clear touches on touch end', async ({ page, browserName }) => {
        test.skip(browserName === 'webkit', 'Touch simulation not supported in WebKit');

        const touchArea = page.locator('[data-testid="touch-area"]');

        // Start touch
        await touchArea.dispatchEvent('touchstart', {
            touches: [{ identifier: 0, clientX: 150, clientY: 150, pageX: 150, pageY: 150 }],
            changedTouches: [{ identifier: 0, clientX: 150, clientY: 150, pageX: 150, pageY: 150 }]
        });

        await page.waitForTimeout(100);
        let activeCount = await page.locator('[data-testid="active-touches"]').textContent();
        expect(parseInt(activeCount || '0')).toBeGreaterThan(0);

        // End touch
        await touchArea.dispatchEvent('touchend', {
            touches: [],
            changedTouches: [{ identifier: 0, clientX: 150, clientY: 150, pageX: 150, pageY: 150 }]
        });

        await page.waitForTimeout(100);
        activeCount = await page.locator('[data-testid="active-touches"]').textContent();
        expect(parseInt(activeCount || '0')).toBe(0);
    });
});

test.describe('Capacitor Plugin - Haptics', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto(`file://${TEST_APP_PATH}`);
        await page.waitForSelector('[data-testid="haptics-section"]', { timeout: 5000 });
    });

    test('should trigger light haptic feedback', async ({ page }) => {
        const lightBtn = page.locator('[data-testid="haptic-light"]');
        await lightBtn.click();
        await page.waitForTimeout(200);

        // Check that log was updated
        const log = page.locator('[data-testid="haptics-log"]');
        await expect(log).toContainText('intensity');
        await expect(log).toContainText('light');
    });

    test('should trigger medium haptic feedback', async ({ page }) => {
        const mediumBtn = page.locator('[data-testid="haptic-medium"]');
        await mediumBtn.click();
        await page.waitForTimeout(200);

        const log = page.locator('[data-testid="haptics-log"]');
        await expect(log).toContainText('medium');
    });

    test('should trigger heavy haptic feedback', async ({ page }) => {
        const heavyBtn = page.locator('[data-testid="haptic-heavy"]');
        await heavyBtn.click();
        await page.waitForTimeout(200);

        const log = page.locator('[data-testid="haptics-log"]');
        await expect(log).toContainText('heavy');
    });

    test('should handle custom intensity and duration', async ({ page }) => {
        const customBtn = page.locator('[data-testid="haptic-custom"]');
        await customBtn.click();
        await page.waitForTimeout(200);

        const log = page.locator('[data-testid="haptics-log"]');
        await expect(log).toContainText('customIntensity');
        await expect(log).toContainText('0.5');
        await expect(log).toContainText('duration');
        await expect(log).toContainText('200');

        // Take screenshot of haptics section
        await page.screenshot({
            path: 'test-results/screenshots/haptics-controls.png',
            clip: { x: 0, y: 1000, width: 800, height: 400 },
        });
    });

    test('should handle vibration patterns', async ({ page }) => {
        const patternBtn = page.locator('[data-testid="haptic-pattern"]');
        await patternBtn.click();
        await page.waitForTimeout(200);

        const log = page.locator('[data-testid="haptics-log"]');
        await expect(log).toContainText('pattern');
    });

    test('should trigger multiple haptics in sequence', async ({ page }) => {
        // Trigger light, medium, heavy in quick succession
        await page.locator('[data-testid="haptic-light"]').click();
        await page.waitForTimeout(100);
        await page.locator('[data-testid="haptic-medium"]').click();
        await page.waitForTimeout(100);
        await page.locator('[data-testid="haptic-heavy"]').click();
        await page.waitForTimeout(200);

        const log = page.locator('[data-testid="haptics-log"]');
        const logText = await log.textContent();
        expect(logText).toContain('light');
        expect(logText).toContain('medium');
        expect(logText).toContain('heavy');
    });
});

test.describe('Capacitor Plugin - Control Hints', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto(`file://${TEST_APP_PATH}`);
        await page.waitForSelector('[data-testid="hints-section"]', { timeout: 5000 });
    });

    test('should provide movement hint', async ({ page }) => {
        const movementHint = await page.locator('[data-testid="hint-movement"]').textContent();
        expect(movementHint).toBeTruthy();
        expect(movementHint).toMatch(/(move|WASD|joystick|stick)/i);
    });

    test('should provide camera hint', async ({ page }) => {
        const cameraHint = await page.locator('[data-testid="hint-camera"]').textContent();
        expect(cameraHint).toBeTruthy();
        expect(cameraHint).toMatch(/(look|camera|mouse|drag|stick)/i);
    });

    test('should provide action hint', async ({ page }) => {
        const actionHint = await page.locator('[data-testid="hint-action"]').textContent();
        expect(actionHint).toBeTruthy();
        expect(actionHint).toMatch(/(interact|tap|button|E)/i);
    });

    test('should provide menu hint', async ({ page }) => {
        const menuHint = await page.locator('[data-testid="hint-menu"]').textContent();
        expect(menuHint).toBeTruthy();
        expect(menuHint).toMatch(/(menu|ESC|Start)/i);
    });

    test('should adapt hints based on input mode', async ({ page }) => {
        // Get initial hints
        const initialMovement = await page.locator('[data-testid="hint-movement"]').textContent();
        expect(initialMovement).toBeTruthy();

        // Hints should be context-appropriate based on detected input mode
        const inputMode = await page.locator('[data-testid="input-mode"]').textContent();

        if (inputMode === 'keyboard') {
            expect(initialMovement).toContain('WASD');
        } else if (inputMode === 'touch') {
            expect(initialMovement).toMatch(/(drag|joystick)/i);
        } else if (inputMode === 'gamepad') {
            expect(initialMovement).toMatch(/stick/i);
        }
    });
});

test.describe('Capacitor Plugin - Event Log', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto(`file://${TEST_APP_PATH}`);
        await page.waitForSelector('[data-testid="event-log"]', { timeout: 5000 });
    });

    test('should log initialization', async ({ page }) => {
        const log = page.locator('[data-testid="event-log"]');
        await expect(log).toContainText('initialized');
    });

    test('should log device profile load', async ({ page }) => {
        const log = page.locator('[data-testid="event-log"]');
        await expect(log).toContainText('Device profile loaded');
    });

    test('should log keyboard events', async ({ page }) => {
        await page.keyboard.press('w');
        await page.waitForTimeout(100);

        const log = page.locator('[data-testid="event-log"]');
        await expect(log).toContainText('Key pressed');
    });
});

test.describe('Capacitor Plugin - Visual Regression', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto(`file://${TEST_APP_PATH}`);
        await page.waitForSelector('[data-testid="page-title"]', { timeout: 5000 });
        await page.waitForTimeout(500); // Let UI stabilize
    });

    test('should match full page screenshot', async ({ page }) => {
        await expect(page).toHaveScreenshot('capacitor-plugin-full-page.png', {
            fullPage: true,
            animations: 'disabled',
        });
    });

    test('should match device section screenshot', async ({ page }) => {
        const deviceSection = page.locator('[data-testid="device-section"]');
        await expect(deviceSection).toHaveScreenshot('device-section.png');
    });

    test('should match input visualization screenshot', async ({ page }) => {
        const inputSection = page.locator('[data-testid="input-section"]');
        await expect(inputSection).toHaveScreenshot('input-section.png');
    });

    test('should match haptics section screenshot', async ({ page }) => {
        const hapticsSection = page.locator('[data-testid="haptics-section"]');
        await expect(hapticsSection).toHaveScreenshot('haptics-section.png');
    });
});

test.describe('Capacitor Plugin - Performance', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto(`file://${TEST_APP_PATH}`);
        await page.waitForSelector('[data-testid="page-title"]', { timeout: 5000 });
    });

    test('should load within acceptable time', async ({ page }) => {
        const startTime = Date.now();
        await page.waitForSelector('[data-testid="device-section"]', { timeout: 5000 });
        const loadTime = Date.now() - startTime;

        expect(loadTime).toBeLessThan(2000); // Should load within 2 seconds
    });

    test('should handle rapid input updates', async ({ page }) => {
        // Rapidly press and release keys
        for (let i = 0; i < 10; i++) {
            await page.keyboard.down('w');
            await page.keyboard.up('w');
        }

        // Should still be responsive
        await page.keyboard.press('w');
        await page.waitForTimeout(100);
        const leftY = await page.locator('[data-testid="left-y"]').textContent();
        expect(parseFloat(leftY || '0')).toBeLessThan(0);

        await page.keyboard.up('w');
    });

    test('should maintain responsive UI during input', async ({ page }) => {
        // Start continuous input
        await page.keyboard.down('w');
        await page.keyboard.down('d');

        // UI should still update
        await page.waitForTimeout(200);
        const leftX = await page.locator('[data-testid="left-x"]').textContent();
        const leftY = await page.locator('[data-testid="left-y"]').textContent();

        expect(parseFloat(leftX || '0')).toBeGreaterThan(0);
        expect(parseFloat(leftY || '0')).toBeLessThan(0);

        await page.keyboard.up('w');
        await page.keyboard.up('d');
    });
});

test.describe('Capacitor Plugin - Cross-browser Compatibility', () => {
    test('should work in Chromium', async ({ page, browserName }) => {
        test.skip(browserName !== 'chromium');

        await page.goto(`file://${TEST_APP_PATH}`);
        const platform = await page.locator('[data-testid="platform"]').textContent();
        expect(platform).toBeTruthy();
    });

    test('should work in Firefox', async ({ page, browserName }) => {
        test.skip(browserName !== 'firefox');

        await page.goto(`file://${TEST_APP_PATH}`);
        const platform = await page.locator('[data-testid="platform"]').textContent();
        expect(platform).toBeTruthy();
    });

    test('should work in WebKit', async ({ page, browserName }) => {
        test.skip(browserName !== 'webkit');

        await page.goto(`file://${TEST_APP_PATH}`);
        const platform = await page.locator('[data-testid="platform"]').textContent();
        expect(platform).toBeTruthy();
    });
});
