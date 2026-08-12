import { test } from '@playwright/test';
import { Login } from '../../../pages/Login/Loginpage';
import { LeftsideNavigation } from '../../../pages/Navigations/LeftSideNavigation';;
import { rooftopUsersPagination } from '../../../pages/other/user/rooftop_Pagination';
import { RooftopNavigation } from '../../../pages/Rooftops/RooftopNavigation';
import AddRooftopData from '../../../testdata/AddRooftopData.json';

test.describe('Rooftop Users Pagination Validation', () => {
  test('Verify Rooftop Users Pagination', async ({ page }, testInfo) => {
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

  await page.waitForTimeout(2000); // Wait for 2 seconds to ensure the page is fully loaded

  // Navigate to Other -> Users
  await navigation.goToOther();
  await page.waitForTimeout(2000);
  await navigation.goToRooftopUsers();
  await page.waitForLoadState('networkidle');

  const RooftopUsersPagination = new rooftopUsersPagination(page);
    await RooftopUsersPagination.verifyrooftopUsersPagination(testInfo);
  });
});