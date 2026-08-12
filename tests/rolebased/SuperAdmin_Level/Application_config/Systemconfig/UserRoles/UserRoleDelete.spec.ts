import { test, expect } from '@playwright/test';

import { Login } from '../../../pages/Login/Loginpage';

import { LeftsideNavigation } from '../../../pages/Navigations/LeftSideNavigation';

import { DeleteUserRole } from '../../../pages/Systemconfig/UserRoles/UserRoleDelete';

test(
  'Delete User Role Functionality',

  async ({ page }) => {

    const loginPage =
      new Login(page);

    await loginPage.navigateToURL();

    await loginPage.loginToApplication();

    const navigation =
      new LeftsideNavigation(page);

    await navigation.gotoSystemConfig();

    await navigation.goToUserRoles();

    await page.waitForLoadState(
      'networkidle'
    );

    // Existing User Role
    const userRoleName =
      'UpdatedAdmin';

    const deleteUserRole =
      new DeleteUserRole(page);

    const result =
      await deleteUserRole.DeleteUserRole(
        userRoleName
      );

    console.log(`\n${"=".repeat(50)}`);

    console.log(
      `FINAL RESULT - DELETE USER ROLE`
    );

    console.log(`${"=".repeat(50)}`);

    console.log(
      `Delete Passed: ${result.deletePassed}`
    );

    console.log(
      `Verification Passed: ${result.verificationPassed}`
    );

    console.log(`${"=".repeat(50)}`);

    expect(
      result.verificationPassed,
      'User Role should be deleted successfully'
    ).toBeTruthy();
  }
);