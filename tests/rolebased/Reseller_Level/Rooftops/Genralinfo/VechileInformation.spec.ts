import { test } from '@playwright/test';
import { Login } from '../../../../../pages/Login/Loginpage';
import { InventoryGeneralInformation } from '../../../../../pages/Inventory/Vehicles/General_Information';
import { Reporter } from '../../../../../pages/utils/NewReport';
import { LeftsideNavigation } from '../../../../../pages/Navigations/LeftSideNavigation';
import { RooftopNavigation } from '../../../../../pages/Rooftops/RooftopNavigation';
import AddRooftopData from '../../../../../testdata/AddRooftopData.json';

test(
  'Verify Inventory General Information',
  async ({ page }, testInfo) => {

    test.setTimeout(3600000);

    Reporter.startTest();

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

      await loginPage.loginByRole(
        'Reseller_Admin' as any
      );

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

      // ============================================================
      // Step 7: Validate All Vehicle Information Fields
      // ============================================================

      console.log(
        'Step 7: Validate all Vehicle Information fields'
      );

      await inventoryGeneralInformation.vehicleInformation(
        testInfo
      );

      console.log(
        'Inventory General Information test completed successfully.'
      );

    } finally {

      Reporter.endTest(testInfo);
    }
  }
);