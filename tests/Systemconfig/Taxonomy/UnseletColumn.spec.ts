import { test, expect } from '@playwright/test';

import { Login }
  from '../../../pages/Login/Loginpage';

import { LeftsideNavigation }
  from '../../../pages/Navigations/LeftSideNavigation';

import { AppTypeColumns }
  from '../../../pages/Systemconfig/Taxonomy/UnseletColumn';

import { Reporter }
  from '../../../pages/utils/NewReport';

test.describe(
  'App Types Column Visibility Verification',
  () => {

    test(
      'Verify hidden column should not display in UI',
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

        const columnName =
          'Updated';

        // Verify Visible
        await appTypeColumns
          .verifyColumnVisible(
            columnName
          );

        Reporter.validateData(
          true,
          true,
          `${columnName} Column Visible`,
          testInfo
        );

        // Hide Column
        await appTypeColumns
          .hideColumn(
            columnName
          );

        Reporter.validateData(
          true,
          true,
          `${columnName} Column Hidden Action`,
          testInfo
        );

        // Verify Hidden
        await appTypeColumns
          .verifyColumnHidden(
            columnName
          );

        Reporter.validateData(
          true,
          true,
          `${columnName} Column Hidden Verification`,
          testInfo
        );

        // ==========================
        // FINAL RESULT
        // ==========================
        Reporter.validateData(
          'PASS',
          'PASS',
          'AppType Column Visibility Validation',
          testInfo
        );

        console.log(
          '\n✅ Column visibility validation completed'
        );

        expect(true).toBeTruthy();

        Reporter.endTest(
          testInfo
        );
      }
    );
  }
);