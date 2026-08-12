import { test, expect } from '@playwright/test';
import { Login } from '../../pages/Login/Loginpage';
import { LeftsideNavigation } from '../../pages/Navigations/LeftSideNavigation';
import { VerifyRooftopCancelButton } from '../../pages/Rooftops/CancelRooftop';
import { RooftopNavigation } from '../../pages/Rooftops/RooftopNavigation';
import AddRooftopData from '../../testdata/AddRooftopData.json';

test("Verify Rooftop Cancel Button Functionality", async ({ page }, testInfo) => {
const loginPage = new Login(page);
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

  // Use Page Object Model - Pass testInfo to the method
  const cancelButtonTest = new VerifyRooftopCancelButton(page);
  const isSuccess = await cancelButtonTest.VerifyRooftopCancelButton(testInfo);

  // Final assertion
  expect(isSuccess, 'Cancel button should navigate back to summary page').toBeTruthy();
});