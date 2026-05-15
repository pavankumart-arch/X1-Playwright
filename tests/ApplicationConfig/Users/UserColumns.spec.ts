import { test }
  from '@playwright/test';

import { UserColumns }
  from '../../../pages/ApplicationConfig/Users/UserColumns';

import { LeftsideNavigation }
  from '../../../pages/Navigations/LeftSideNavigation';

import { Login }
  from '../../../pages/Login/Loginpage';

test(
  'Verify User Table Headers',
  async ({ page }, testInfo) => {

    // ============================================
    // PAGE OBJECTS
    // ============================================

    const loginPage =
      new Login(page);

    const navigation =
      new LeftsideNavigation(page);

    const userColumns =
      new UserColumns(page);

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

    await page.waitForLoadState(
      'networkidle'
    );

    await navigation
      .goToUsers();

    await page.waitForLoadState(
      'networkidle'
    );

    // ============================================
    // VERIFY USER TABLE HEADERS
    // ============================================

    await userColumns
      .verifyUserColumnHeaders(
        testInfo
      );
  }
);