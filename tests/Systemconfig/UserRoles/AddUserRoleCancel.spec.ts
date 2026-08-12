import { test, expect } from '@playwright/test';

import { Login } from '../../../pages/Login/Loginpage';
import { LeftsideNavigation } from '../../../pages/Navigations/LeftSideNavigation';
import { AddUserRoleCancel } from '../../../pages/Systemconfig/UserRoles/AddUserRoleCancel';
import { Reporter } from '../../../pages/utils/NewReport';

test('Verify User Role Cancel Button Functionality', async ({ page }, testInfo) => {

  // ==========================
  // REPORT START
  // ==========================
  Reporter.startTest();

  test.setTimeout(180000);

  // ==========================
  // LOGIN
  // ==========================
  const loginPage = new Login(page);

  await loginPage.navigateToURL();
  await loginPage.loginToApplication();

  await page.waitForLoadState('networkidle');

  // ==========================
  // NAVIGATION
  // ==========================
  const navigation = new LeftsideNavigation(page);

  await navigation.gotoSystemConfig();
  await navigation.goToUserRoles();

  await page.waitForLoadState('networkidle');

  // ==========================
  // CANCEL BUTTON ACTION
  // ==========================
  const cancelPage = new AddUserRoleCancel(page);

  const isSuccess = await cancelPage.verifyUserRoleCancelButton();

  // ==========================
  // REPORT VALIDATION
  // ==========================
  Reporter.validateData(
    true,
    isSuccess,
    'User Role Cancel Button Validation',
    testInfo
  );

  console.log('\n' + '='.repeat(60));
  console.log(`FINAL RESULT : ${isSuccess ? 'PASS ✅' : 'FAIL ❌'}`);
  console.log('='.repeat(60));

  // ==========================
  // ASSERTION
  // ==========================
  expect(
    isSuccess,
    'Cancel button should navigate back to User Roles page'
  ).toBeTruthy();

  // ==========================
  // REPORT END
  // ==========================
  Reporter.endTest(testInfo);
});