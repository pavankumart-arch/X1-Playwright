import { test, expect } from '@playwright/test';
import { Login } from '../../../../../pages/Login/Loginpage';
import { NavtoInventorytab } from '../../../../../pages/Inventory/NavigatetoInventorytab';
import { InventoryGeneralInformation } from '../../../../../pages/Inventory/Vehicles/General_Information';
import { Reporter } from '../../../../../pages/utils/NewReport';

test('Verify Inventory Pagination Functionality', async ({ page }, testInfo) => {

  // Increase timeout if navigating through all pages
  test.setTimeout(3600000); // 60 minutes

  Reporter.startTest();

  const loginPage = new Login(page);
  const navtoInventorytab = new NavtoInventorytab(page);
  const inventoryGeneralInformation = new InventoryGeneralInformation(page);

  try {

    // Step 1: Login
    await loginPage.navigateToURL();
    await loginPage.loginToApplication();
    await page.waitForTimeout(2000);

    // Step 2: Navigate to Inventory
    await navtoInventorytab.navigateToInventoryTab(page, testInfo);

    // Step 3: Search specific VIN only for this test
    const testVIN = '1HGCM82633A200001';

    const searchBox = page
      .locator('input[placeholder="Search..."]')
      .first();

    await expect(searchBox).toBeVisible({ timeout: 15000 });

    await searchBox.fill(testVIN);

    console.log(`Searching VIN: ${testVIN}`);

    await searchBox.press('Enter');

    // Wait for VIN search result
    const vinResult = page
      .getByText(testVIN, { exact: true })
      .first();

    await expect(vinResult).toBeVisible({ timeout: 15000 });

    console.log(`VIN found: ${testVIN}`);

    // Click VIN
    await vinResult.scrollIntoViewIfNeeded();
    await vinResult.click();

    console.log(`Successfully clicked VIN: ${testVIN}`);

    // Wait for Vehicle Details page
    await expect(
      page.getByText('Global Information', { exact: true }).first()
    ).toBeVisible({ timeout: 15000 });

    console.log('Vehicle details page opened successfully');

    // Step 4: Validate Vehicle General Information
    await inventoryGeneralInformation.vehicleInformation(testInfo);

  } finally {
    Reporter.endTest(testInfo);
  }
});