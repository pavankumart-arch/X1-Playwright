import { test, expect }
from '@playwright/test';

import { Login }
from '../../../pages/Login/Loginpage';

import { LeftsideNavigation }
from '../../../pages/Navigations/LeftSideNavigation';

import { logAndValidate }
from '../../../utils/reportUtil';

import { VerifyUserTypeCancelButton }
from '../../../pages/Systemconfig/UserTypes/AddUserTypeCancel';

test(
  'Verify User Type Cancel Button Functionality',

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

    await page.waitForLoadState(
      'networkidle'
    );

    await navigation.gotoAddUserType();

    await page.waitForLoadState(
      'networkidle'
    );

    // =========================================
    // CANCEL BUTTON TEST
    // =========================================

    const cancelButtonTest =
      new VerifyUserTypeCancelButton(page);

    const isSuccess =
      await cancelButtonTest
        .VerifyUserTypeCancelButton();

    // =========================================
    // REPORT
    // =========================================

    logAndValidate({
      step:
        'Verify User Type Cancel Button Functionality',

      expected:
        'Successfully navigated back to summary page',

      actual:
        isSuccess
          ? 'Successfully navigated back to summary page'
          : 'Failed to navigate back',

    }, testInfo);

    // =========================================
    // ASSERTION
    // =========================================

    expect(
      isSuccess,
      'Cancel button should navigate back to summary page'
    ).toBeTruthy();
  }
);