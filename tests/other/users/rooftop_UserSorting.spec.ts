import { test, expect } from '@playwright/test';
import { Login } from '../../../pages/Login/Loginpage';
import { LeftsideNavigation } from '../../../pages/Navigations/LeftSideNavigation';
import { Reporter } from '../../../pages/utils/NewReport';
import { RooftopUserSortingWithPagination } from '../../../pages/other/user/rooftop_UserSorting';
import { RooftopNavigation } from '../../../pages/Rooftops/RooftopNavigation';
import AddRooftopData from '../../../testdata/AddRooftopData.json';

test.describe('Rooftop User Table Sorting Validation', () => {
  test('Verify User Table Sorting Functionality', async ({ page }, testInfo) => {
    Reporter.startTest();
    
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

    const sorting = new RooftopUserSortingWithPagination(page);
    // Run the sorting validations
    await sorting.verifyAllColumnsSorting(testInfo);
    
    // Get the summary from Reporter
    const summary = Reporter.endTest(testInfo);
    
    // Hard assertion at the end - this will fail the test if any validations failed
    expect(summary.failed, `Test failed with ${summary.failed} validation(s) out of ${summary.totalValidations}`).toBe(0);
  });
});