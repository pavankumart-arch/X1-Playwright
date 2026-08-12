import { test, expect } from '@playwright/test';

import { Login }
from '../../../pages/Login/Loginpage';

import { AddModule }
from '../../../pages/Systemconfig/Taxonomy/AddModule';

import { Reporter }
from '../../../pages/utils/NewReport';

test(
  'Add New Module',
  async ({ page }, testInfo) => {

    test.setTimeout(180000);

    Reporter.startTest();


    // =========================
    // LOGIN
    // =========================

    const loginPage =
      new Login(page);

    await loginPage.navigateToURL();

    await loginPage.loginToApplication();

    // =========================
    // OPEN TAXONOMY
    // =========================

    await page.getByText(
      'Taxonomy'
    ).first().click();

    await page.waitForTimeout(
      2000
    );

    // =========================
    // OPEN ADMIN APP
    // =========================

    const addModule =
      new AddModule(page);

    await addModule.openAdminApp();

    // =========================
    // OPEN ADD MODULE PAGE
    // =========================

    await addModule.clickAddModule();

    // =========================
    // CREATE MODULE
    // =========================

    const moduleTitle =
      `Module_${Date.now()}`;

    const moduleIdentifier =
      `module_${Date.now()}`;

    await addModule.AddModule(
      moduleTitle,
      moduleIdentifier
    );

    // =========================
    // SEARCH CREATED MODULE
    // =========================

    const searchedModule =
      await addModule.searchModuleInSummary(
        moduleTitle
      );

    // =========================
    // VALIDATION
    // =========================

    Reporter.validateData(
      moduleTitle,
      searchedModule,
      'Created Module Validation',
      testInfo
    );

    expect(
      searchedModule
    ).toBe(
      moduleTitle
    );

    // =========================
    // URL VALIDATION
    // =========================

    const currentUrl =
      page.url();

    Reporter.validateData(
  true,
  currentUrl.includes('/admin/app_module/list'),
  'Module Redirect Validation',
  testInfo
);

    // =========================
    // FINAL RESULT
    // =========================

    testInfo.annotations.push({
      type: 'Final Result',
      description:
        `Module Created Successfully : ${moduleTitle}`
    });

    Reporter.endTest(
      testInfo
    );

    expect(
      currentUrl
    ).toContain(
      '/admin'
    );
  }
);