import { test, expect } from '@playwright/test';

import { Login }
from '../../../pages/Login/Loginpage';

import { LeftsideNavigation }
from '../../../pages/Navigations/LeftSideNavigation';

import { AddModule }
from '../../../pages/Systemconfig/Taxonomy/AddModule';

import { EditModule }
from '../../../pages/Systemconfig/Taxonomy/EditModule';

import { Reporter }
from '../../../pages/utils/NewReport';

test(
  'Verify user can edit Module successfully',

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

    await navigation.goToAppTypes();

    await page.waitForLoadState(
      'networkidle'
    );

    // ==========================
    // CREATE MODULE
    // ==========================

    const addModule =
      new AddModule(page);

    const originalTitle =
      `Module_${Date.now()}`;

    const originalIdentifier =
      `module_${Date.now()}`;

    await addModule.openAdminApp();

    await addModule.clickAddModule();

    await addModule.AddModule(
      originalTitle,
      originalIdentifier
    );

    await page.reload();

    await page.waitForLoadState(
      'networkidle'
    );

    // Open Modules page again after reload

    await page.reload();

await page.waitForLoadState('networkidle');

// Wait until Modules table is loaded
await page.locator('table').waitFor({
  state: 'visible'
});

    // ==========================
    // EDIT MODULE
    // ==========================

    const editModule =
      new EditModule(page);

    const updatedTitle =
      `Updated_${Date.now()}`;

    const updatedIdentifier =
      `updated_${Date.now()}`;

    await editModule.EditModule(
      originalTitle,
      updatedTitle,
      updatedIdentifier
    );

    // ==========================
    // VALIDATE
    // ==========================

    const updatedModule =
      await editModule.validateUpdatedModule(
        updatedTitle
      );

    Reporter.validateEdit(
      originalTitle,
      updatedTitle,
      updatedModule,
      'Module Title',
      testInfo
    );

    expect(
      updatedModule
    ).toBe(
      updatedTitle
    );

    Reporter.endTest(
      testInfo
    );
  }
);