import { test, expect }
from '@playwright/test';

import { Login }
from '../../../pages/Login/Loginpage';

import { LeftsideNavigation }
from '../../../pages/Navigations/LeftSideNavigation';

import { VerifyAddModuleCancelButton }
from '../../../pages/Systemconfig/Taxonomy/AddModuleCancel';

import { Reporter }
from '../../../pages/utils/NewReport';

test(
  'Verify Module Cancel Button Functionality',

  async ({ page }, testInfo) => {

    Reporter.startTest();

    test.setTimeout(180000);

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
    // CANCEL BUTTON VALIDATION
    // ==========================

    const cancelButtonTest =
      new VerifyAddModuleCancelButton(
        page
      );

    const isSuccess =
      await cancelButtonTest
        .VerifyModuleCancelButton();

    // ==========================
    // REPORTING
    // ==========================

    Reporter.validateData(
      true,
      isSuccess,
      'Module Cancel Button Validation',
      testInfo
    );

    console.log(
      '\n' + '='.repeat(60)
    );

    console.log(
      `FINAL RESULT : ${
        isSuccess
          ? 'PASS ✅'
          : 'FAIL ❌'
      }`
    );

    console.log(
      '='.repeat(60)
    );

    // ==========================
    // ASSERTION
    // ==========================

    expect(
      isSuccess,
      'Cancel button should navigate back to Modules page'
    ).toBeTruthy();

    Reporter.endTest(
      testInfo
    );
  }
);