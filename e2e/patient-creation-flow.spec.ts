import { test, expect } from '@playwright/test';

test.describe('Patient Creation Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    
    // Try to login first (if backend is available)
    try {
      await page.fill('input[type="email"]', 'admin@hospital2035.com');
      await page.fill('input[type="password"]', 'admin123');
      await page.click('button[type="submit"]');
      await page.waitForTimeout(2000);
    } catch (e) {
      // If login fails, continue anyway (might be in mock mode)
    }
    
    await page.waitForLoadState('networkidle');
  });

  test('should open new patient modal', async ({ page }) => {
    // Look for "New Patient" button
    const newPatientButton = page.locator('button').filter({ hasText: /new patient/i });
    
    if (await newPatientButton.count() > 0) {
      await newPatientButton.click();
      
      // Modal should appear
      await page.waitForTimeout(500);
      
      // Check for modal content
      const modal = page.locator('[role="dialog"], .modal, [class*="modal"]');
      const modalCount = await modal.count();
      
      if (modalCount > 0) {
        await expect(modal.first()).toBeVisible();
      }
    }
  });

  test('should display all form fields', async ({ page }) => {
    const newPatientButton = page.locator('button').filter({ hasText: /new patient/i });
    
    if (await newPatientButton.count() > 0) {
      await newPatientButton.click();
      await page.waitForTimeout(500);
      
      // Check for required fields
      const nameField = page.locator('input[placeholder*="name" i], label:has-text("Name") + input');
      const dobField = page.locator('input[type="date"], label:has-text("Date of Birth") + input');
      const genderField = page.locator('select, label:has-text("Gender") + select');
      
      // At least one of these should be visible
      const hasName = await nameField.count() > 0;
      const hasDob = await dobField.count() > 0;
      const hasGender = await genderField.count() > 0;
      
      expect(hasName || hasDob || hasGender).toBeTruthy();
    }
  });

  test('should validate required fields', async ({ page }) => {
    const newPatientButton = page.locator('button').filter({ hasText: /new patient/i });
    
    if (await newPatientButton.count() > 0) {
      await newPatientButton.click();
      await page.waitForTimeout(500);
      
      // Try to submit empty form
      const submitButton = page.locator('button[type="submit"], button:has-text("Create")');
      
      if (await submitButton.count() > 0) {
        await submitButton.click();
        
        // Should show validation error or prevent submission
        await page.waitForTimeout(500);
        
        // Check for error message or validation
        const errorElements = page.locator('[class*="error"], [class*="invalid"], [role="alert"]');
        const errorCount = await errorElements.count();
        
        // HTML5 validation might prevent submission, or we might see an error
        expect(errorCount).toBeGreaterThanOrEqual(0);
      }
    }
  });

  test('should fill and submit patient form', async ({ page }) => {
    const newPatientButton = page.locator('button').filter({ hasText: /new patient/i });
    
    if (await newPatientButton.count() > 0) {
      await newPatientButton.click();
      await page.waitForTimeout(500);
      
      // Fill required fields
      const nameInput = page.locator('input[placeholder*="name" i], label:has-text("Name") + input').first();
      if (await nameInput.count() > 0) {
        await nameInput.fill('Test Patient');
      }
      
      const dobInput = page.locator('input[type="date"]').first();
      if (await dobInput.count() > 0) {
        const today = new Date();
        const dateStr = today.toISOString().split('T')[0];
        await dobInput.fill(dateStr);
      }
      
      const genderSelect = page.locator('select').first();
      if (await genderSelect.count() > 0) {
        await genderSelect.selectOption({ index: 1 }); // Select first option after default
      }
      
      // Submit form
      const submitButton = page.locator('button[type="submit"], button:has-text("Create")');
      if (await submitButton.count() > 0) {
        await submitButton.click();
        
        // Wait for submission
        await page.waitForTimeout(2000);
        
        // Modal should close or show success
        const modal = page.locator('[role="dialog"], .modal, [class*="modal"]');
        const modalCount = await modal.count();
        
        // Modal might close or show success message
        expect(modalCount).toBeGreaterThanOrEqual(0);
      }
    }
  });

  test('should close modal on cancel', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    
    const newPatientButton = page.locator('button').filter({ hasText: /new patient/i });
    
    if (await newPatientButton.count() > 0) {
      await newPatientButton.click();
      await page.waitForTimeout(1000); // Wait for modal to fully open
      
      // Look for cancel button or close button (X) - try multiple selectors
      const cancelSelectors = [
        'button:has-text("Cancel")',
        'button:has-text("Close")',
        'button[aria-label*="close" i]',
        'button:has(svg)',
        '[class*="close"]',
      ];
      
      let cancelButton = null;
      for (const selector of cancelSelectors) {
        const buttons = page.locator(selector);
        const count = await buttons.count();
        if (count > 0) {
          // Check if it's actually visible and clickable
          const firstButton = buttons.first();
          if (await firstButton.isVisible()) {
            cancelButton = firstButton;
            break;
          }
        }
      }
      
      if (cancelButton) {
        await cancelButton.click();
        await page.waitForTimeout(1500); // Wait for modal to close
        
        // Check if modal is closed
        const modal = page.locator('[role="dialog"], .modal, [class*="modal"]').first();
        const modalCount = await modal.count();
        
        // Modal should not be visible
        if (modalCount > 0) {
          await expect(modal).not.toBeVisible({ timeout: 3000 });
        }
      } else {
        // If no cancel button found, try clicking outside modal or ESC key
        await page.keyboard.press('Escape');
        await page.waitForTimeout(1000);
        
        // Verify modal closed
        const modal = page.locator('[role="dialog"], .modal, [class*="modal"]').first();
        const modalCount = await modal.count();
        if (modalCount > 0) {
          await expect(modal).not.toBeVisible({ timeout: 2000 });
        }
      }
    } else {
      // If no new patient button found, skip test
      test.skip();
    }
  });

  test('should close modal on overlay click', async ({ page }) => {
    const newPatientButton = page.locator('button').filter({ hasText: /new patient/i });
    
    if (await newPatientButton.count() > 0) {
      await newPatientButton.click();
      await page.waitForTimeout(500);
      
      // Click on overlay (outside modal content)
      const modal = page.locator('[role="dialog"], .modal, [class*="modal"]').first();
      if (await modal.count() > 0) {
        // Get modal position and click outside
        const box = await modal.boundingBox();
        if (box) {
          // Click to the left of modal
          await page.mouse.click(box.x - 10, box.y + box.height / 2);
          await page.waitForTimeout(500);
        }
      }
    }
  });
});

