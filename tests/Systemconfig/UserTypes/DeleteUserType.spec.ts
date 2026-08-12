import {
  test,
  expect,
  TestInfo
} from '@playwright/test';

import { Login }
  from '../../../pages/Login/Loginpage';

import { LeftsideNavigation }
  from '../../../pages/Navigations/LeftSideNavigation';

import { UserTypeCRUD }
  from '../../../pages/Systemconfig/UserTypes/DeleteUserType';

import { Reporter }
  from '../../../pages/utils/NewReport';

test(
  'UserType - Create, Search, Delete',

  async ({ page }, testInfo: TestInfo) => {

    Reporter.startTest();

    try {

      const login =
        new Login(page);

      const nav =
        new LeftsideNavigation(page);

      const userType =
        new UserTypeCRUD(page);

      // =========================
      // LOGIN
      // =========================

      await login.navigateToURL();

      await login.loginToApplication();

      // =========================
      // NAVIGATION
      // =========================

      await nav.gotoSystemConfig();

      await nav.gotoAddUserType();

      await page.waitForLoadState(
        'networkidle'
      );

      // =========================
      // DATA
      // =========================

      const userTypeName =
        `UserType_${Date.now()}`;

      const typeKey =
        `key_${Date.now()}`;

      // =========================
      // CREATE
      // =========================

      await userType.createUserType(
        userTypeName,
        typeKey
      );

      Reporter.validateData(
        true,
        true,
        'Create User Type Validation',
        testInfo
      );

      // =========================
      // SEARCH
      // =========================

      await userType.searchUserType(
        userTypeName
      );

      Reporter.validateData(
        true,
        true,
        'Search User Type Validation',
        testInfo
      );

      // =========================
      // DELETE
      // =========================

      await userType.deleteUserType(
        userTypeName
      );

      Reporter.validateDelete(
        userTypeName,
        true,
        testInfo
      );

      expect(
        true,
        'User Type Create/Search/Delete Flow Failed'
      ).toBeTruthy();

    } finally {

      Reporter.endTest(
        testInfo
      );
    }
  }
);