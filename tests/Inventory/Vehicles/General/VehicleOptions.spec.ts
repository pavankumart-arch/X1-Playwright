import { test } from '@playwright/test';
import { Login } from '../../../../pages/Login/Loginpage';
import { NavtoInventorytab } from '../../../../pages/Inventory/NavigatetoInventorytab';
import { Reporter } from '../../../../pages/utils/NewReport';
import { InventoryOptions } from '../../../../pages/Inventory/Vehicles/Options';



test('Verify Inventory Description Functionality', async ({ page }, testInfo) => {

  // Increase timeout if navigating through all pages
  test.setTimeout(3600000); // 60 minutes

  Reporter.startTest();

  const loginPage = new Login(page);
  const navtoInventorytab = new NavtoInventorytab(page);
  const inventoryOptions=new InventoryOptions(page,testInfo)

  try {

    // Step 1: Login
    await loginPage.navigateToURL();
    await loginPage.loginToApplication();
    await page.waitForTimeout(2000);

    // Step 2: Navigate to Inventory
    await navtoInventorytab.navigateToInventoryTab(page, testInfo);

// Step 3: Validate Inventory Description
await inventoryOptions.verifyOptions()
await inventoryOptions.verifyTableColumns();
  } finally {
    Reporter.endTest(testInfo);
  }
});