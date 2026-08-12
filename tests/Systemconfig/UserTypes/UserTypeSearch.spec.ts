
import { test, expect } from '@playwright/test';

import { Login }
from '../../../pages/Login/Loginpage';

import { LeftsideNavigation }
from '../../../pages/Navigations/LeftSideNavigation';

import { UserTypeSearch }
from '../../../pages/Systemconfig/UserTypes/UserTypeSearch';

import { Reporter }
from '../../../pages/utils/NewReport';

test(
  'Verify User Type Search',

  async ({ page }, testInfo) => {

    Reporter.startTest();

    // =========================================
    // LOGIN
    // =========================================

    const loginPage =
      new Login(page);

    const navigation =
      new LeftsideNavigation(page);

    await loginPage.navigateToURL();

    await loginPage.loginToApplication();

    // =========================================
    // NAVIGATION
    // =========================================

    await navigation.gotoSystemConfig();

    await navigation.gotoAddUserType();

    // =========================================
    // SEARCH
    // =========================================

    const userTypeSearch =
      new UserTypeSearch(page);

    const result =
      await userTypeSearch.verifyUserTypeSearch();

    Reporter.validateSearch(
      'User Type Search',
      result ? 1 : 0,
      1,
      testInfo
    );

    expect(
      result,
      'First User Type should be searchable'
    ).toBeTruthy();

    Reporter.endTest(
      testInfo
    );
  }
);

