
import { test, expect } from '@playwright/test';

import { UserTypeColumns }
  from '../../../pages/Systemconfig/UserTypes/UserTypeColumns';

import { Login }
  from '../../../pages/Login/Loginpage';

import { LeftsideNavigation }
  from '../../../pages/Navigations/LeftSideNavigation';

test.describe(
  'User Types Columns Verification',
  () => {

    test(
      'Verify User Types table columns',
      async ({ page }) => {

        const loginPage =
          new Login(page);

        const navigation =
          new LeftsideNavigation(page);

        // LOGIN
        await loginPage.navigateToURL();

        await loginPage.loginToApplication();

        // NAVIGATION
        await navigation.gotoSystemConfig();

        await navigation.gotoAddUserType();

        await page.waitForLoadState(
          'networkidle'
        );

        // =========================================
        // ✅ COLUMN VALIDATION
        // =========================================

        const userTypeColumns =
          new UserTypeColumns(page);

        const {
          expectedColumns,
          actualHeaders
        } =
          await userTypeColumns
            .verifyUserTypeColumns();

        // =========================================
        // ✅ LOG RESULTS
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
          'Actual Columns  :',
          actualHeaders
        );

        // =========================================
        // ✅ ASSERTION
        // =========================================

        expect(actualHeaders)
          .toEqual(expectedColumns);

        console.log(
          '\n✅ User Types Columns Validation Passed'
        );
      }
    );
  }
);