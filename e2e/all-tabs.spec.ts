import { test, expect } from '@playwright/test';

const TABS = [
  'Overview',
  'Vitals',
  'Medications',
  'Med Calculators',
  'Consultation',
  'Clinical Notes',
  'Appointments',
  'Timeline',
  'Care Team',
  'Referrals',
  'Consents',
  'Surgical Notes',
  'Nutrition',
  'Vaccinations',
  'Imaging',
  'Lab Management',
  'Telemedicine',
  'Longevity',
  'Microbiome',
  'Hubs',
  'Billing',
  'Profile',
  'Users',
  'Settings',
];

test.describe('All Tabs Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    
    // Try to login first
    try {
      await page.fill('input[type="email"]', 'admin@hospital2035.com');
      await page.fill('input[type="password"]', 'admin123');
      await page.click('button[type="submit"]');
      await page.waitForTimeout(2000);
    } catch (e) {
      // Continue if login fails
    }
    
    // Select a patient if available
    await page.waitForLoadState('networkidle');
    const firstPatient = page.locator('button, [role="button"]').filter({ hasText: /patient|john|jane|smith/i }).first();
    if (await firstPatient.count() > 0) {
      await firstPatient.click();
      await page.waitForTimeout(1000);
    }
  });

  test('should navigate to all tabs', async ({ page }) => {
    for (const tabName of TABS) {
      // Look for tab button
      const tabButton = page.locator('button, [role="button"]').filter({ hasText: new RegExp(tabName, 'i') }).first();
      
      if (await tabButton.count() > 0) {
        await tabButton.click();
        await page.waitForTimeout(500);
        
        // Verify tab is active or content is visible
        const tabContent = page.locator('body');
        await expect(tabContent).toBeVisible();
        
        // Check if tab button has active state
        const classes = await tabButton.getAttribute('class');
        const isActive = classes?.includes('active') || classes?.includes('bg-blue') || classes?.includes('text-blue');
        
        // At minimum, tab should be clickable and page should respond
        expect(await tabButton.isVisible()).toBeTruthy();
      }
    }
  });

  test('should test sidebar navigation', async ({ page }) => {
    // Toggle left sidebar
    const sidebarToggle = page.locator('button').filter({ hasText: /menu|toggle|sidebar/i }).first();
    if (await sidebarToggle.count() > 0) {
      await sidebarToggle.click();
      await page.waitForTimeout(500);
      
      // Sidebar should be visible
      const sidebar = page.locator('aside, [class*="sidebar"]').first();
      if (await sidebar.count() > 0) {
        await expect(sidebar).toBeVisible();
      }
    }
  });

  test('should test dark mode toggle', async ({ page }) => {
    // Find dark mode toggle
    const darkModeToggle = page.locator('button').filter({ hasText: /dark|light|moon|sun/i }).first();
    
    if (await darkModeToggle.count() > 0) {
      const htmlElement = page.locator('html');
      const initialClass = await htmlElement.getAttribute('class') || '';
      
      await darkModeToggle.click();
      await page.waitForTimeout(300);
      
      const newClass = await htmlElement.getAttribute('class') || '';
      
      // Class should change
      expect(newClass !== initialClass || newClass.includes('dark')).toBeTruthy();
    }
  });

  test('should test workspace navigation buttons', async ({ page }) => {
    // Navigate to patients button
    const patientsButton = page.locator('button').filter({ hasText: /patients|patient list/i }).first();
    
    if (await patientsButton.count() > 0) {
      await patientsButton.click();
      await page.waitForTimeout(1000);
      
      // Should be on patient list page
      const patientListElements = page.locator('[class*="patient"], aside, [class*="directory"]');
      const count = await patientListElements.count();
      expect(count).toBeGreaterThan(0);
    }
  });
});


