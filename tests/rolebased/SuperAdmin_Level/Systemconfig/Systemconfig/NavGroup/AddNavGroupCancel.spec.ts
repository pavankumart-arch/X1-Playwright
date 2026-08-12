import { test, expect } from '@playwright/test';

import { Login } from '../../../pages/Login/Loginpage';

import { LeftsideNavigation } from '../../../pages/Navigations/LeftSideNavigation';

import { logAndValidate } from '../../../utils/reportUtil';

import { VerifyNavGroupCancelButton }
  from '../../../pages/Systemconfig/NavGroup/AddNavGroupCancel';

test('Verify Nav Group Cancel Button Functionality',
  async ({ page }, testInfo) => {

    test.setTimeout(180000);

    // ============================
    // LOGIN
    // ============================
    const loginPage = new Login(page);

    await loginPage.navigateToURL();

    await loginPage.loginToApplication();

    // ============================
    // NAVIGATION
    // ============================
    const navigation = new LeftsideNavigation(page);

    // System Config
    await navigation.gotoSystemConfig();

    // Nav Groups
    await navigation.gotoNavGroup();

    await page.waitForLoadState('networkidle');

    // ============================
    // CANCEL BUTTON VALIDATION
    // ============================
    const cancelValidation =
      new VerifyNavGroupCancelButton(page);

    const isSuccess =
      await cancelValidation.VerifyNavGroupCancelButton();

    // ============================
    // REPORTING
    // ============================
    logAndValidate({
      step: 'Verify Nav Group Cancel Button Functionality',
      expected: 'Successfully navigated back to Nav Groups page',
      actual: isSuccess
        ? 'Successfully navigated back to Nav Groups page'
        : 'Failed to navigate back',
    }, testInfo);

    // ============================
    // FINAL RESULT
    // ============================
    console.log('\n' + '='.repeat(60));

    console.log(
      `FINAL RESULT : ${isSuccess ? 'PASS ✅' : 'FAIL ❌'}`
    );

    console.log('='.repeat(60));

    // ============================
    // ASSERTION
    // ============================
    expect(
      isSuccess,
      'Cancel button should navigate back to Nav Groups page'
    ).toBeTruthy();
});