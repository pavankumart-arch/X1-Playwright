import {
  test,
  expect,
  TestInfo
} from '@playwright/test';

import { Login }
from '../../../pages/Login/Loginpage';

import { LeftsideNavigation }
from '../../../pages/Navigations/LeftSideNavigation';

import { AppTypeSorting }
from '../../../pages/Systemconfig/Taxonomy/AppTypeSorting';

import { Reporter }
from '../../../pages/utils/NewReport';

test(
  'Verify AppType Sorting Functionality',

  async ({ page }, testInfo: TestInfo) => {

    Reporter.startTest();

    // =========================================
    // LOGIN
    // =========================================
    const loginPage =
      new Login(page);

    await loginPage.navigateToURL();

    await loginPage.loginToApplication();

    // =========================================
    // NAVIGATION
    // =========================================
    const navigation =
      new LeftsideNavigation(page);

    await navigation.gotoSystemConfig();

    await navigation.goToTaxonomy();

    // If AppType is a submenu, uncomment:
    // await navigation.goToAppTypes();

    await page.waitForLoadState(
      'networkidle'
    );

    // =========================================
    // SORTING CLASS
    // =========================================
    const appTypeSorting =
      new AppTypeSorting(page);

    const columns = [
      'ID',
      'App Title',
      'App Type',
      'Created',
      'Updated',
      'Status'
    ];

    const failures: string[] = [];

    console.log(
      `\n${'='.repeat(60)}`
    );

    console.log(
      'RUNNING APPTYPE SORTING TESTS'
    );

    console.log(
      `${'='.repeat(60)}`
    );

    // =========================================
    // RUN SORTING VALIDATION
    // =========================================
    for (const column of columns) {

      console.log(
        `\n${'='.repeat(60)}`
      );

      console.log(
        `📊 TESTING SORTING : ${column}`
      );

      console.log(
        `${'='.repeat(60)}`
      );

      try {

        const result =
          await appTypeSorting
            .validateColumnSorting(
              column,
              testInfo
            );

        if (!result.passed) {

          failures.push(
            `${column} : ${result.error}`
          );
        }

      } catch (error) {

        failures.push(
          `${column} : ${
            error instanceof Error
              ? error.message
              : String(error)
          }`
        );
      }
    }

    // =========================================
    // FINAL SUMMARY
    // =========================================
    console.log(
      `\n${'='.repeat(60)}`
    );

    console.log(
      'FINAL SUMMARY'
    );

    console.log(
      `${'='.repeat(60)}`
    );

    if (failures.length > 0) {

      console.log(
        '❌ FAILURES:'
      );

      failures.forEach(f =>
        console.log(`- ${f}`)
      );

    } else {

      console.log(
        '✅ ALL SORTING TESTS PASSED'
      );
    }

    Reporter.validateData(
      'All sorting tests passed',
      failures.length > 0
        ? `${failures.length} failure(s)`
        : 'All sorting tests passed',
      'SUMMARY - AppType Sorting',
      testInfo
    );

    expect(
      failures,
      failures.join('\n')
    ).toHaveLength(0);

    Reporter.endTest(
      testInfo
    );
  }
);