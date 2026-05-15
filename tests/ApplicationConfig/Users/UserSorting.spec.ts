import {
  test
} from '@playwright/test';

import {
  Login
} from '../../../pages/Login/Loginpage';

import {
  LeftsideNavigation
} from '../../../pages/Navigations/LeftSideNavigation';

import {
  UserSorting
} from '../../../pages/ApplicationConfig/Users/UserSorting';

test.describe(
  'User Table Sorting Validation',
  () => {

    test(
      'Verify User Table Sorting Functionality',
      async ({ page }, testInfo) => {

        // =====================================================
        // PAGE OBJECTS
        // =====================================================

        const loginPage =
          new Login(page);

        const navigation =
          new LeftsideNavigation(page);

        const sorting =
          new UserSorting(page);

        // =====================================================
        // LOGIN TO APPLICATION
        // =====================================================

        console.log(
          '\n================================================'
        );

        console.log(
          'Launching Application and Logging In'
        );

        console.log(
          '================================================'
        );

        await loginPage
          .navigateToURL();

        await loginPage
          .loginToApplication();

        await page.waitForLoadState(
          'networkidle'
        );

        console.log(
          'Login Completed Successfully'
        );

        // =====================================================
        // NAVIGATE TO USERS PAGE
        // =====================================================

        console.log(
          '\n================================================'
        );

        console.log(
          'Navigating to Users Management Page'
        );

        console.log(
          '================================================'
        );

        await navigation
          .gotoApplicationConfig();

        await page.waitForLoadState(
          'networkidle'
        );

        await navigation
          .goToUsers();

        await page.waitForLoadState(
          'networkidle'
        );

        console.log(
          'Users Page Opened Successfully'
        );

        // =====================================================
        // USER TABLE SORTING VALIDATION
        // =====================================================

        console.log(
          '\n================================================'
        );

        console.log(
          'Starting User Table Sorting Validation'
        );

        console.log(
          '================================================'
        );

        // =====================================================
        // EXECUTE SORTING VALIDATIONS
        // =====================================================

        await sorting
          .sortByID(testInfo);

        await sorting
          .sortByUsername(testInfo);

        await sorting
          .sortByEmail(testInfo);

        await sorting
          .sortByReseller(testInfo);

        await sorting
          .sortByUserType(testInfo);

        await sorting
          .sortByStatus(testInfo);

        // =====================================================
        // COMPLETED
        // =====================================================

        console.log(
          '\n================================================'
        );

        console.log(
          'User Table Sorting Validation Completed Successfully'
        );

        console.log(
          '================================================'
        );
      }
    );
  }
);