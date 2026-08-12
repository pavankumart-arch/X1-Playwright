import {
  test,
  expect,
  TestInfo
} from '@playwright/test';

import { Login }
  from '../../../pages/Login/Loginpage';

import { LeftsideNavigation }
  from '../../../pages/Navigations/LeftSideNavigation';

import { VerifyUserTypeCancelButton }
  from '../../../pages/Systemconfig/UserTypes/AddUserTypeCancel';

import { Reporter }
  from '../../../pages/utils/NewReport';

test(
  'Verify User Type Cancel Button Functionality',

  async ({ page }, testInfo: TestInfo) => {

    Reporter.startTest();

    try {

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
      // REPORTING
      // =========================================

      Reporter.validateData(
        true,
        isSuccess,
        'Verify User Type Cancel Button Functionality',
        testInfo
      );

      // =========================================
      // ASSERTION
      // =========================================

      expect(
        isSuccess,
        'Cancel button should navigate back to summary page'
      ).toBeTruthy();

      console.log(
        '✅ User Type Cancel Button Validation Passed'
      );

    } finally {

      Reporter.endTest(
        testInfo
      );
    }
  }
);