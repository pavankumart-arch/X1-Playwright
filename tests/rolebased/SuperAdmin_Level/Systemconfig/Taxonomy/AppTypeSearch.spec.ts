import { test, TestInfo } from '@playwright/test';

import { Login }
from '../../../pages/Login/Loginpage';

import { LeftsideNavigation }
from '../../../pages/Navigations/LeftSideNavigation';

import { AppTypeSearch }
from '../../../pages/Systemconfig/Taxonomy/AppTypeSearch';

import { logAndValidate }
from '../../../utils/reportUtil';

test(
  'Verify AppType Search Functionality',

  async ({ page }, testInfo: TestInfo) => {

    const loginPage =
      new Login(page);

    await loginPage.navigateToURL();

    await loginPage.loginToApplication();

    const navigation =
      new LeftsideNavigation(page);

    await navigation.goToTaxonomy();

    await navigation.goToAppTypes();

    await page.waitForLoadState(
      'networkidle'
    );

    const appTypeSearch =
      new AppTypeSearch(
        page,
        testInfo
      );

    console.log(`\n${'='.repeat(60)}`);
    console.log(
      'RUNNING APPTYPE SEARCH TESTS'
    );
    console.log(`${'='.repeat(60)}`);

    // =========================================
    // ✅ POSITIVE TESTS
    // =========================================
    await appTypeSearch.searchByID();

    await appTypeSearch.searchByAppTitle();

    await appTypeSearch.searchByAppType();

    // =========================================
    // ✅ NEGATIVE TESTS
    // =========================================
    await appTypeSearch.invalidSearch();

    await appTypeSearch.nonExistentAppTitle();

    await appTypeSearch.nonExistentID();

    // =========================================
    // ✅ FINAL SUMMARY
    // =========================================
    console.log(`\n${'='.repeat(60)}`);
    console.log(
      'FINAL SUMMARY - APPTYPE SEARCH'
    );
    console.log(`${'='.repeat(60)}`);

    if (appTypeSearch.hasFailures()) {

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

    logAndValidate({
       step: 'SUMMARY - AppType Search Functionality',
  expected: 'All tests passed',
  actual: appTypeSearch.hasFailures()
    ? `${appTypeSearch.getFailures().length} test(s) failed`
    : 'All tests passed',
}, testInfo)
  }
);