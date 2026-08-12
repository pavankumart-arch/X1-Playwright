import {
  test,
  expect
} from '@playwright/test';

import { Login }
from '../../../pages/Login/Loginpage';

import { LeftsideNavigation }
from '../../../pages/Navigations/LeftSideNavigation';

import { NavItemColumns }
from '../../../pages/Systemconfig/NavGroup/NavItemColumns';

import { Reporter }
from '../../../pages/utils/NewReport';

test.describe(
  'Nav Item Columns Verification',
  () => {

    test(
      'Verify Nav Item table columns',
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

        await navigation.gotoNavGroup();

        await page.waitForLoadState(
          'networkidle'
        );

        // ==========================
        // OPEN NAV ITEM LIST
        // ==========================

        const navItemColumns =
          new NavItemColumns(page);

        await navItemColumns.openNavItems();

        // ==========================
        // VERIFY COLUMNS
        // ==========================

        const {
          expectedColumns,
          actualHeaders
        } =
          await navItemColumns
            .verifyNavItemColumns();

        // ==========================
        // REPORTING
        // ==========================

        Reporter.validateData(
          expectedColumns.join(', '),
          actualHeaders.join(', '),
          'Nav Item Columns',
          testInfo
        );

        // ==========================
        // FINAL RESULT
        // ==========================

        console.log(
          '\n' + '='.repeat(60)
        );

        console.log(
          `FINAL RESULT : ${
            JSON.stringify(actualHeaders) ===
            JSON.stringify(expectedColumns)
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
          actualHeaders
        ).toEqual(
          expectedColumns
        );

        Reporter.endTest(
          testInfo
        );

      }

    );

  }

);