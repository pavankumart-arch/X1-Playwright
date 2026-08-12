import { test, expect } from '@playwright/test';
import { Reporter } from '../../../../../pages/utils/NewReport';
import { Login } from '../../../../../pages/Login/Loginpage';
import { NavtoInventorytab } from '../../../../../pages/Inventory/NavigatetoInventorytab';
import { InventoryDescription } from '../../../../../pages/Inventory/Vehicles/Description';

test('Verify Inventory Description Functionality', async ({ page }, testInfo) => {

  // Increase timeout if navigating through all pages
  test.setTimeout(3600000); // 60 minutes

  Reporter.startTest();

  const loginPage = new Login(page);
  const navtoInventorytab = new NavtoInventorytab(page);
  const inventoryDescription = new InventoryDescription(page, testInfo);

  try {

    // Step 1: Login
    await loginPage.navigateToURL();
    await loginPage.loginToApplication();
    await page.waitForTimeout(2000);

    // Step 2: Navigate to Inventory
    await navtoInventorytab.navigateToInventoryTab(page, testInfo);

    // Step 3: Search specific VIN for this test
    const testVIN = '1HGCM82633A200001';

    const searchBox = page
      .locator('input[placeholder="Search..."]')
      .first();

    await expect(searchBox).toBeVisible({ timeout: 15000 });

    // Clear existing search value
    await searchBox.fill('');

    // Enter specific VIN
    await searchBox.fill(testVIN);

    console.log(`Searching VIN: ${testVIN}`);

    // Press Enter to search
    await searchBox.press('Enter');

    // Step 4: Wait for VIN search result
    const vinResult = page
      .getByText(testVIN, { exact: true })
      .first();

    await expect(vinResult).toBeVisible({ timeout: 15000 });

    console.log(`VIN found in Inventory: ${testVIN}`);

    // Step 5: Click VIN
    await vinResult.scrollIntoViewIfNeeded();
    await vinResult.click();

    console.log(`Successfully clicked VIN: ${testVIN}`);

    // Step 6: Wait for Vehicle Details page
    await page.waitForTimeout(2000);

    console.log('Vehicle Details page opened successfully');

    // Step 7: Validate Inventory Description
    await inventoryDescription.verifyDescription();

  } finally {
    Reporter.endTest(testInfo);
  }
});