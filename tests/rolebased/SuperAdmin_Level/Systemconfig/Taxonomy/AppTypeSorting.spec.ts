import { test, TestInfo } from '@playwright/test';

import { Login }
from '../../../pages/Login/Loginpage';

import { LeftsideNavigation }
from '../../../pages/Navigations/LeftSideNavigation';

import { AppTypeSorting }
from '../../../pages/Systemconfig/Taxonomy/AppTypeSorting';

import { logAndValidate }
from '../../../utils/reportUtil';

test(
  'Verify AppType Sorting Functionality',

  async ({ page }, testInfo: TestInfo) => {

    // =========================================
    // ✅ LOGIN
    // =========================================
    const loginPage =
      new Login(page);

    await loginPage.navigateToURL();

    await loginPage.loginToApplication();

    // =========================================
    // ✅ NAVIGATION
    // =========================================
    const navigation =
      new LeftsideNavigation(page);

    await navigation.gotoSystemConfig();

    await navigation.goToTaxonomy();

    await navigation.goToAppTypes();

    await page.waitForLoadState('networkidle');

    // =========================================
    // ✅ SORTING CLASS
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

    let failures: string[] = [];

    // =========================================
    // ✅ RUN SORTING VALIDATION
    // =========================================
    for (const column of columns) {

      console.log(`\n${'='.repeat(60)}`);
      console.log(`📊 TESTING SORTING : ${column}`);
      console.log(`${'='.repeat(60)}`);

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
    }

    // =========================================
    // ✅ FINAL SUMMARY
    // =========================================
    console.log(`\n${'='.repeat(60)}`);
    console.log(`FINAL SUMMARY`);
    console.log(`${'='.repeat(60)}`);

    if (failures.length > 0) {

      console.log(`❌ FAILURES:`);

      failures.forEach(f =>
        console.log(`- ${f}`)
      );
    }
    else {

      console.log(`✅ ALL SORTING TESTS PASSED`);
    }

    // =========================================
    // ✅ REPORT
    // =========================================
    const summary =
      failures.length > 0
        ? `${failures.length} failure(s)`
        : 'All sorting tests passed';

    logAndValidate({
      step: 'SUMMARY - AppType Sorting',
      expected: summary,
      actual: summary,
    }, testInfo);
  }
)