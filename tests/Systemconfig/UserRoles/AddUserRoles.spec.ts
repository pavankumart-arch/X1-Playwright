
import { test, expect }
from '@playwright/test';

import { Login }
from '../../../pages/Login/Loginpage';

import { LeftsideNavigation }
from '../../../pages/Navigations/LeftSideNavigation';

import { AddUserRole }
from '../../../pages/Systemconfig/UserRoles/AddUserRole';

import { Reporter }
from '../../../pages/utils/NewReport';


test(
  'Add New User Role',

  async ({ page }, testInfo) => {

    Reporter.startTest();

    test.setTimeout(18000);

    // ==========================
    // LOGIN
    // ==========================
    const loginPage =
      new Login(page);

    await loginPage.navigateToURL();

    await loginPage.loginToApplication();

    // ==========================
    // NAVIGATION
    // ==========================
    const navigation =
      new LeftsideNavigation(page);

    await navigation.gotoSystemConfig();

    await navigation.goToUserRoles();

    await page.waitForLoadState(
      'networkidle'
    );

    // ==========================
    // ADD USER ROLE
    // ==========================
    const addUserRole =
      new AddUserRole(page);

    const roleName =
      `Role_${Date.now()}`;

    const appType =
      'Admin';

    let isSuccess = false;

    try {

      await addUserRole.AddUserRole(
        roleName,
        appType
      );

      isSuccess = true;

    } catch (error) {

      console.log(
        `❌ Add User Role Failed: ${error}`
      );

      isSuccess = false;
    }

    // ==========================
    // REPORTING
    // ==========================
    Reporter.validateData(
      true,
      isSuccess,
      'Add User Role Validation',
      testInfo
    );

    console.log(
      '\n' + '='.repeat(60)
    );

    console.log(
      `FINAL RESULT : ${
        isSuccess
          ? 'PASS ✅'
          : 'FAIL ❌'
      }`
    );

    console.log(
      '='.repeat(60)
    );

    // ==========================
    // ASSERTION
    // ==========================
    expect(
      isSuccess,
      'Add User Role validation failed'
    ).toBeTruthy();

    Reporter.endTest(
      testInfo
    );
  }
);
