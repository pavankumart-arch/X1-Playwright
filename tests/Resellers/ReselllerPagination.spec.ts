import { test } from '@playwright/test';

import { Login } from '../../pages/Login/Loginpage';

import { LeftsideNavigation } from '../../pages/Navigations/LeftSideNavigation';

import { ResellerPagination } from '../../pages/Resellers/ResellerPagination';

test(
  'Verify Reseller Pagination',
  async ({ page }, testInfo) => {

    const loginPage =
      new Login(page);

    const leftsideNavigation =
      new LeftsideNavigation(page);

    const resellerPagination =
      new ResellerPagination(page);

    // =====================================
    // LOGIN
    // =====================================

    await loginPage.navigateToURL();

    await loginPage.loginToApplication();

    // =====================================
    // NAVIGATION
    // =====================================

    await leftsideNavigation.goToDashboard();

    await leftsideNavigation.goToResellers();

    // =====================================
    // PAGINATION VALIDATION
    // =====================================

    await resellerPagination.verifyAllPagination(
      testInfo
    );
  }
);