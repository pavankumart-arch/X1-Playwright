import { test, expect } from '@playwright/test';

import { Login }
  from '../../../pages/Login/Loginpage';

import { LeftsideNavigation }
  from '../../../pages/Navigations/LeftSideNavigation';

import { NavItemPagination }
  from '../../../pages/Systemconfig/NavGroup/NavItemPagination';

import { Reporter }
  from '../../../pages/utils/NewReport';

test(
  'Nav Item Pagination Validation',
  async ({ page }, testInfo) => {

    Reporter.startTest();

    test.setTimeout(180000);

    // ==========================
    // LOGIN
    // ==========================
    const login =
      new Login(page);

    await login.navigateToURL();

    await login.loginToApplication();

    // ==========================
    // NAVIGATION
    // ==========================
    const navigation =
      new LeftsideNavigation(page);

    await navigation.goToDashboard();

    console.log(
      '👉 Navigating to Nav Group'
    );

    await navigation.gotoSystemConfig();

    await navigation.gotoNavGroup();

    console.log(
      '✅ Navigated to Nav Group page'
    );

    await page.waitForLoadState(
      'networkidle'
    );

    // ==========================
    // PAGINATION VALIDATION
    // ==========================
    const pagination =
      new NavItemPagination(page);

    const result =
      await pagination.validatePagination();

    Reporter.validateData(
      true,
      result,
      'Nav Item Pagination Validation',
      testInfo
    );

    // ==========================
    // FINAL RESULT
    // ==========================
    console.log(
      '\n' + '='.repeat(60)
    );

    console.log(
      `FINAL RESULT : ${
        result
          ? 'PASS ✅'
          : 'FAIL ❌'
      }`
    );

    console.log(
      '='.repeat(60)
    );

    expect(
      result
    ).toBeTruthy();

    Reporter.endTest(
      testInfo
    );

  }
);