import { test, expect } from '@playwright/test';

import { Login }
  from '../../../pages/Login/Loginpage';

import { LeftsideNavigation }
  from '../../../pages/Navigations/LeftSideNavigation';

import { VerifyAppTypeCancelButton }
  from '../../../pages/Systemconfig/Taxonomy/AddApptypeCancel';

test(
  'Verify AppType Cancel Button Functionality',
  async ({ page }, testInfo) => {

    const loginPage = new Login(page);

    await loginPage.navigateToURL();
    await loginPage.loginToApplication();

    const navigation =
      new LeftsideNavigation(page);

    await navigation.gotoSystemConfig();
    await navigation.goToTaxonomy();
    await navigation.goToAppTypes();

    await page.waitForLoadState('networkidle');

    const cancelButtonTest =
      new VerifyAppTypeCancelButton(page);

    const isSuccess =
      await cancelButtonTest.VerifyAppTypeCancelButton();

    console.log(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
STEP     : Verify AppType Cancel Button Functionality
STATUS   : ${isSuccess ? 'PASS ✅' : 'FAIL ❌'}
EXPECTED : Successfully navigated back to Apps page
ACTUAL   : ${
      isSuccess
        ? 'Successfully navigated back to Apps page'
        : 'Failed to navigate back'
    }
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`);

    testInfo.annotations.push({
      type: 'Final Result',
      description:
        isSuccess
          ? 'Test PASSED'
          : 'Test FAILED'
    });

    expect(
      isSuccess,
      'Cancel button should navigate back to Apps page'
    ).toBeTruthy();
  }
);