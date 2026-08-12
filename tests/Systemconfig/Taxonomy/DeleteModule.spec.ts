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

import { AddModule }
from '../../../pages/Systemconfig/Taxonomy/AddModule';

import { DeleteModule }
from '../../../pages/Systemconfig/Taxonomy/DeleteModule';

import { Reporter }
from '../../../pages/utils/NewReport';

test(
  'Verify user can delete Module successfully',

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

    await navigation.gotoSystemConfig();

    await navigation.goToTaxonomy();

    await page.waitForLoadState(
      'networkidle'
    );

    // ==========================
    // CREATE APP TYPE
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
    // OPEN APP TYPE
    // ==========================

    const clickApptpe =new DeleteModule(page);

   await clickApptpe.openAppType(appTypeTitle);

    const addModule =
      new AddModule(page);

    await addModule.clickAddModule();

    const moduleTitle =
      `Module_${Date.now()}`;

    const moduleIdentifier =
      `module_${Date.now()}`;

    await addModule.AddModule(
      moduleTitle,
      moduleIdentifier
    );

    await page.reload();

    await page.waitForLoadState(
      'networkidle'
    );

    const createdModule =
      await addModule.searchModuleInSummary(
        moduleTitle
      );

    Reporter.validateData(
      moduleTitle,
      createdModule,
      'Created Module',
      testInfo
    );

    expect(
      createdModule
    ).toBe(
      moduleTitle
    );

    // ==========================
    // DELETE MODULE
    // ==========================

    const deleteModule =
      new DeleteModule(page);

    const deleted =
      await deleteModule.DeleteModule(
        moduleTitle
      );

    Reporter.validateData(
      true,
      deleted,
      'Delete Module',
      testInfo
    );

    expect(
      deleted
    ).toBeTruthy();

    console.log(
      '✅ Module deleted successfully'
    );

    Reporter.endTest(
      testInfo
    );

  }
);