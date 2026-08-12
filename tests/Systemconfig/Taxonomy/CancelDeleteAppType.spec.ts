import {
  test,
  expect
} from '@playwright/test';

import { Login }
from '../../../pages/Login/Loginpage';

import { LeftsideNavigation }
from '../../../pages/Navigations/LeftSideNavigation';

import { AddAppType }
from '../../../pages/Systemconfig/Taxonomy/AddAppType';

import { CancelDeleteAppType }
from '../../../pages/Systemconfig/Taxonomy/CancelDeleteAppType';

import { Reporter }
from '../../../pages/utils/NewReport';

test(
  'Verify user can cancel App Type deletion',

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

    const appTypeTitle =
      `AppType_${Date.now()}`;

    const appTypeIdentifier =
      `apptype_${Date.now()}`;

    await addAppType.AddAppType(
      appTypeTitle,
      appTypeIdentifier
    );

    await page.waitForTimeout(
      1000
    );

    await page.reload();

    await page.waitForLoadState(
      'networkidle'
    );

    const createdAppType =
      await addAppType.searchAppTypeInSummary(
        appTypeTitle
      );

    Reporter.validateData(
      appTypeTitle,
      createdAppType,
      'Created AppType',
      testInfo
    );

    expect(
      createdAppType
    ).toBe(
      appTypeTitle
    );

    // ==========================
    // CANCEL DELETE
    // ==========================
    const cancelDeleteAppType =
      new CancelDeleteAppType(page);

    const stillExists =
      await cancelDeleteAppType.CancelDeleteAppType(
        appTypeTitle
      );

    // ==========================
    // VALIDATION
    // ==========================
    Reporter.validateData(
      true,
      stillExists,
      'Cancel Delete AppType',
      testInfo
    );

    expect(
      stillExists
    ).toBeTruthy();

    console.log(
      '✅ AppType remains after Cancel Delete'
    );

    Reporter.endTest(
      testInfo
    );
  }
);