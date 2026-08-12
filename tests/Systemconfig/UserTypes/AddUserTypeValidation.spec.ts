import {test,expect,TestInfo} from '@playwright/test';

import { Login } from '../../../pages/Login/Loginpage';

import { LeftsideNavigation } from '../../../pages/Navigations/LeftSideNavigation';

import { validateAddUserTypeForm } from '../../../pages/Systemconfig/UserTypes/AddUserTypeValidation';

import { Reporter } from '../../../pages/utils/NewReport';

test(
  'Validate Add User Type Form',

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
      // REPORTING
      // =========================================

      Reporter.validateData(
        true,
        isValid,
        'Validate Add User Type Form',
        testInfo
      );

      // =========================================
      // ASSERTION
      // =========================================

      expect(
        isValid,
        'Add User Type Form validation failed'
      ).toBeTruthy();

      console.log(
        '✅ Add User Type Form Validation Passed'
      );

    } finally {

      Reporter.endTest(
        testInfo
      );
    }
  }
);