import { test, expect } from '@playwright/test';

import { Login }
from '../../../pages/Login/Loginpage';

import { LeftsideNavigation }
from '../../../pages/Navigations/LeftSideNavigation';

import { RunTypeColumns }
from '../../../pages/Systemconfig/Taxonomy/RunTypeColumns';

import { Reporter }
from '../../../pages/utils/NewReport';

test.describe(
  'RunType Columns Verification',
  () => {

    test(
      'Verify RunType Table Columns',

      async ({ page }, testInfo) => {

        Reporter.startTest();

        // LOGIN

        const loginPage =
          new Login(page);

        await loginPage.navigateToURL();

        await loginPage.loginToApplication();

        // NAVIGATION

        const navigation =
          new LeftsideNavigation(page);

        await navigation.gotoSystemConfig();

        await navigation.goToTaxonomy();

        await navigation.goToAppTypes();

        const runTypeColumns =
          new RunTypeColumns(page);

        // Open Admin App

        await runTypeColumns.openApp(
          'Admin'
        );

        // Open Module

        await runTypeColumns.openModule(
          'Modules'
        );

        // Verify Columns

        const {
          expectedColumns,
          actualHeaders
        } =
          await runTypeColumns.verifyRunTypeColumns();

        Reporter.validateData(
          expectedColumns.join(', '),
          actualHeaders.join(', '),
          'RunType Table Columns',
          testInfo
        );

        console.log(
          '\n' + '='.repeat(60)
        );

        console.log(
          'RUNTYPE COLUMN VALIDATION'
        );

        console.log(
          '='.repeat(60)
        );

        console.log(
          'Expected:',
          expectedColumns
        );

        console.log(
          'Actual:',
          actualHeaders
        );

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