import {
  test,
  expect
} from '@playwright/test';

import { Login }
  from '../../../pages/Login/Loginpage';

import { LeftsideNavigation }
  from '../../../pages/Navigations/LeftSideNavigation';

import { NavGroupColumns }
  from '../../../pages/Systemconfig/NavGroup/NavGroupColumns';

test.describe(
  'Nav Group Columns Verification',
  () => {

    test(
      'Verify Nav Group table columns',
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

        await navigation.gotoNavGroup();

        await page.waitForLoadState(
          'networkidle'
        );

        // =========================================
        // COLUMN VALIDATION
        // =========================================

        const navGroupColumns =
          new NavGroupColumns(page);

        const {
          expectedColumns,
          actualHeaders
        } =
          await navGroupColumns
            .verifyNavGroupColumns();

        // =========================================
        // LOG RESULTS
        // =========================================

        console.log(
          '\n==================================='
        );

        console.log(
          '📊 NAV GROUP COLUMN VALIDATION'
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
        // ASSERTION
        // =========================================

        expect(actualHeaders)
          .toEqual(expectedColumns);

        console.log(
          '\n✅ Nav Group Columns Validation Passed'
        );
      }
    );
  }
);

