import {
  test,
  expect
} from '@playwright/test';

import { Login }
from '../../../pages/Login/Loginpage';

import { LeftsideNavigation }
from '../../../pages/Navigations/LeftSideNavigation';

import { ModuleSearch }
from '../../../pages/Systemconfig/Taxonomy/ModuleSearch';

import { ModulePagination }
from '../../../pages/Systemconfig/Taxonomy/ModulePagination';

import { Reporter }
from '../../../pages/utils/NewReport';

test(
  'Verify Module Pagination',

  async ({ page }, testInfo) => {

    Reporter.startTest();

    // LOGIN

    const login =
      new Login(page);

    await login.navigateToURL();

    await login.loginToApplication();

    // NAVIGATION

    const navigation =
      new LeftsideNavigation(page);

    await navigation.gotoSystemConfig();

    await navigation.goToTaxonomy();

    await page.waitForLoadState(
      'networkidle'
    );

    // OPEN ADMIN MODULES

    const moduleSearch =
      new ModuleSearch(
        page,
        testInfo
      );

    await moduleSearch
      .openAdminModules();

    // PAGINATION

    const pagination =
      new ModulePagination(page);

    const results =
      await pagination
        .verifyAllPagination();

    let allPassed = true;

    console.log(
      '\n' + '='.repeat(60)
    );

    console.log(
      'MODULE PAGINATION VALIDATION'
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

    Reporter.validateData(

      true,

      allPassed,

      'Module Pagination Validation',

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

    expect(
      allPassed,
      'All Module pagination validations should pass'
    ).toBeTruthy();

    Reporter.endTest(
      testInfo
    );
  }
);