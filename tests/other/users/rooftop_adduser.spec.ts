import { test } from '@playwright/test';
import { Login } from '../../../pages/Login/Loginpage';
import { LeftsideNavigation } from '../../../pages/Navigations/LeftSideNavigation';;
import { RooftopNavigation } from '../../../pages/Rooftops/RooftopNavigation';
import AddRooftopData from '../../../testdata/AddRooftopData.json';
import { RooftopAddUser } from '../../../pages/other/user/rooftop_AddUser';


test.describe('Verify the Rooftop Add User functionality', () => {
  test('Verify that the Roof top added user appears in the summary table', async ({ page }, testInfo) => {
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


    // ADD USER
    const rooftopAddUser=new RooftopAddUser(page);
    await rooftopAddUser.addrooftopUser();
    await page.waitForTimeout(2000); // Wait for 2 seconds to ensure the page is fully loaded
    await rooftopAddUser.verifyAddedUserIsDisplayed(testInfo);
  })});