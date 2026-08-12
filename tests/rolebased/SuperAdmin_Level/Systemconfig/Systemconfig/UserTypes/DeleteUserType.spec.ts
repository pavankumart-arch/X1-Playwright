import { test, expect, TestInfo } from '@playwright/test';

import { Login } from '../../../pages/Login/Loginpage';
import { LeftsideNavigation } from '../../../pages/Navigations/LeftSideNavigation';
import { DeleteUserType } from '../../../pages/Systemconfig/UserTypes/DeleteUserType';

test("Delete User Type Functionality", async ({ page }, testInfo: TestInfo) => {

  test.setTimeout(180000);

  // ---------------- LOGIN ----------------
  const loginPage = new Login(page);
  await loginPage.navigateToURL();
  await loginPage.loginToApplication();

  // ---------------- NAVIGATION ----------------
  const navigation = new LeftsideNavigation(page);

  await page.waitForLoadState('networkidle');

  await navigation.gotoSystemConfig();
  await navigation.gotoAddUserType();

  await page.waitForLoadState('networkidle');

  // ---------------- PAGE OBJECT ----------------
  const deleteUserType = new DeleteUserType(page);

  console.log(`\n======================================`);
  console.log(`DELETE USER TYPE TEST`);
  console.log(`======================================`);

  // ---------------- TEST DATA ----------------
  const userTypeName = "Manager"; // OR pass created dynamic name

  // ---------------- DELETE FLOW ----------------
  const isDeleted = await deleteUserType.deleteUserType(userTypeName);

  console.log(`\n======================================`);
  console.log(`FINAL RESULT`);
  console.log(`======================================`);

  console.log(
    `Delete User Type : ${isDeleted ? '✅ PASSED' : '❌ FAILED'}`
  );

  testInfo.annotations.push({
    type: 'Delete User Type',
    description: isDeleted
      ? 'User Type deleted successfully'
      : 'User Type deletion failed'
  });

  expect(isDeleted, 'User Type should be deleted successfully').toBeTruthy();
});