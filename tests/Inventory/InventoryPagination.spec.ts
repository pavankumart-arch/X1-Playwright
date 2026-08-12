import { test } from '@playwright/test';
import { Login } from '../../pages/Login/Loginpage';
import { NavtoInventorytab } from '../../pages/Inventory/NavigatetoInventorytab';
import { Reporter } from '../../pages/utils/NewReport';
import { InventoryPagination } from '../../pages/Inventory/InventoryPagination';

test('Verify Inventory Pagination Functionality', async ({ page }, testInfo) => {
  test.setTimeout(3600000);
  Reporter.startTest();

  const loginPage = new Login(page);
  const navtoInventorytab = new NavtoInventorytab(page);
  const inventoryPagination = new InventoryPagination(page, testInfo);

  try {
    await loginPage.navigateToURL();
    await loginPage.loginToApplication();
    await page.waitForTimeout(2000);
    await navtoInventorytab.navigateToInventoryTab(page, testInfo);
    const paginationResult = await inventoryPagination.verifyInventoryPagination();
    if (!paginationResult) {
      throw new Error('Pagination verification failed');
    }
  } catch (error) {
    console.error(`❌ Test failed: ${error}`);
    throw error;
  } finally {
    Reporter.endTest(testInfo);
  }
});