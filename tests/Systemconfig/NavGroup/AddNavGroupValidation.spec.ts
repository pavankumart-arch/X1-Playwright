import { test, expect } from '@playwright/test';

import { Login }
from '../../../pages/Login/Loginpage';

import { LeftsideNavigation }
from '../../../pages/Navigations/LeftSideNavigation';

import { ValidateAddNavGroupForm }
from '../../../pages/Systemconfig/NavGroup/AddNavGroupValidation';

import { Reporter }
from '../../../pages/utils/NewReport';

test(
  'Validate Add Nav Group Form',
  async ({ page }, testInfo) => {

    test.setTimeout(180000);

    // ===================================
    // START REPORT
    // ===================================
    Reporter.startTest();

    // ===================================
    // LOGIN
    // ===================================
    const loginPage =
      new Login(page);

    await loginPage.navigateToURL();

    await loginPage.loginToApplication();

    // ===================================
    // NAVIGATION
    // ===================================
    const navigation =
      new LeftsideNavigation(page);

    await navigation.gotoSystemConfig();

    await navigation.gotoNavGroup();

    await page.waitForLoadState(
      'networkidle'
    );

    // ===================================
    // VALIDATION PAGE
    // ===================================
    const validateForm =
      new ValidateAddNavGroupForm(
        page,
        testInfo
      );

    // ===================================
    // RUN VALIDATION
    // ===================================
    const isValid =
      await validateForm.validateAddNavGroupForm();

    // ===================================
    // REPORT RESULT
    // ===================================
    Reporter.validateData(
      true,
      isValid,
      'Add Nav Group Form Validation',
      testInfo
    );

    // ===================================
    // FINAL RESULT
    // ===================================
    console.log(
      '\n' + '='.repeat(60)
    );

    console.log(
      `FINAL RESULT : ${
        isValid
          ? 'PASS ✅'
          : 'FAIL ❌'
      }`
    );

    console.log(
      '='.repeat(60)
    );

    // ===================================
    // TEST SUMMARY
    // ===================================
    Reporter.endTest(
      testInfo
    );

    // ===================================
    // ASSERTION
    // ===================================
    expect(
      isValid,
      'Add Nav Group Validation should pass'
    ).toBeTruthy();
  }
);