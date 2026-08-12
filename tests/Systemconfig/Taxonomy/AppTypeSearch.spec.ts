import {
  test,
  expect,
  TestInfo
} from '@playwright/test';

import { Login }
from '../../../pages/Login/Loginpage';

import { LeftsideNavigation }
from '../../../pages/Navigations/LeftSideNavigation';

import { AppTypeSearch }
from '../../../pages/Systemconfig/Taxonomy/AppTypeSearch';

import { Reporter }
from '../../../pages/utils/NewReport';

test(
  'Verify AppType Search Functionality',

  async ({ page }, testInfo: TestInfo) => {

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

    // If AppType is a separate submenu
    // await navigation.goToAppTypes();

    const appTypeSearch =
      new AppTypeSearch(
        page,
        testInfo
      );

    console.log(
      `\n${'='.repeat(60)}`
    );

    console.log(
      'RUNNING APPTYPE SEARCH TESTS'
    );

    console.log(
      `${'='.repeat(60)}`
    );

    // =========================================
    // POSITIVE TESTS
    // =========================================
    await appTypeSearch.searchByID();

    await appTypeSearch.searchByAppTitle();

    await appTypeSearch.searchByAppType();

    // =========================================
    // NEGATIVE TESTS
    // =========================================
    await appTypeSearch.invalidSearch();

    await appTypeSearch.nonExistentAppTitle();

    await appTypeSearch.nonExistentID();

    // =========================================
    // FINAL SUMMARY
    // =========================================
    console.log(
      `\n${'='.repeat(60)}`
    );

    console.log(
      'FINAL SUMMARY - APPTYPE SEARCH'
    );

    console.log(
      `${'='.repeat(60)}`
    );

    const hasFailures =
      appTypeSearch.hasFailures();

    if (hasFailures) {

      console.log(
        `❌ ${appTypeSearch.getFailures().length} TEST(S) FAILED`
      );

      appTypeSearch
        .getFailures()
        .forEach(f =>
          console.log(`- ${f}`)
        );

    } else {

      console.log(
        '✅ ALL TESTS PASSED'
      );
    }

    Reporter.validateData(
      'All tests passed',
      hasFailures
        ? `${appTypeSearch.getFailures().length} test(s) failed`
        : 'All tests passed',
      'SUMMARY - AppType Search Functionality',
      testInfo
    );

    expect(
      hasFailures
    ).toBeFalsy();

    Reporter.endTest(
      testInfo
    );
  }
);