import { test } from '@playwright/test';

import { Login }
from '../../../pages/Login/Loginpage';

import { LeftsideNavigation }
from '../../../pages/Navigations/LeftSideNavigation';

import { validateAddUserTypeForm }
from '../../../pages/Systemconfig/UserTypes/AddUserTypeValidation';

test(
  'Validate Add User Type Form',

  async ({ page }, testInfo) => {

    // =========================================
    // LOGIN
    // =========================================

    const loginPage =
      new Login(page);

    await loginPage.navigateToURL();

    await loginPage.loginToApplication();

    // =========================================
    // NAVIGATION
    // =========================================

    const navigation =
      new LeftsideNavigation(page);

    await navigation.gotoSystemConfig();

    await navigation.gotoAddUserType();

    await page.waitForLoadState(
      'networkidle'
    );

    // =========================================
    // VALIDATION
    // =========================================

    const validateForm =
      new validateAddUserTypeForm(
        page,
        testInfo
      );

    const isValid =
      await validateForm
        .validateAddUserTypeForm();

    // =========================================
    // FINAL RESULT
    // =========================================

    testInfo.annotations.push({
      type: 'Final Result',
      description:
        isValid
          ? 'Test PASSED'
          : 'Test FAILED'
    });
  }
);