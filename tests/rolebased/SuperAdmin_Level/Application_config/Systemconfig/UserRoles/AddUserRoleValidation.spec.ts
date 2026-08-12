import { test, expect }
from '@playwright/test';

import { Login }
from '../../../pages/Login/Loginpage';

import { LeftsideNavigation }
from '../../../pages/Navigations/LeftSideNavigation';

import { UserRoleValidationPage }
from '../../../pages/Systemconfig/UserRoles/AddUserRoleValidation';

test(
  'Validate Add User Role Form',

  async ({ page }, testInfo) => {

    const loginPage =
      new Login(page);

    await loginPage.navigateToURL();

    await loginPage.loginToApplication();

    const navigation =
      new LeftsideNavigation(page);

    await navigation.gotoSystemConfig();

    await navigation.goToUserRoles();

    await navigation.clickAddRole();

    const userRoleValidation =
      new UserRoleValidationPage(page);

    // Click Save button

    await userRoleValidation
      .clickSaveButton();

    // Validate errors

    const isValid =
      await userRoleValidation
        .validateRequiredFieldErrors();

    console.log(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
STEP     : Overall Test Result
STATUS   : ${isValid ? 'PASS ✅' : 'FAIL ❌'}
EXPECTED : PASS
ACTUAL   : ${isValid ? 'PASS' : 'FAIL'}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`);

    testInfo.annotations.push({
      type: 'Final Result',
      description:
        isValid
          ? 'Test PASSED'
          : 'Test FAILED'
    });

    expect(isValid).toBeTruthy();
  }
);