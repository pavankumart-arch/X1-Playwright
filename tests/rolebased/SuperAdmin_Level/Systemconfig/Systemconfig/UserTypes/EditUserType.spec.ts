import { test, TestInfo, expect } from '@playwright/test';

import { Login } from '../../../pages/Login/Loginpage';
import { LeftsideNavigation } from '../../../pages/Navigations/LeftSideNavigation';
import { EditUserType } from '../../../pages/Systemconfig/UserTypes/EditUserType';

test('Edit Existing User Type', async ({ page }, testInfo: TestInfo) => {

  test.setTimeout(180000);

  const loginPage = new Login(page);
  await loginPage.navigateToURL();
  await loginPage.loginToApplication();

  const navigation = new LeftsideNavigation(page);

  await page.waitForLoadState('networkidle');

  await navigation.gotoSystemConfig();
  await navigation.gotoAddUserType();

  const editUserType = new EditUserType(page);

  console.log(`\n==============================`);
  console.log(`EDIT USER TYPE TEST`);
  console.log(`==============================`);

  const result = await editUserType.editExistingUserType(testInfo);

  console.log(`\n==============================`);
  console.log(`FINAL RESULT`);
  console.log(`==============================`);

  console.log(
    `Edit Existing User Type : ${result ? '✅ PASSED' : '❌ FAILED'}`
  );

  testInfo.annotations.push({
    type: 'Edit User Type',
    description: result
      ? 'User Type edited successfully'
      : 'User Type edit failed'
  });

  expect(result, 'Existing User Type should edit successfully').toBeTruthy();
});