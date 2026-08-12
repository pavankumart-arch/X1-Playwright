import { test, expect }
from '@playwright/test';

import { Login }
from '../../../pages/Login/Loginpage';

import { LeftsideNavigation }
from '../../../pages/Navigations/LeftSideNavigation';

import { VerifyAppTypeValidation }
from '../../../pages/Systemconfig/Taxonomy/AddAppTypeValidation';

import { Reporter }
from '../../../pages/utils/NewReport';

test(
  'Verify AppType Mandatory Field Validation',

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
    // VALIDATION
    // ==========================
    const validationPage =
  new VerifyAppTypeValidation(
    page,
    testInfo
  );

  
    const isSuccess =
      await validationPage
        .VerifyRequiredFieldValidation();

    // ==========================
    // REPORTING
    // ==========================
    Reporter.validateData(
      true,
      isSuccess,
      'AppType Mandatory Field Validation',
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
      'Mandatory field validation failed'
    ).toBeTruthy();

    Reporter.endTest(
      testInfo
    );
  }
);