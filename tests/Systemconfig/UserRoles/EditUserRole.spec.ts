import { test, expect }
from '@playwright/test';

import { Login }
from '../../../pages/Login/Loginpage';

import { LeftsideNavigation }
from '../../../pages/Navigations/LeftSideNavigation';

import { UserRoleFlow }
from '../../../pages/Systemconfig/UserRoles/EditUserRole';

import { Reporter }
from '../../../pages/utils/NewReport';

test(
  'Create → Search → Edit User Role Flow',

  async ({ page }, testInfo) => {

    Reporter.startTest();

    test.setTimeout(180000);

    // ==========================
    // LOGIN
    // ==========================
    const login =
      new Login(page);

    await login.navigateToURL();

    await login.loginToApplication();

    // ==========================
    // NAVIGATION
    // ==========================
    const nav =
      new LeftsideNavigation(page);

    await nav.gotoSystemConfig();

    await nav.goToUserRoles();

    await page.waitForLoadState(
      'domcontentloaded'
    );

    // ==========================
    // CREATE → SEARCH → EDIT FLOW
    // ==========================
    const userRole =
      new UserRoleFlow(page);

    let isSuccess = true;

    try {

      await userRole.createSearchEditFlow(
        'Admin'
      );

    } catch (error) {

      console.log(
        `❌ Edit User Role Flow Failed: ${error}`
      );

      isSuccess = false;
    }

    // ==========================
    // REPORTING
    // ==========================
    Reporter.validateData(
      true,
      isSuccess,
      'User Role Edit Flow Validation',
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
      'Create → Search → Edit User Role Flow failed'
    ).toBeTruthy();

    Reporter.endTest(
      testInfo
    );
  }
);