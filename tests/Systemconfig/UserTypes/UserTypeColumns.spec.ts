import { test } from '@playwright/test';

import { UserTypeColumns }
from '../../../pages/Systemconfig/UserTypes/UserTypeColumns';

import { Login }
from '../../../pages/Login/Loginpage';

import { LeftsideNavigation }
from '../../../pages/Navigations/LeftSideNavigation';

import { Reporter }
from '../../../pages/utils/NewReport';

test.describe(
  'User Types Columns Verification',
  () => {

    test(
      'Verify User Types table columns',

      async ({ page }, testInfo) => {

        Reporter.startTest();

        const loginPage =
          new Login(page);

        const navigation =
          new LeftsideNavigation(page);

        // =========================================
        // LOGIN
        // =========================================

        await loginPage.navigateToURL();

        await loginPage.loginToApplication();

        // =========================================
        // NAVIGATION
        // =========================================

        await navigation.gotoSystemConfig();

        await navigation.gotoAddUserType();

        await page.waitForLoadState(
          'networkidle'
        );

        // =========================================
        // COLUMN VALIDATION
        // =========================================

        const userTypeColumns =
          new UserTypeColumns(page);

        const {
          expectedColumns,
          actualHeaders
        } =
          await userTypeColumns
            .verifyUserTypeColumns();

        Reporter.validateColumns(
          expectedColumns,
          actualHeaders,
          testInfo,
          'User Types Columns'
        );

        // =========================================
        // LOG RESULTS
        // =========================================

        console.log(
          '\n==================================='
        );

        console.log(
          '📊 USER TYPES COLUMN VALIDATION'
        );

        console.log(
          '==================================='
        );

        console.log(
          'Expected Columns:',
          expectedColumns
        );

        console.log(
          'Actual Columns:',
          actualHeaders
        );

        Reporter.endTest(
          testInfo
        );
      }
    );
  }
);
