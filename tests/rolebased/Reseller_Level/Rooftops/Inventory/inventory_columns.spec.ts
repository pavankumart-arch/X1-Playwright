import { test } from '@playwright/test';
import AddRooftopData from '../../../../../testdata/AddRooftopData.json';
import { Login } from '../../../../../pages/Login/Loginpage';
import { LeftsideNavigation } from '../../../../../pages/Navigations/LeftSideNavigation';
import { RooftopNavigation } from '../../../../../pages/Rooftops/RooftopNavigation';
import { InventoryColumns } from '../../../../../pages/Rooftops/Inventory/inventory_columns';

test(
  'Verify Inventory Column Headings',
  async ({ page }, testInfo) => {

    // =====================================
    // LOGIN
    // =====================================

    const loginPage =
      new Login(page);

    await loginPage.navigateToURL();

    await loginPage.loginByRole(
      'Reseller_Admin' as any
    );

    // =====================================
    // NAVIGATION
    // =====================================

    const navigation =
      new LeftsideNavigation(page);

    // =====================================
    // OPEN RESELLER ROOFTOP
    // =====================================

    const rooftopNavigation =
      new RooftopNavigation(page);

    await rooftopNavigation.searchAndOpenRecord(
      AddRooftopData.resellerrooftopname,
      testInfo
    );

    // =====================================
    // NAVIGATE TO ROOFTOPS LIST
    // =====================================

    await navigation.goToListofRooftops();

    await page.waitForLoadState(
      'networkidle'
    );

    // =====================================
    // SEARCH AND OPEN INVENTORY ROOFTOP
    // =====================================

    await rooftopNavigation.searchAndOpenRecord(
      AddRooftopData.RooftopInventory,
      testInfo
    );

    // =====================================
    // NAVIGATE TO INVENTORY
    // =====================================

    await navigation.goToInventory();

    await page.waitForLoadState(
      'networkidle'
    );

    // =====================================
    // INVENTORY COLUMN VALIDATION
    // =====================================

    const inventoryColumns =
      new InventoryColumns(page);

    await inventoryColumns.verifyRooftopColumns(
      testInfo
    );
  }
);