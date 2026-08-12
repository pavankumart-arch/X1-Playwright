import { test, expect }
from '@playwright/test';

import { Login }
from '../../../pages/Login/Loginpage';

import { LeftsideNavigation }
from '../../../pages/Navigations/LeftSideNavigation';

import { UserRoleValidationPage }
from '../../../pages/Systemconfig/UserRoles/AddUserRoleValidation';

import { Reporter }
from '../../../pages/utils/NewReport';

test(
  'Validate Add User Role Form',

  async ({ page }, testInfo) => {

    Reporter.startTest();

    test.setTimeout(180000);

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
    // VALIDATION TEST
    // ==========================
    const userRoleValidation =
      new UserRoleValidationPage(page);
      await userRoleValidation.clickAddRoleButton();

    await userRoleValidation
      .clickSaveButton();

    const isValid =
      await userRoleValidation
        .validateRequiredFieldErrors();

    // ==========================
    // REPORTING
    // ==========================
    Reporter.validateData(
      true,
      isValid,
      'User Role Required Field Validation',
      testInfo
    );

    console.log(
      '\n' + '='.repeat(60)
    );

    console.log(
      `FINAL RESULT : ${
        isValid
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
      isValid,
      'User Role validation failed'
    ).toBeTruthy();

    Reporter.endTest(
      testInfo
    );
  }
);