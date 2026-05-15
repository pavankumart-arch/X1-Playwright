import { test }
  from '@playwright/test';

import { LeftsideNavigation }
  from '../../../pages/Navigations/LeftSideNavigation';

import { Login }
  from '../../../pages/Login/Loginpage';

import { UserSearch }
  from '../../../pages/ApplicationConfig/Users/Search';

test(
  'Verify User Search Functionality',
  async ({ page }, testInfo) => {

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

    await page.waitForLoadState(
      'networkidle'
    );

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

    await search
      .searchByStatus(testInfo);

    await search
      .invalidSearch(testInfo);
  }
);