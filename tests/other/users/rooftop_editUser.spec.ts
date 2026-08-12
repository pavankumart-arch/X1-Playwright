import { test } from '@playwright/test';
import { Login } from '../../../pages/Login/Loginpage';
import { LeftsideNavigation } from '../../../pages/Navigations/LeftSideNavigation';
import { Reporter } from '../../../pages/utils/NewReport';
import { EditrooftopUser } from '../../../pages/other/user/rooftop_EditUser';
import AddRooftopData from '../../../testdata/AddRooftopData.json';
import { RooftopNavigation } from '../../../pages/Rooftops/RooftopNavigation';

test.describe('Verify the rooftop Edit User functionality', () => {

  test('Verify that the rooftop edited user details are saved and displayed correctly', 
    async ({ page }, testInfo) => {

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
    const editrooftopUser = new EditrooftopUser(page);


    await editrooftopUser.addAndEditUserWithReport(testInfo);

    Reporter.endTest(testInfo);

  });

});