import { expect, test, TestInfo } from '@playwright/test';

import { Login } from '../../pages/Login/Loginpage';

import { LeftsideNavigation } from '../../pages/Navigations/LeftSideNavigation';

import { TableSorting } from '../../pages/Resellers/ResellerSorting';

test.describe.configure({
  retries: 0
});

test(
  'Verify All Reseller Sorting Validations',
  async ({ page }, testInfo: TestInfo) => {

    // =====================================
    // INCREASE TIMEOUT
    // =====================================

    test.setTimeout(300000);

    const loginPage =
      new Login(page);

    const navigation =
      new LeftsideNavigation(page);

    const sorting =
      new TableSorting(page);

    // =====================================
    // TRACK FAILURES
    // =====================================

    const failedColumns:
      string[] = [];

    // =====================================
    // LOGIN ONLY ONCE
    // =====================================

    await loginPage.navigateToURL();

    await loginPage.loginToApplication();

    await navigation.goToDashboard();

    await navigation.goToResellers();

    // =====================================
    // REPORT HEADING
    // =====================================

    testInfo.annotations.push({

      type: 'SORTING VALIDATION',

      description:
`
========================================
RESELLER SORTING VALIDATION
========================================
`
    });

    // =====================================
    // SORTING COLUMNS
    // =====================================

    const columns = [
      'ID',
      'NAME',
      'DESCRIPTION',
      'CREATED',
      'STATUS'
    ];

    // =====================================
    // EXECUTE ALL SORTING
    // =====================================

    for (const column of columns) {

      try {

        console.log(`
========================================
RUNNING SORTING : ${column}
========================================
`);

        const result =
          await sorting.validateColumnSorting(
            column,
            testInfo
          );

        if (!result) {

          failedColumns.push(column);
        }

        console.log(`
========================================
COMPLETED SORTING : ${column}
========================================
`);

      } catch (error: any) {

        failedColumns.push(column);

        console.log(`
========================================
SORTING FAILED : ${column}

ERROR : ${error.message}
========================================
`);
      }
    }

    // =====================================
    // FINAL RESULT
    // =====================================

    if (failedColumns.length > 0) {

      console.log(`
========================================
FAILED SORTING COLUMNS

${failedColumns.join('\n')}
========================================
`);

      expect.soft(
        failedColumns.length,
        `Failed Columns:\n${failedColumns.join('\n')}`
      ).toBe(0);
    }

    console.log(`
========================================
ALL SORTING VALIDATIONS COMPLETED
========================================
`);
  }
);