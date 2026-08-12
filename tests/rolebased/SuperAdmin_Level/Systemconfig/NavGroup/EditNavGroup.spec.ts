import { test, expect } from '@playwright/test';

import { Login } from '../../../pages/Login/Loginpage';

import { LeftsideNavigation }
  from '../../../pages/Navigations/LeftSideNavigation';

import { logAndValidate }
  from '../../../utils/reportUtil';

import { EditNavGroup } from '../../../pages/Systemconfig/NavGroup/EditNavGroup';

test('Edit Nav Group Functionality',
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
    const navigation =
      new LeftsideNavigation(page);

    await navigation.gotoSystemConfig();

    await navigation.gotoNavGroup();

    await page.waitForLoadState('networkidle');

    // ============================
    // EDIT NAV GROUP
    // ============================
    const editNavGroup =
      new EditNavGroup(page);

    const isSuccess =
      await editNavGroup.editNavGroup();

    // ============================
    // REPORTING
    // ============================
    logAndValidate({
      step: 'Edit Nav Group Functionality',
      expected: 'Nav Group edited successfully',
      actual: isSuccess
        ? 'Nav Group edited successfully'
        : 'Nav Group edit failed',
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
      'Nav Group should be edited successfully'
    ).toBeTruthy();
});