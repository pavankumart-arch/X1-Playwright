import { test } from '@playwright/test';
import { Login } from '../../pages/Login/Loginpage';
import { NavtoInventorytab } from '../../pages/Inventory/NavigatetoInventorytab';
import { InventoryColumns } from '../../pages/Inventory/InventoryCoulmns';
import { Reporter } from '../../pages/utils/NewReport';

test('Verify the Inventory Columns functionality', async ({ page }, testInfo) => {
  test.setTimeout(120000);
  
  Reporter.startTest();
  
  const loginPage = new Login(page);
  const navtoInventorytab = new NavtoInventorytab(page);
  const inventoryColumns = new InventoryColumns(page, testInfo);

  await loginPage.navigateToURL();
  await loginPage.loginToApplication();
  await page.waitForLoadState('networkidle');

  await navtoInventorytab.navigateToInventoryTab(page, testInfo);
  
  await inventoryColumns.verifyinventoryColumns();
  
  Reporter.endTest(testInfo);
});