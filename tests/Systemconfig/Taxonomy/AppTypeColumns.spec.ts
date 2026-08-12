import { test, expect } from '@playwright/test';

import { Login }
from '../../../pages/Login/Loginpage';

import { LeftsideNavigation }
from '../../../pages/Navigations/LeftSideNavigation';

import { AppTypeColumns }
from '../../../pages/Systemconfig/Taxonomy/AppTypeColumns';

import { Reporter }
from '../../../pages/utils/NewReport';

test.describe(
  'App Types Columns Verification',
  () => {

    test(
      'Verify App Types Table Columns',
      async ({ page }, testInfo) => {

        Reporter.startTest();

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

        await navigation.goToTaxonomy();
        await navigation.goToAppTypes();

        await page.waitForLoadState(
          'networkidle'
        );

        // ==========================
        // COLUMN VALIDATION
        // ==========================
        const appTypeColumns =
          new AppTypeColumns(page);

        const {
          expectedColumns,
          actualHeaders
        } =
          await appTypeColumns
            .verifyAppTypeColumns();

        // ==========================
        // REPORTING
        // ==========================
        Reporter.validateData(
          expectedColumns.join(', '),
          actualHeaders.join(', '),
          'AppType Table Columns',
          testInfo
        );

        console.log(
          '\n' + '='.repeat(60)
        );

        console.log(
          'APP TYPE COLUMN VALIDATION'
        );

        console.log(
          '='.repeat(60)
        );

        console.log(
          'Expected Columns:',
          expectedColumns
        );

        console.log(
          'Actual Columns:',
          actualHeaders
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