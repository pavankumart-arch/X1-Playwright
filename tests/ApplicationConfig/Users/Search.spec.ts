import { test }
from '@playwright/test';

import { LeftsideNavigation }
from '../../../pages/Navigations/LeftSideNavigation';

import { Login }
from '../../../pages/Login/Loginpage';

import { UserSearch }
from '../../../pages/ApplicationConfig/Users/Search';

test.describe(
  'User Search Module',
  () => {

    test(
      'Verify User Search Functionality',

      async ({ page }, testInfo) => {

        // ============================================
        // TEST TIMEOUT
        // ============================================

        test.setTimeout(
          120000
        );

        // ============================================
        // PAGE OBJECTS
        // ============================================

        const loginPage =
          new Login(page);

        const navigation =
          new LeftsideNavigation(page);

        const search =
          new UserSearch(page);

        // ============================================
        // LOGIN
        // ============================================

        await loginPage
          .navigateToURL();

        await loginPage
          .loginToApplication();

        await page.waitForLoadState(
          'networkidle'
        );

        // ============================================
        // NAVIGATE TO USERS PAGE
        // ============================================

        await navigation
          .gotoApplicationConfig();

        await navigation
          .goToUsers();

        await page.waitForLoadState(
          'networkidle'
        );

        // ============================================
        // USER SEARCH VALIDATIONS
        // ============================================

        await search
          .searchByID(testInfo);

        await search
          .searchByUsername(testInfo);

        await search
          .searchByEmail(testInfo);

        await search
          .searchByReseller(testInfo);

        await search
          .searchByUserType(testInfo);

        // ============================================
        // ACTIVE SEARCH
        // ============================================

        await search
          .searchByStatus(testInfo);

        // ============================================
        // INACTIVE SEARCH
        // ============================================

        await search
          .searchByInactiveStatus(testInfo);

        // ============================================
        // INVALID SEARCH
        // ============================================

        await search
          .invalidSearch(testInfo);
      }
    );
  }
);