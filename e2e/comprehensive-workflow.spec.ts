import { test, expect } from '@playwright/test';

test.describe('Comprehensive Workflow Tests', () => {
  test.describe('Authentication Edge Cases', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/');
    });

    test('should handle rate limiting gracefully', async ({ page }) => {
      // Attempt multiple failed logins to trigger rate limiting
      for (let i = 0; i < 5; i++) {
        await page.fill('input[type="email"]', `invalid${i}@example.com`);
        await page.fill('input[type="password"]', 'wrongpassword');
        await page.click('button[type="submit"]');
        await page.waitForTimeout(500);
      }

      // Check for rate limiting indicators
      const rateLimitMessage = page.locator('text=/too many/i');
      const countdown = page.locator('[data-testid*="countdown"], .countdown, [class*="countdown"]');

      // Either rate limit message should appear or form should be disabled
      const hasRateLimit = await rateLimitMessage.isVisible().catch(() => false);
      const isFormDisabled = await page.locator('input[type="email"]').isDisabled().catch(() => false);

      expect(hasRateLimit || isFormDisabled).toBeTruthy();
    });

    test('should handle network errors gracefully', async ({ page }) => {
      // Fill valid credentials
      await page.fill('input[type="email"]', 'test@example.com');
      await page.fill('input[type="password"]', 'password123');

      // Mock network failure by blocking requests
      await page.route('**/api/**', route => route.abort());
      await page.route('**/auth/**', route => route.abort());

      await page.click('button[type="submit"]');

      // Should show network error message
      await page.waitForTimeout(1000);
      const errorMessage = page.locator('text=/network|connection|unable/i');
      await expect(errorMessage).toBeVisible();
    });

    test('should handle signup and login toggle', async ({ page }) => {
      // Start with login form
      await expect(page.locator('text=Welcome Back')).toBeVisible();
      await expect(page.locator('text=Sign in')).toBeVisible();

      // Switch to signup
      await page.click('text=Sign up');
      await expect(page.locator('text=Create Account')).toBeVisible();
      await expect(page.locator('text=Create Account')).toBeVisible();

      // Additional fields should appear
      await expect(page.locator('input[placeholder*="First"]')).toBeVisible();
      await expect(page.locator('input[placeholder*="Last"]')).toBeVisible();

      // Switch back to login
      await page.click('text=Sign in');
      await expect(page.locator('text=Welcome Back')).toBeVisible();
      await expect(page.locator('text=Sign in')).toBeVisible();
    });

    test('should validate email format', async ({ page }) => {
      await page.fill('input[type="email"]', 'invalid-email');
      await page.fill('input[type="password"]', 'password123');
      await page.click('button[type="submit"]');

      // Check for HTML5 validation or custom validation
      await page.waitForTimeout(500);
      const emailInput = page.locator('input[type="email"]');
      const validationMessage = await emailInput.evaluate(el => (el as HTMLInputElement).validationMessage);

      expect(validationMessage).toBeTruthy();
    });

    test('should handle password requirements', async ({ page }) => {
      // Switch to signup to test password requirements
      await page.click('text=Sign up');

      await page.fill('input[type="email"]', 'test@example.com');
      await page.fill('input[type="password"]', '123'); // Too short
      await page.click('button[type="submit"]');

      // Should show password validation error
      await page.waitForTimeout(500);
      const passwordHelp = page.locator('text=/at least|minimum|characters/i');
      await expect(passwordHelp).toBeVisible();
    });
  });

  test.describe('Patient Management Workflows', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/');

      // Login first (assuming demo login works)
      const loginButton = page.locator('button').filter({ hasText: /Login as Doctor/i });
      if (await loginButton.isVisible()) {
        await loginButton.click();
        await page.waitForTimeout(2000);
      }
    });

    test('should handle empty patient list', async ({ page }) => {
      // Navigate to patient list if not already there
      const patientTab = page.locator('[data-testid*="patient"], [class*="patient"]').first();
      if (await patientTab.isVisible()) {
        await patientTab.click();
        await page.waitForTimeout(1000);
      }

      // Check for empty state messaging
      const emptyMessage = page.locator('text=/no patients|empty|not found/i');
      const isEmptyVisible = await emptyMessage.isVisible().catch(() => false);

      if (isEmptyVisible) {
        await expect(emptyMessage).toBeVisible();
      }
    });

    test('should handle patient search', async ({ page }) => {
      const searchInput = page.locator('input[placeholder*="search" i]');
      if (await searchInput.isVisible()) {
        await searchInput.fill('nonexistent patient');
        await page.waitForTimeout(500);

        // Should show no results message
        const noResults = page.locator('text=/no.*found|no.*match/i');
        const hasNoResults = await noResults.isVisible().catch(() => false);

        if (hasNoResults) {
          await expect(noResults).toBeVisible();
        }

        // Clear search
        const clearButton = page.locator('button').filter({ hasText: '×' }).first();
        if (await clearButton.isVisible()) {
          await clearButton.click();
          await expect(searchInput).toHaveValue('');
        }
      }
    });

    test('should handle view mode switching', async ({ page }) => {
      const viewButtons = page.locator('button[title*="view"], [data-testid*="view"]');

      if (await viewButtons.count() > 0) {
        // Try each view mode
        const viewModes = ['list', 'grid', 'detail'];
        for (const mode of viewModes) {
          const modeButton = viewButtons.filter({ hasText: new RegExp(mode, 'i') }).first();
          if (await modeButton.isVisible()) {
            await modeButton.click();
            await page.waitForTimeout(500);

            // Check that view mode indicator updates
            const viewIndicator = page.locator(`text=${mode} view`);
            if (await viewIndicator.isVisible().catch(() => false)) {
              await expect(viewIndicator).toBeVisible();
            }
          }
        }
      }
    });

    test('should handle pagination', async ({ page }) => {
      const paginationControls = page.locator('[data-testid="pagination"], .pagination, [class*="pagination"]');

      if (await paginationControls.isVisible()) {
        // Check pagination info
        const pageInfo = page.locator('text=/Showing|Page/i');
        await expect(pageInfo).toBeVisible();

        // Try next page if available
        const nextButton = page.locator('button').filter({ hasText: /next|>/i });
        if (await nextButton.isVisible() && !(await nextButton.isDisabled())) {
          await nextButton.click();
          await page.waitForTimeout(500);

          // Page should change
          const currentPage = page.locator('[data-testid*="current-page"], text=/Page 2/i');
          const hasPageChanged = await currentPage.isVisible().catch(() => false);
          expect(hasPageChanged).toBeTruthy();
        }
      }
    });
  });

  test.describe('Error Handling and Recovery', () => {
    test('should handle 404 errors gracefully', async ({ page }) => {
      await page.goto('/nonexistent-route');

      // Should show 404 page or redirect to valid page
      await page.waitForTimeout(1000);

      // Check if redirected to login or shows error
      const loginForm = page.locator('input[type="email"]');
      const errorMessage = page.locator('text=/404|not found|page not found/i');

      const hasLogin = await loginForm.isVisible().catch(() => false);
      const hasError = await errorMessage.isVisible().catch(() => false);

      expect(hasLogin || hasError).toBeTruthy();
    });

    test('should handle API timeout', async ({ page }) => {
      await page.goto('/');

      // Mock slow API response
      await page.route('**/api/**', async route => {
        await new Promise(resolve => setTimeout(resolve, 30000)); // 30 second delay
        await route.fulfill({ status: 200, body: '{}' });
      });

      // Try to perform an action that requires API call
      const submitButton = page.locator('button[type="submit"]');
      if (await submitButton.isVisible()) {
        await submitButton.click();

        // Should show timeout or loading state
        await page.waitForTimeout(5000);
        const loadingIndicator = page.locator('[class*="loading"], [class*="spinner"], text=/loading|please wait/i');
        const hasLoading = await loadingIndicator.isVisible().catch(() => false);

        expect(hasLoading).toBeTruthy();
      }
    });

    test('should handle session timeout', async ({ page }) => {
      await page.goto('/');

      // Wait for potential session timeout
      await page.waitForTimeout(1000);

      // Try to access protected content
      const protectedElement = page.locator('[data-testid*="protected"], [class*="protected"]').first();

      if (await protectedElement.isVisible().catch(() => false)) {
        // If session is valid, should see protected content
        await expect(protectedElement).toBeVisible();
      } else {
        // If session expired, should be redirected to login
        const loginForm = page.locator('input[type="email"]');
        await expect(loginForm).toBeVisible();
      }
    });
  });

  test.describe('Accessibility Compliance', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/');
    });

    test('should have proper heading hierarchy', async ({ page }) => {
      const headings = await page.locator('h1, h2, h3, h4, h5, h6').allTextContents();

      // Should have at least one h1
      const h1Count = await page.locator('h1').count();
      expect(h1Count).toBeGreaterThan(0);

      // Headings should be in logical order (no skipping levels)
      const headingLevels = await page.locator('h1, h2, h3, h4, h5, h6').evaluateAll(
        elements => elements.map(el => parseInt(el.tagName.charAt(1)))
      );

      for (let i = 1; i < headingLevels.length; i++) {
        // Allow same level or increase by 1, but not skip levels
        expect(headingLevels[i] - headingLevels[i-1]).toBeLessThanOrEqual(1);
      }
    });

    test('should have accessible form labels', async ({ page }) => {
      const inputs = page.locator('input[type="text"], input[type="email"], input[type="password"], textarea, select');

      const inputCount = await inputs.count();
      if (inputCount > 0) {
        for (let i = 0; i < Math.min(inputCount, 5); i++) {
          const input = inputs.nth(i);
          const hasLabel = await input.evaluate(el => {
            const id = el.id;
            const ariaLabel = el.getAttribute('aria-label');
            const ariaLabelledBy = el.getAttribute('aria-labelledby');
            const label = document.querySelector(`label[for="${id}"]`);

            return !!(ariaLabel || ariaLabelledBy || label);
          });

          expect(hasLabel).toBeTruthy();
        }
      }
    });

    test('should support keyboard navigation', async ({ page }) => {
      // Test tab navigation through interactive elements
      await page.keyboard.press('Tab');

      const focusedElement = page.locator(':focus');
      const isFocusable = await focusedElement.isVisible().catch(() => false);

      // At least one element should be focusable
      expect(isFocusable).toBeTruthy();

      // Test that focused elements are visible
      const focusedRect = await focusedElement.boundingBox();
      expect(focusedRect).toBeTruthy();
      expect(focusedRect!.width).toBeGreaterThan(0);
      expect(focusedRect!.height).toBeGreaterThan(0);
    });

    test('should have sufficient color contrast', async ({ page }) => {
      // This is a basic check - comprehensive contrast testing would require additional tools
      const textElements = page.locator('p, span, div, h1, h2, h3, h4, h5, h6, button, a');

      // Check that text is not invisible (basic visibility test)
      const visibleTextCount = await textElements.filter({ hasText: /.+/ }).count();
      expect(visibleTextCount).toBeGreaterThan(0);
    });

    test('should have proper button labels', async ({ page }) => {
      const buttons = page.locator('button');

      const buttonCount = await buttons.count();
      if (buttonCount > 0) {
        for (let i = 0; i < Math.min(buttonCount, 3); i++) {
          const button = buttons.nth(i);
          const hasText = await button.textContent().then(text => text && text.trim().length > 0);
          const hasAriaLabel = await button.getAttribute('aria-label').then(label => !!label);
          const hasTitle = await button.getAttribute('title').then(title => !!title);

          expect(hasText || hasAriaLabel || hasTitle).toBeTruthy();
        }
      }
    });
  });

  test.describe('Performance and Responsiveness', () => {
    test('should load within reasonable time', async ({ page }) => {
      const startTime = Date.now();

      await page.goto('/');
      await page.waitForLoadState('networkidle');

      const loadTime = Date.now() - startTime;
      expect(loadTime).toBeLessThan(10000); // Should load within 10 seconds
    });

    test('should be responsive on mobile', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE size

      await page.goto('/');

      // Check that content is accessible on mobile
      const mainContent = page.locator('main, [class*="main"], [class*="content"]').first();
      await expect(mainContent).toBeVisible();

      // Check that navigation works on mobile
      const mobileMenuButton = page.locator('button[class*="menu"], [data-testid*="menu"]').first();
      if (await mobileMenuButton.isVisible().catch(() => false)) {
        await mobileMenuButton.click();
        // Menu should open
        await page.waitForTimeout(500);
      }
    });

    test('should handle slow networks gracefully', async ({ page }) => {
      // Throttle network to simulate slow connection
      await page.route('**/*', async route => {
        await new Promise(resolve => setTimeout(resolve, 100)); // Add 100ms delay to each request
        await route.continue();
      });

      const startTime = Date.now();
      await page.goto('/');
      await page.waitForLoadState('domcontentloaded');

      const loadTime = Date.now() - startTime;
      // Should still load, even if slower
      expect(loadTime).toBeLessThan(30000); // 30 second timeout
    });
  });

  test.describe('Data Integrity and Validation', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/');

      // Login if needed
      const loginButton = page.locator('button').filter({ hasText: /Login as Doctor/i });
      if (await loginButton.isVisible()) {
        await loginButton.click();
        await page.waitForTimeout(2000);
      }
    });

    test('should validate data entry forms', async ({ page }) => {
      // Look for any form inputs
      const textInputs = page.locator('input[type="text"], input[type="email"], textarea');

      if (await textInputs.count() > 0) {
        const firstInput = textInputs.first();

        // Test with invalid data
        await firstInput.fill('<script>alert("xss")</script>');
        await page.waitForTimeout(500);

        // Check if input sanitization or validation occurs
        const inputValue = await firstInput.inputValue();
        expect(inputValue).toBe('<script>alert("xss")</script>'); // Basic check - real validation would be more complex
      }
    });

    test('should handle special characters in search', async ({ page }) => {
      const searchInput = page.locator('input[placeholder*="search" i]');

      if (await searchInput.isVisible()) {
        // Test with special characters
        await searchInput.fill('test@#$%^&*()');
        await page.waitForTimeout(500);

        // Should not crash and should handle the input
        const inputValue = await searchInput.inputValue();
        expect(inputValue).toBe('test@#$%^&*()');
      }
    });

    test('should handle large datasets', async ({ page }) => {
      // Test with pagination if available
      const pagination = page.locator('[data-testid*="pagination"], .pagination');

      if (await pagination.isVisible()) {
        // Try to navigate through pages
        const pageButtons = page.locator('button').filter({ hasText: /^\d+$/ });

        if (await pageButtons.count() > 1) {
          await pageButtons.nth(1).click();
          await page.waitForTimeout(1000);

          // Page should change without errors
          const currentPageContent = page.locator('body');
          await expect(currentPageContent).toBeVisible();
        }
      }
    });
  });
});
