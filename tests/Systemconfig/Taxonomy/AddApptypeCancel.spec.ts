import { test, expect }
from '@playwright/test';

import { Login }
from '../../../pages/Login/Loginpage';

import { LeftsideNavigation }
from '../../../pages/Navigations/LeftSideNavigation';

import { VerifyAppTypeCancelButton }
from '../../../pages/Systemconfig/Taxonomy/AddApptypeCancel';

import { Reporter }
from '../../../pages/utils/NewReport';

test(
  'Verify AppType Cancel Button Functionality',
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

    await page.waitForLoadState(
      'networkidle'
    );

    // ==========================
    // CANCEL BUTTON VALIDATION
    // ==========================
    const cancelButtonTest =
      new VerifyAppTypeCancelButton(
        page
      );

    const isSuccess =
      await cancelButtonTest
        .VerifyAppTypeCancelButton();

    // ==========================
    // REPORTING
    // ==========================
    Reporter.validateData(
      true,
      isSuccess,
      'AppType Cancel Button Validation',
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
      'Cancel button should navigate back to Apps page'
    ).toBeTruthy();

    Reporter.endTest(
      testInfo
    );
  }
);