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

import { DeleteAppType }
from '../../../pages/Systemconfig/Taxonomy/DeleteAppType';

import { Reporter }
from '../../../pages/utils/NewReport';

test(
  'Verify user can delete App Type successfully',

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

    // If AppType is a submenu
    // await navigation.goToAppTypes();

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
    // DELETE APPTYPE
    // ==========================
    const deleteAppType =
      new DeleteAppType(page);

    await deleteAppType.DeleteAppType(
      appTypeTitle
    );

    // ==========================
    // VERIFY DELETION
    // ==========================
    const deleted =
      await deleteAppType.validateDeletedAppType(
        appTypeTitle
      );

    Reporter.validateData(
      true,
      deleted,
      'Delete AppType',
      testInfo
    );

    expect(
      deleted
    ).toBeTruthy();

    console.log(
      '✅ AppType deleted successfully'
    );

    Reporter.endTest(
      testInfo
    );
  }
);