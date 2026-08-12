import { test, expect } from '@playwright/test';
import AddRooftopData from '../../../../../testdata/AddRooftopData.json';
import { Login } from '../../../../../pages/Login/Loginpage';
import { LeftsideNavigation } from '../../../../../pages/Navigations/LeftSideNavigation';
import { RooftopNavigation } from '../../../../../pages/Rooftops/RooftopNavigation';
import { InventoryColumns } from '../../../../../pages/Rooftops/Inventory/inventory_columns';
import { logAndValidate } from '../../../../../utils/reportUtil';


test("Verify Inventory Column Headings", async ({ page }, testInfo) => {

  const loginPage =new Login(page);
  // Login and navigate

  await loginPage.navigateToURL();
  await loginPage.loginToApplication();

  const navigation = new LeftsideNavigation(page);

  await navigation.goToDashboard();
  await page.waitForLoadState('networkidle');

  await navigation.goToResellers();
  await page.waitForLoadState('networkidle');

   const rooftopNavigation = new RooftopNavigation(page);
 // Step 1 & Step 2
  await rooftopNavigation.searchAndOpenRecord(
    AddRooftopData.rooftopname,
    testInfo
  );

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


  // Verify Inventory columns
  const inventoryColumns = new InventoryColumns(page);
  const { expectedColumns, actualHeaders } = await inventoryColumns.verifyRooftopColumns();

  const allMatch = JSON.stringify(expectedColumns) === JSON.stringify(actualHeaders);

  // Report each column individually to HTML report
  for (let i = 0; i < expectedColumns.length; i++) {
    const expected = expectedColumns[i];
    const actual = actualHeaders[i] || 'MISSING';
    const isMatch = expected === actual;
    
    logAndValidate({
      step: `Column ${i + 1}: ${expected}`,
      expected: expected,
      actual: actual,
    }, testInfo);
  }

  // Report summary to HTML report
  logAndValidate({
    step: 'SUMMARY - Rooftop Column Headings',
    expected: expectedColumns.join(', '),
    actual: actualHeaders.join(', '),
  }, testInfo);

  // Console output (for terminal only)
  console.log(`\n${"=".repeat(50)}`);
  console.log(`SUMMARY - Rooftop Column Headings`);
  console.log(`${"=".repeat(50)}`);
  console.log(`Expected: ${expectedColumns.join(', ')}`);
  console.log(`Actual: ${actualHeaders.join(', ')}`);
  console.log(`Status: ${allMatch ? 'PASS ✅' : 'FAIL ❌'}`);
  console.log(`${"=".repeat(50)}`);

  // Assertion
  expect(actualHeaders, 'Column headers do not match expected').toEqual(expectedColumns);
});