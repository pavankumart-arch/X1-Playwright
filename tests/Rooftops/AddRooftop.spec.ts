import { test, expect } from '@playwright/test';
import { Login } from '../../pages/Login/Loginpage';
import { LeftsideNavigation } from '../../pages/Navigations/LeftSideNavigation';
import { AddRooftop } from '../../pages/Rooftops/AddRooftop';
import { RooftopNavigation } from '../../pages/Rooftops/RooftopNavigation';
import AddRooftopData from '../../testdata/AddRooftopData.json';

test.describe('Rooftop Management', () => {

test(
'Verify User can Add New Rooftop and Validate in Summary Page',
async ({ page }, testInfo) => {

  const loginPage = new Login(page);
  const navigation = new LeftsideNavigation(page);
  const rooftopPage = new AddRooftop(page);
  const rooftopNavigation = new RooftopNavigation(page);

  console.log('\n========================================');
  console.log('STARTING ADD ROOFTOP TEST');
  console.log('========================================\n');

  // Login
  await loginPage.navigateToURL();
  await loginPage.loginToApplication();

  // Dashboard
  await navigation.goToDashboard();
  await page.waitForLoadState('networkidle');

  // Resellers
  await navigation.goToResellers();
  await page.waitForLoadState('networkidle');

  // Step 1 & Step 2
  await rooftopNavigation.searchAndOpenRecord(
    AddRooftopData.rooftopname,
    testInfo
  );

  console.log(
    `Successfully opened reseller : ${AddRooftopData.rooftopname}`
  );

  // Rooftop Summary
  await navigation.goToListofRooftops();
  await page.waitForLoadState('networkidle');

  // Step 3-7
  const result =
    await rooftopPage.addAndVerifyRooftop(
      testInfo
    );

  expect(result.success).toBeTruthy();

  console.log(`Created : ${result.createdName}`);
  console.log(`Verified: ${result.searchedName}`);

  console.log('\n========================================');
  console.log('TEST PASSED');
  console.log('========================================\n');
}


);

});
