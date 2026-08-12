import { test, expect } from '@playwright/test';

import { Login }
  from '../../../pages/Login/Loginpage';

import { LeftsideNavigation }
  from '../../../pages/Navigations/LeftSideNavigation';

import { AppTypePagination }
  from '../../../pages/Systemconfig/Taxonomy/PaginationApptypes';

import { Reporter }
  from '../../../pages/utils/NewReport';

test(
  'Verify App Type Pagination',
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

    await page.waitForLoadState(
      'networkidle'
    );

    // ==========================
    // PAGINATION VALIDATION
    // ==========================
    const appTypePagination =
      new AppTypePagination(page);

    const results =
      await appTypePagination
        .verifyAllPagination();

    // ==========================
    // REPORT RESULTS
    // ==========================
    let allPassed = true;

    console.log(
      '\n' + '='.repeat(60)
    );

    console.log(
      'APP TYPE PAGINATION VALIDATION'
    );

    console.log(
      '='.repeat(60)
    );

    for (const result of results) {

      const passed =
        result.expected === result.actual;

      if (!passed) {

        allPassed = false;
      }

      Reporter.validateData(
        result.expected,
        result.actual,
        result.step,
        testInfo
      );

      console.log(
        `📋 ${result.step}`
      );

      console.log(
        `Expected : ${result.expected}`
      );

      console.log(
        `Actual   : ${result.actual}`
      );

      console.log(
        `Status   : ${
          passed
            ? 'PASS ✅'
            : 'FAIL ❌'
        }\n`
      );
    }

    // ==========================
    // FINAL RESULT
    // ==========================
    Reporter.validateData(
      true,
      allPassed,
      'AppType Pagination Validation',
      testInfo
    );

    console.log(
      '\n' + '='.repeat(60)
    );

    console.log(
      `FINAL RESULT : ${
        allPassed
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
      allPassed,
      'All AppType pagination validations should pass'
    ).toBeTruthy();

    Reporter.endTest(
      testInfo
    );
  }
);