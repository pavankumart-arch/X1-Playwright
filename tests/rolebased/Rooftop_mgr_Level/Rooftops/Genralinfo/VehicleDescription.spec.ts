import { test } from '@playwright/test';
import { Reporter } from '../../../../../pages/utils/NewReport';
import { Login } from '../../../../../pages/Login/Loginpage';
import { NavtoInventorytab } from '../../../../../pages/Inventory/NavigatetoInventorytab';
import { InventoryDescription } from '../../../../../pages/Inventory/Vehicles/Description';
import { LeftsideNavigation } from '../../../../../pages/Navigations/LeftSideNavigation';
import { RooftopNavigation } from '../../../../../pages/Rooftops/RooftopNavigation';
import { InventoryGeneralInformation } from '../../../../../pages/Inventory/Vehicles/General_Information';
import AddRooftopData from '../../../../../testdata/AddRooftopData.json';



test('Verify Inventory Description Functionality', async ({ page }, testInfo) => {

  // Increase timeout if navigating through all pages
  test.setTimeout(3600000); // 60 minutes

  Reporter.startTest();

  const loginPage = new Login(page);
  const navtoInventorytab = new NavtoInventorytab(page);
  const inventoryDescription = new InventoryDescription(page, testInfo);

   try {

      // ============================================================
      // Page Objects
      // ============================================================

      const loginPage =
        new Login(page);

      const navigation =
        new LeftsideNavigation(page);

      const rooftopNavigation =
        new RooftopNavigation(page);

      const inventoryGeneralInformation =
        new InventoryGeneralInformation(page);

      // ============================================================
      // Step 1: Login
      // ============================================================

      console.log('Step 1: Login');

      await loginPage.navigateToURL();

    await loginPage.loginByRole('Rooftop_mgr' as any);

      // ============================================================
      // Step 2: Open Reseller Rooftop
      // ============================================================

      console.log(
        'Step 2: Open Reseller Rooftop'
      );

      await rooftopNavigation.searchAndOpenRecord(
        AddRooftopData.resellerrooftopname,
        testInfo
      );

      // ============================================================
      // Step 3: Navigate to Rooftops List
      // ============================================================

      console.log(
        'Step 3: Navigate to Rooftops List'
      );

      await navigation.goToListofRooftops();

      // ============================================================
      // Step 4: Open Inventory Rooftop
      // ============================================================

      console.log(
        'Step 4: Open Inventory Rooftop'
      );

      await rooftopNavigation.searchAndOpenRecord(
        AddRooftopData.RooftopInventory,
        testInfo
      );

      // ============================================================
      // Step 5: Navigate to Inventory
      // ============================================================

      console.log(
        'Step 5: Navigate to Inventory'
      );

      await navigation.goToInventory();

      // ============================================================
      // Step 6: Search VIN
      // ============================================================

      console.log(
        'Step 6: Search vehicle using VIN'
      );

      await inventoryGeneralInformation.searchForVIN();


// Step 3: Validate Inventory Description
await inventoryDescription.verifyDescription();

  } finally {
    Reporter.endTest(testInfo);
  }
});