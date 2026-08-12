import { test, expect } from '@playwright/test';

import { Login }
from '../../../pages/Login/Loginpage';

import { LeftsideNavigation }
from '../../../pages/Navigations/LeftSideNavigation';

import { ModuleColumns }
from '../../../pages/Systemconfig/Taxonomy/ModuleColumns';

import { Reporter }
from '../../../pages/utils/NewReport';

test.describe(
  'Modules Columns Verification',
  () => {

    test(
      'Verify Modules Table Columns',
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

        // MODULE PAGE
        const moduleColumns =
          new ModuleColumns(page);

        // Search Admin and open Modules page
        await moduleColumns.openApp('Admin');

        // Verify Columns
        const {
          expectedColumns,
          actualHeaders
        } =
          await moduleColumns
            .verifyModuleColumns();

        Reporter.validateData(
          expectedColumns.join(', '),
          actualHeaders.join(', '),
          'Modules Table Columns',
          testInfo
        );

        console.log(
          '\n' + '='.repeat(60)
        );

        console.log(
          'MODULE COLUMN VALIDATION'
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