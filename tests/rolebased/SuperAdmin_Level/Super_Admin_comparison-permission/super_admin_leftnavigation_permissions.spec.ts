import { test, type TestInfo } from '@playwright/test';
import { LeftsideNavigation } from '../../../../pages/Navigations/LeftSideNavigation';
import { RooftopNavigation } from '../../../../pages/Rooftops/RooftopNavigation';
import AddRooftopData from '../../../../testdata/AddRooftopData.json';
import { Login } from '../../../../pages/Login/Loginpage';


test("Verify Super Admin Left Navigation", async ({ page }, testInfo: TestInfo) => {

    const loginPage = new Login(page);
    const navigation = new LeftsideNavigation(page);

    // Login
    await loginPage.navigateToURL();
     await loginPage.loginByRole("Super_Admin" as any);

    await page.waitForLoadState('networkidle');

    // Console Colors
    const GREEN = '\x1b[32m';
    const RED = '\x1b[31m';
    const RESET = '\x1b[0m';

    //====================================================
    // Dashboard
    //====================================================

    console.log("\nVerify Dashboard");
    console.log("Expected : Dashboard should be visible");

    const dashboardCount = await navigation.Dashboard.count();

    if (dashboardCount > 0) {
        console.log(`${GREEN}Status : PASS${RESET}`);
        console.log("Actual : Dashboard is visible. Working as expected.");
    } else {
        console.log(`${RED}Status : FAIL${RESET}`);
        console.log("Actual : Dashboard is not visible.");
    }

    //====================================================
    // Resellers
    //====================================================

    console.log("\nVerify Resellers");
    console.log("Expected : Resellers should be visible");

    const resellerCount = await navigation.Resellers.count();

    if (resellerCount > 0) {
        console.log(`${GREEN}Status : PASS${RESET}`);
        console.log("Actual : Resellers is visible. Working as expected.");
    } else {
        console.log(`${RED}Status : FAIL${RESET}`);
        console.log("Actual : Resellers is not visible.");
    }

    //====================================================
    // Rooftops
    //====================================================

    const navigation1 = new LeftsideNavigation(page);

  await navigation1.goToDashboard();
  await page.waitForLoadState('networkidle');

  await navigation1.goToResellers();
  await page.waitForLoadState('networkidle');


   const rooftopNavigation = new RooftopNavigation(page);
 // Step 1 & Step 2
    // If AddRooftopData is not available, use a fallback rooftop name
    const rooftopName = 'Premier Auto Group';
    await rooftopNavigation.searchAndOpenRecord(
        rooftopName,
        testInfo
    );

  // Navigate to rooftops list
  await navigation.goToListofRooftops();
  await page.waitForLoadState('networkidle');

    console.log("\nVerify Rooftops");
    console.log("Expected : Rooftops should be visible");

    const rooftopCount = await navigation.Rooftops.count();

    if (rooftopCount > 0) {
        console.log(`${GREEN}Status : PASS${RESET}`);
        console.log("Actual : Rooftops is visible. Working as expected.");
    } else {
        console.log(`${RED}Status : FAIL${RESET}`);
        console.log("Actual : Rooftops is not visible.");
    }

    //====================================================
    // List Rooftops
    //====================================================

    console.log("\nVerify List Rooftops");
    console.log("Expected : List Rooftops should be visible");

    const listRooftopCount = await navigation.ListofRooftops.count();

    if (listRooftopCount > 0) {
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
    // Application Config
    //====================================================

    console.log("\nVerify Application Config");
    console.log("Expected : Application Config should be visible");

    const appConfigCount = await navigation.ApplicationConfig.count();

    if (appConfigCount > 0) {
        console.log(`${GREEN}Status : PASS${RESET}`);
        console.log("Actual : Application Config is visible. Working as expected.");
    } else {
        console.log(`${RED}Status : FAIL${RESET}`);
        console.log("Actual : Application Config is not visible.");
    }

    //====================================================
    // Domain Data
    //====================================================

    console.log("\nVerify Domain Data");
    console.log("Expected : Domain Data should be visible");

    const domainDataCount = await navigation.Domaindata.count();

    if (domainDataCount > 0) {
        console.log(`${GREEN}Status : PASS${RESET}`);
        console.log("Actual : Domain Data is visible. Working as expected.");
    } else {
        console.log(`${RED}Status : FAIL${RESET}`);
        console.log("Actual : Domain Data is not visible.");
    }

    //====================================================
    // Users
    //====================================================

    console.log("\nVerify Users");
    console.log("Expected : Users should be visible");

    const usersCount = await navigation.Users.count();

    if (usersCount > 0) {
        console.log(`${GREEN}Status : PASS${RESET}`);
        console.log("Actual : Users is visible. Working as expected.");
    } else {
        console.log(`${RED}Status : FAIL${RESET}`);
        console.log("Actual : Users is not visible.");
    }

    //====================================================
    // System Config
    //====================================================

    console.log("\nVerify System Config");
    console.log("Expected : System Config should be visible");

    const systemConfigCount = await navigation.SystemConfigbutton.count();

    if (systemConfigCount > 0) {
        console.log(`${GREEN}Status : PASS${RESET}`);
        console.log("Actual : System Config is visible. Working as expected.");
    } else {
        console.log(`${RED}Status : FAIL${RESET}`);
        console.log("Actual : System Config is not visible.");
    }

    //====================================================
    // Taxonomy
    //====================================================

    console.log("\nVerify Taxonomy");
    console.log("Expected : Taxonomy should be visible");

    const taxonomyCount = await navigation.Taxonomybutton.count();

    if (taxonomyCount > 0) {
        console.log(`${GREEN}Status : PASS${RESET}`);
        console.log("Actual : Taxonomy is visible. Working as expected.");
    } else {
        console.log(`${RED}Status : FAIL${RESET}`);
        console.log("Actual : Taxonomy is not visible.");
    }

    //====================================================
    // User Roles
    //====================================================

    console.log("\nVerify User Roles");
    console.log("Expected : User Roles should be visible");

    const userRoleCount = await navigation.UserRolesbutton.count();

    if (userRoleCount > 0) {
        console.log(`${GREEN}Status : PASS${RESET}`);
        console.log("Actual : User Roles is visible. Working as expected.");
    } else {
        console.log(`${RED}Status : FAIL${RESET}`);
        console.log("Actual : User Roles is not visible.");
    }

    //====================================================
    // User Types
    //====================================================

    console.log("\nVerify User Types");
    console.log("Expected : User Types should be visible");

    const userTypeCount = await navigation.UserTypesbutton.count();

    if (userTypeCount > 0) {
        console.log(`${GREEN}Status : PASS${RESET}`);
        console.log("Actual : User Types is visible. Working as expected.");
    } else {
        console.log(`${RED}Status : FAIL${RESET}`);
        console.log("Actual : User Types is not visible.");
    }

    //====================================================
    // Nav Group
    //====================================================

    console.log("\nVerify Nav Group");
    console.log("Expected : Nav Group should be visible");

    const navGroupCount = await navigation.NavGroupbutton.count();

    if (navGroupCount > 0) {
        console.log(`${GREEN}Status : PASS${RESET}`);
        console.log("Actual : Nav Group is visible. Working as expected.");
    } else {
        console.log(`${RED}Status : FAIL${RESET}`);
        console.log("Actual : Nav Group is not visible.");
    }

});