import {
  test,
  TestInfo
} from '@playwright/test';

import { Login }
from '../../pages/Login/Loginpage';

import { LeftsideNavigation }
from '../../pages/Navigations/LeftSideNavigation';

import { ResellerSearch }
from '../../pages/Resellers/ResellerSearch';

test.describe(
  'Reseller Search Test Cases',
  () => {

    let loginPage: Login;

    let leftsideNavigation:
      LeftsideNavigation;

    let resellerSearch:
      ResellerSearch;

    test.beforeEach(
      async ({ page }) => {

        loginPage =
          new Login(page);

        leftsideNavigation =
          new LeftsideNavigation(
            page
          );

        resellerSearch =
          new ResellerSearch(
            page
          );

        await loginPage.navigateToURL();

        await loginPage.loginToApplication();

        await leftsideNavigation.goToDashboard();

        await leftsideNavigation.goToResellers();
      }
    );

    // =====================================================
    // POSITIVE SEARCH TESTS
    // =====================================================

    test(
      'Search by ID',
      async (
        {},
        testInfo: TestInfo
      ) => {

        testInfo.annotations.push({
          type:
            'SEARCH VALIDATION',
          description:
`
========================================
SEARCH VALIDATION
========================================

Validate Search By ID

========================================
`
        });

        await resellerSearch.searchByID(
          testInfo
        );
      }
    );

    test(
      'Search by Name',
      async (
        {},
        testInfo: TestInfo
      ) => {

        testInfo.annotations.push({
          type:
            'SEARCH VALIDATION',
          description:
`
========================================
SEARCH VALIDATION
========================================

Validate Search By Name

========================================
`
        });

        await resellerSearch.searchByName(
          testInfo
        );
      }
    );

    test(
      'Search by Description',
      async (
        {},
        testInfo: TestInfo
      ) => {

        testInfo.annotations.push({
          type:
            'SEARCH VALIDATION',
          description:
`
========================================
SEARCH VALIDATION
========================================

Validate Search By Description

========================================
`
        });

        await resellerSearch.searchByDescription(
          testInfo
        );
      }
    );

    test(
      'Search by Created Date',
      async (
        {},
        testInfo: TestInfo
      ) => {

        testInfo.annotations.push({
          type:
            'SEARCH VALIDATION',
          description:
`
========================================
SEARCH VALIDATION
========================================

Validate Search By Created Date

========================================
`
        });

        await resellerSearch.searchByCreated(
          testInfo
        );
      }
    );

    test(
      'Search by Status',
      async (
        {},
        testInfo: TestInfo
      ) => {

        testInfo.annotations.push({
          type:
            'SEARCH VALIDATION',
          description:
`
========================================
SEARCH VALIDATION
========================================

Validate Search By Status

========================================
`
        });

        await resellerSearch.searchByStatus(
          testInfo
        );
      }
    );

    // =====================================================
    // NEGATIVE SEARCH TESTS
    // =====================================================

    test(
      'Search by Billing Name (No Data Expected)',
      async (
        {},
        testInfo: TestInfo
      ) => {

        testInfo.annotations.push({
          type:
            'NEGATIVE SEARCH VALIDATION',
          description:
`
========================================
NEGATIVE SEARCH VALIDATION
========================================

Validate Billing Name Search

========================================
`
        });

        await resellerSearch.searchByBillingName(
          testInfo
        );
      }
    );

    test(
      'Search by Sales Person (No Data Expected)',
      async (
        {},
        testInfo: TestInfo
      ) => {

        testInfo.annotations.push({
          type:
            'NEGATIVE SEARCH VALIDATION',
          description:
`
========================================
NEGATIVE SEARCH VALIDATION
========================================

Validate Sales Person Search

========================================
`
        });

        await resellerSearch.searchBySalesPerson(
          testInfo
        );
      }
    );

    test(
      'Search by TT Options (No Data Expected)',
      async (
        {},
        testInfo: TestInfo
      ) => {

        testInfo.annotations.push({
          type:
            'NEGATIVE SEARCH VALIDATION',
          description:
`
========================================
NEGATIVE SEARCH VALIDATION
========================================

Validate TT Options Search

========================================
`
        });

        await resellerSearch.searchByTTOptions(
          testInfo
        );
      }
    );

    test(
      'Search by App ID (No Data Expected)',
      async (
        {},
        testInfo: TestInfo
      ) => {

        testInfo.annotations.push({
          type:
            'NEGATIVE SEARCH VALIDATION',
          description:
`
========================================
NEGATIVE SEARCH VALIDATION
========================================

Validate App ID Search

========================================
`
        });

        await resellerSearch.searchByAppID(
          testInfo
        );
      }
    );

    test(
      'Search by Player Size (No Data Expected)',
      async (
        {},
        testInfo: TestInfo
      ) => {

        testInfo.annotations.push({
          type:
            'NEGATIVE SEARCH VALIDATION',
          description:
`
========================================
NEGATIVE SEARCH VALIDATION
========================================

Validate Player Size Search

========================================
`
        });

        await resellerSearch.searchByPlayerSize(
          testInfo
        );
      }
    );

    test(
      'Invalid Search (No Data Expected)',
      async (
        {},
        testInfo: TestInfo
      ) => {

        testInfo.annotations.push({
          type:
            'NEGATIVE SEARCH VALIDATION',
          description:
`
========================================
NEGATIVE SEARCH VALIDATION
========================================

Validate Invalid Search

========================================
`
        });

        await resellerSearch.invalidSearch(
          testInfo
        );
      }
    );
  }
);