import { test } from '@playwright/test';
import { Login } from '../../../../pages/Login/Loginpage';
import { NavtoInventorytab } from '../../../../pages/Inventory/NavigatetoInventorytab';
import { Reporter } from '../../../../pages/utils/NewReport';
import { InventoryGeneralInformation } from '../../../../pages/Inventory/Vehicles/General_Information';
import { InventoryDescription } from '../../../../pages/Inventory/Vehicles/Description';



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

// Step 3: Validate Inventory Description
await inventoryDescription.verifyDescription();

  } finally {
    Reporter.endTest(testInfo);
  }
});