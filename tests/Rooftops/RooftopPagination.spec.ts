import { test, expect } from '@playwright/test';
import { Login } from '../../pages/Login/Loginpage';
import { LeftsideNavigation } from '../../pages/Navigations/LeftSideNavigation';;
import { RooftopNavigation } from '../../pages/Rooftops/RooftopNavigation';
import AddRooftopData from '../../testdata/AddRooftopData.json';
import { RooftopPagination } from '../../pages/Rooftops/RooftopPagination';

test("Verify Rooftop Pagination", async ({ page }, testInfo) => {
  const loginPage = new Login(page);
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
  
  // Step 4: Verify Reseller pagination - Create instance first
  console.log('\n📍 Step 4: Verify Reseller pagination');
  const rooftopPagination = new RooftopPagination(page); // Create instance
  const allTestsPassed = await rooftopPagination.verifyAllPagination(testInfo);

  // Step 5: Final assertion
  expect(allTestsPassed, 'All pagination tests should pass').toBeTruthy();
  
  console.log('\n✅ Reseller Pagination test completed successfully!');
});