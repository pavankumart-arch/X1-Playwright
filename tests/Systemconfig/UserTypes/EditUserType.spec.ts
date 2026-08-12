import { test, expect } from '@playwright/test';

import { Login }
from '../../../pages/Login/Loginpage';

import { LeftsideNavigation }
from '../../../pages/Navigations/LeftSideNavigation';

import { UserTypeCRUD }
from '../../../pages/Systemconfig/UserTypes/EditUserType';

import { Reporter }
from '../../../pages/utils/NewReport';

test(
  'UserType - Create, Search, Edit, Validate',

  async ({ page }, testInfo) => {

    Reporter.startTest();

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
      'domcontentloaded'
    );

    // =========================
    // DATA
    // =========================

    const originalUserType =
      `UserType_${Date.now()}`;

    const originalKey =
      `key_${Date.now()}`;

    const updatedUserType =
      `Updated_${Date.now()}`;

    const updatedKey =
      `updated_key_${Date.now()}`;

    // =========================
    // CREATE
    // =========================

    await userType.createUserType(
      originalUserType,
      originalKey
    );

    // =========================
    // SEARCH
    // =========================

    await userType.searchUserType(
      originalUserType
    );

    // =========================
    // EDIT
    // =========================

    await userType.editUserType(
      originalUserType,
      updatedUserType,
      updatedKey
    );

    // =========================
    // VALIDATE
    // =========================

    const isUpdated =
      await userType.validateUserType(
  updatedUserType
);

Reporter.validateEdit(
  originalUserType,
  updatedUserType,
  updatedUserType,
  'User Type',
  testInfo
);

    expect(
      isUpdated
    ).toBeTruthy();

    Reporter.endTest(
      testInfo
    );
  }
);