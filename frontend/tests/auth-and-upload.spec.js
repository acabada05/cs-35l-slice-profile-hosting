import { test, expect } from '@playwright/test';

test.describe('Authentication and Profile Upload', () => {
  test('1. User can register a new account', async ({ page }) => {
    await page.goto('/login');
    
    // Click to switch to signup mode if needed
    // (Adjust based on your actual login page UI)
    
    // Generate unique username for each test run
    const username = `testuser_${Date.now()}`;
    const email = `${username}@test.com`;
    
    // Fill signup form (adjust selectors based on your actual form)
    await page.fill('input[type="text"]', username);
    await page.fill('input[type="email"]', email);
    await page.fill('input[type="password"]', 'testpass123');
    
    await page.click('button[type="submit"]');
    
    // Wait for redirect or success
    await page.waitForTimeout(2000);
    
    // Verify we're logged in (check for navbar with username or redirect)
    expect(page.url()).not.toContain('/login');
  });
  
  test('2. User can browse profiles after login', async ({ page }) => {
    // First login
    await page.goto('/login');
    
    // Use existing credentials
    await page.fill('input[type="text"]', 'acabada05');
    await page.fill('input[type="password"]', 'your_password_here');
    await page.click('button[type="submit"]');
    
    // Wait for login
    await page.waitForTimeout(2000);
    
    // Navigate to browse
    await page.goto('/browse');
    
    // Verify browse page loaded
    await expect(page.locator('h1')).toContainText('Browse');
  });
});