import { test } from '@playwright/test';
import { LeftsideNavigation } from '../../../pages/Navigations/LeftSideNavigation';
import { Login } from '../../../pages/Login/Loginpage';
import { RooftopNavigation } from '../../../pages/Rooftops/RooftopNavigation';
import AddRooftopData from '../../../testdata/AddRooftopData.json';
import { rooftopUserColumns } from '../../../pages/other/user/rooftop_UserColumns';

test('Verify Rooftop User Table Headers', async ({ page }, testInfo) => {


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

  
  // Verify Rooftop User Table Headers
  const userColumns = new rooftopUserColumns(page);
  await userColumns.verifyRooftopUserColumnHeaders(testInfo);


  
});