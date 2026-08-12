import {
  test,
  expect
} from '@playwright/test';

import { Login }
from '../../../pages/Login/Loginpage';

import { LeftsideNavigation }
from '../../../pages/Navigations/LeftSideNavigation';

import { UserRoleColumns }
from '../../../pages/Systemconfig/UserRoles/UserRolesColumns';

import { Reporter }
from '../../../pages/utils/NewReport';

test.describe(
  'User Roles Columns Verification',
  () => {

    test(
      'Verify User Roles table columns',
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

        await navigation.goToUserRoles();

        await page.waitForLoadState(
          'networkidle'
        );

        // =========================================
        // COLUMN VALIDATION
        // =========================================

        const userRoleColumns =
          new UserRoleColumns(page);

        const result =
          await userRoleColumns
            .verifyUserRoleColumns();

        // =========================================
        // LOG RESULTS
        // =========================================

        console.log(
          '\n==================================='
        );

        console.log(
          '📊 USER ROLES COLUMN VALIDATION'
        );

        console.log(
          '==================================='
        );

        console.log(
          'Expected Columns:',
          result.expectedColumns
        );

        console.log(
          'Actual Columns:',
          result.actualHeaders
        );

        // =========================================
        // REPORT VALIDATION
        // =========================================

        Reporter.validateColumns(
          result.expectedColumns,
          result.actualHeaders,
          testInfo,
          'User Roles Columns'
        );

        // =========================================
        // FINAL ASSERTION
        // =========================================

        expect(
          result.actualHeaders
        ).toEqual(
          result.expectedColumns
        );

        Reporter.endTest(
          testInfo
        );

        console.log(
          '\n✅ User Roles Columns Validation Passed'
        );
      }
    );
  }
);