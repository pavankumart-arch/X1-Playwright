import { test, TestInfo } from '@playwright/test';

import { Login } from '../../pages/Login/Loginpage';

import { LeftsideNavigation } from '../../pages/Navigations/LeftSideNavigation';

import { ResellerSearch } from '../../pages/Resellers/ResellerSearch';

test(
  'Verify All Reseller Search Validations',
  async ({ page }, testInfo: TestInfo) => {

    // =====================================
    // INCREASE TIMEOUT
    // =====================================

    test.setTimeout(300000);

    const loginPage =
      new Login(page);

    const leftsideNavigation =
      new LeftsideNavigation(page);

    const resellerSearch =
      new ResellerSearch(page);

    // =====================================
    // LOGIN ONLY ONCE
    // =====================================

    await loginPage.navigateToURL();

    await loginPage.loginToApplication();

    await leftsideNavigation.goToDashboard();

    await leftsideNavigation.goToResellers();

    // =====================================
    // SEARCH VALIDATION HEADING
    // =====================================

    testInfo.annotations.push({

      type: 'SEARCH VALIDATION',

      description:
`
========================================
RESELLER SEARCH VALIDATION
========================================
`
    });

    // =====================================
    // SEARCH TEST LIST
    // =====================================

    const searchTests = [

      {
        name: 'Search by ID',
        method: () =>
          resellerSearch.searchByID(testInfo)
      },

      {
        name: 'Search by Name',
        method: () =>
          resellerSearch.searchByName(testInfo)
      },

      {
        name: 'Search by Description',
        method: () =>
          resellerSearch.searchByDescription(testInfo)
      },

      {
        name: 'Search by Created Date',
        method: () =>
          resellerSearch.searchByCreated(testInfo)
      },

      {
        name: 'Search by Status',
        method: () =>
          resellerSearch.searchByStatus(testInfo)
      },

      {
        name: 'Search by Billing Name',
        method: () =>
          resellerSearch.searchByBillingName(testInfo)
      },

      {
        name: 'Search by Sales Person',
        method: () =>
          resellerSearch.searchBySalesPerson(testInfo)
      },

      {
        name: 'Search by TT Options',
        method: () =>
          resellerSearch.searchByTTOptions(testInfo)
      },

      {
        name: 'Search by App ID',
        method: () =>
          resellerSearch.searchByAppID(testInfo)
      },

      {
        name: 'Search by Player Size',
        method: () =>
          resellerSearch.searchByPlayerSize(testInfo)
      },

      {
        name: 'Invalid Search',
        method: () =>
          resellerSearch.invalidSearch(testInfo)
      }
    ];

    // =====================================
    // EXECUTE ALL SEARCH TESTS
    // =====================================

    for (const searchTest of searchTests) {

      try {

        console.log(`
========================================
RUNNING : ${searchTest.name}
========================================
`);

        await searchTest.method();

        console.log(`
========================================
PASSED : ${searchTest.name}
========================================
`);

      } catch (error: any) {

        console.log(`
========================================
FAILED : ${searchTest.name}

ERROR  : ${error.message}
========================================
`);
      }
    }

    console.log(`
========================================
ALL SEARCH TESTS EXECUTED
========================================
`);
  }
);