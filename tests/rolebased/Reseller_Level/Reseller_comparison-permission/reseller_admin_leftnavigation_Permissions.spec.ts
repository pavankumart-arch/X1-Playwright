import { test, type TestInfo } from '@playwright/test';
import { Login } from '../../../../pages/Login/Loginpage';
import { LeftsideNavigation } from '../../../../pages/Navigations/LeftSideNavigation';
import AddRooftopData from '../../../../testdata/AddRooftopData.json';
import { RooftopNavigation } from '../../../../pages/Rooftops/RooftopNavigation';

test("Verify Reseller Admin Left Navigation", async ({ page }, testInfo: TestInfo) => {

    const loginPage = new Login(page);
    const navigation = new LeftsideNavigation(page);

    await loginPage.navigateToURL();
    await loginPage.loginByRole('Reseller_Admin' as any);

    await page.waitForLoadState('networkidle');

    // Console Colors
    const GREEN = '\x1b[32m';
    const RED = '\x1b[31m';
    const RESET = '\x1b[0m';

    //====================================================
    // Rooftops (Visible)
    //====================================================

    console.log("\nVerify Rooftops");
    console.log("Expected : Rooftops should be visible");

    if (await navigation.Rooftops.count() > 0) {
        console.log(`${GREEN}Status : PASS${RESET}`);
        console.log("Actual : Rooftops is visible. Working as expected.");
    } else {
        console.log(`${RED}Status : FAIL${RESET}`);
        console.log("Actual : Rooftops is not visible.");
    }

    //====================================================
    // List Rooftops (Visible)
    //====================================================

    console.log("\nVerify List Rooftops");
    console.log("Expected : List Rooftops should be visible");

    if (await navigation.ListofRooftops.count() > 0) {
        console.log(`${GREEN}Status : PASS${RESET}`);
        console.log("Actual : List Rooftops is visible. Working as expected.");
    } else {
        console.log(`${RED}Status : FAIL${RESET}`);
        console.log("Actual : List Rooftops is not visible.");
    }
//====================================================
    // Inventory List
    //====================================================

    console.log("\nVerify Inventory List");
    console.log("Expected : Inventory List should be visible");
  // Navigate to rooftops list
  await navigation.goToListofRooftops();
  await page.waitForLoadState('networkidle');

  // Search and open the specific rooftop
const InventoryNavigation = new RooftopNavigation(page);
  await InventoryNavigation.searchAndOpenRecord(
    AddRooftopData.RooftopInventory,
    testInfo
  );

  // Navigate to Inventory
  await navigation.goToInventory();
  await page.waitForLoadState('networkidle');   

    const inventoryListCount = await navigation.Inventory.count();

    if (inventoryListCount > 0) {
        console.log(`${GREEN}Status : PASS${RESET}`);
        console.log("Actual : Inventory is visible. Working as expected.");
    } else {
        console.log(`${RED}Status : FAIL${RESET}`);
        console.log("Actual :  Inventory is not visible.");
    }

    //====================================================
    // Users (Visible)
    //====================================================

    console.log("\nVerify Users");
    console.log("Expected : Users should be visible");

    if (await navigation.Users.count() > 0) {
        console.log(`${GREEN}Status : PASS${RESET}`);
        console.log("Actual : Users is visible. Working as expected.");
    } else {
        console.log(`${RED}Status : FAIL${RESET}`);
        console.log("Actual : Users is not visible.");
    }

    //====================================================
    // Dashboard (Not Visible)
    //====================================================

    console.log("\nVerify Dashboard");
    console.log("Expected : Dashboard should NOT be visible");

    if (await navigation.Dashboard.count() == 0) {
        console.log(`${GREEN}Status : PASS${RESET}`);
        console.log("Actual : Dashboard is not visible. Working as expected.");
    } else {
        console.log(`${RED}Status : FAIL${RESET}`);
        console.log("Actual : Dashboard is visible.");
    }

    //====================================================
    // Resellers (Not Visible)
    //====================================================

    console.log("\nVerify Resellers");
    console.log("Expected : Resellers should NOT be visible");

    if (await navigation.Resellers.count() == 0) {
        console.log(`${GREEN}Status : PASS${RESET}`);
        console.log("Actual : Resellers is not visible. Working as expected.");
    } else {
        console.log(`${RED}Status : FAIL${RESET}`);
        console.log("Actual : Resellers is visible.");
    }

    //====================================================
    // Application Config (Not Visible)
    //====================================================

    console.log("\nVerify Application Config");
    console.log("Expected : Application Config should NOT be visible");

    if (await navigation.ApplicationConfig.count() == 0) {
        console.log(`${GREEN}Status : PASS${RESET}`);
        console.log("Actual : Application Config is not visible. Working as expected.");
    } else {
        console.log(`${RED}Status : FAIL${RESET}`);
        console.log("Actual : Application Config is visible.");
    }

    //====================================================
    // System Config (Not Visible)
    //====================================================

    console.log("\nVerify System Config");
    console.log("Expected : System Config should NOT be visible");

    if (await navigation.SystemConfigbutton.count() == 0) {
        console.log(`${GREEN}Status : PASS${RESET}`);
        console.log("Actual : System Config is not visible. Working as expected.");
    } else {
        console.log(`${RED}Status : FAIL${RESET}`);
        console.log("Actual : System Config is visible.");
    }

    //====================================================
    // Domain Data (Not Visible)
    //====================================================

    console.log("\nVerify Domain Data");
    console.log("Expected : Domain Data should NOT be visible");

    if (await navigation.Domaindata.count() == 0) {
        console.log(`${GREEN}Status : PASS${RESET}`);
        console.log("Actual : Domain Data is not visible. Working as expected.");
    } else {
        console.log(`${RED}Status : FAIL${RESET}`);
        console.log("Actual : Domain Data is visible.");
    }

});