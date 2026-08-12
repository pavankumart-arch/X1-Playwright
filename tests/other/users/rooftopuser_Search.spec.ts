import { test } from '@playwright/test';
import { LeftsideNavigation } from '../../../pages/Navigations/LeftSideNavigation';
import { Login } from '../../../pages/Login/Loginpage';
import { Reporter } from '../../../pages/utils/NewReport';
import { RooftopNavigation } from '../../../pages/Rooftops/RooftopNavigation';
import AddRooftopData from '../../../testdata/AddRooftopData.json';
import { RooftopUserSearch } from '../../../pages/other/user/rooftop_Search';

test.describe('Rooftop User Search Module', () => {
  test('Verify Rooftop User Search Functionality', async ({ page }, testInfo) => {
    // ============================================
    // TEST TIMEOUT
    // ============================================
    test.setTimeout(120000);

    // ============================================
    // START REPORTER
    // ============================================
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



    // ============================================
    // USER SEARCH VALIDATIONS
    // ============================================
     const search = new RooftopUserSearch(page);
    await search.searchByID(testInfo);
    await search.searchByID(testInfo);
    await search.searchByUsername(testInfo);
    await search.searchByEmail(testInfo);
    await search.searchByReseller(testInfo);
    await search.searchByUserType(testInfo);

    // ============================================
    // ACTIVE SEARCH
    // ============================================
    await search.searchByStatus(testInfo);

    // ============================================
    // INACTIVE SEARCH
    // ============================================
    await search.searchByInactiveStatus(testInfo);

    // ============================================
    // INVALID SEARCH
    // ============================================
    await search.invalidSearch(testInfo);

    // ============================================
    // END REPORTER
    // ============================================
    Reporter.endTest(testInfo);
  });
});