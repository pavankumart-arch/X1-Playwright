import {
  test,
  expect
} from '@playwright/test';

import { Login }
from '../../../pages/Login/Loginpage';

import { LeftsideNavigation }
from '../../../pages/Navigations/LeftSideNavigation';

import { ModuleSearch }
from '../../../pages/Systemconfig/Taxonomy/ModuleSearch';

import { AddModule }
from '../../../pages/Systemconfig/Taxonomy/AddModule';

import { CancelDeleteModule }
from '../../../pages/Systemconfig/Taxonomy/CancelDeleteModule';

import { Reporter }
from '../../../pages/utils/NewReport';

test(
  'Verify user can cancel Module deletion',

  async ({ page }, testInfo) => {

    Reporter.startTest();

    // LOGIN
    const loginPage =
      new Login(page);

    await loginPage.navigateToURL();

    await loginPage.loginToApplication();

    // NAVIGATION
    const navigation =
      new LeftsideNavigation(page);

    await navigation.gotoSystemConfig();

    await navigation.goToTaxonomy();

    await page.waitForLoadState('networkidle');

    // OPEN ADMIN MODULES
    const moduleSearch =
      new ModuleSearch(
        page,
        testInfo
      );

    await moduleSearch.openAdminModules();

    // CREATE MODULE
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

    // Wait until Module list is loaded
    await page.waitForLoadState('networkidle');

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

    expect(createdModule)
      .toBe(moduleTitle);

    // CANCEL DELETE
    const cancelDelete =
      new CancelDeleteModule(page);

    const stillExists =
      await cancelDelete.CancelDeleteModule(
        moduleTitle
      );

    Reporter.validateData(
      true,
      stillExists,
      'Cancel Delete Module',
      testInfo
    );

    expect(stillExists)
      .toBeTruthy();

    console.log(
      '✅ Module remains after Cancel Delete'
    );

    Reporter.endTest(
      testInfo
    );
  }
);