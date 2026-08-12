import { test, expect } from '@playwright/test';

import { Login }
  from '../../../pages/Login/Loginpage';

import { LeftsideNavigation }
  from '../../../pages/Navigations/LeftSideNavigation';

import { AddAppType }
  from '../../../pages/Systemconfig/Taxonomy/AddAppType';

import { EditAppType }
  from '../../../pages/Systemconfig/Taxonomy/EditAppType';

import { Reporter }
  from '../../../pages/utils/NewReport';

test(
  'Verify user can edit App Type successfully',
  async ({ page }, testInfo) => {

    Reporter.startTest();

    // ==========================
    // LOGIN
    // ==========================
    const loginPage =
      new Login(page);

    await loginPage.navigateToURL();

    await loginPage.loginToApplication();

    // ==========================
    // NAVIGATION
    // ==========================
    const navigation =
      new LeftsideNavigation(page);

    await navigation.gotoSystemConfig();

    await navigation.goToTaxonomy();

    await page.waitForLoadState(
      'networkidle'
    );

    // ==========================
    // CREATE APPTYPE
    // ==========================
    const addAppType =
      new AddAppType(page);

    const originalTitle =
      `AppType_${Date.now()}`;

    const originalIdentifier =
      `apptype_${Date.now()}`;

    await addAppType.AddAppType(
      originalTitle,
      originalIdentifier
    );

    await page.waitForTimeout(1000);

    await page.reload();

    await page.waitForLoadState(
      'networkidle'
    );

    const createdAppType =
      await addAppType.searchAppTypeInSummary(
        originalTitle
      );

    Reporter.validateData(
      originalTitle,
      createdAppType,
      'Created AppType',
      testInfo
    );

    expect(
      createdAppType
    ).toBe(
      originalTitle
    );

    // ==========================
    // EDIT APPTYPE
    // ==========================
    const editAppType =
      new EditAppType(page);

    const updatedTitle =
      `Updated_${Date.now()}`;

    const updatedIdentifier =
      `updated_${Date.now()}`;

    await editAppType.EditAppType(
      originalTitle,
      updatedTitle,
      updatedIdentifier
    );

    // ==========================
    // VALIDATE EDIT
    // ==========================
    await page.waitForLoadState(
      'networkidle'
    );

    const searchedUpdatedAppType =
      await editAppType.validateUpdatedAppType(
        updatedTitle
      );

    Reporter.validateEdit(
      originalTitle,
      updatedTitle,
      searchedUpdatedAppType,
      'AppType Title',
      testInfo
    );

    expect(
      searchedUpdatedAppType
    ).toBe(
      updatedTitle
    );

    Reporter.endTest(
      testInfo
    );
  }
);