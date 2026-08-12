import {
  test,
  expect
} from '@playwright/test';

import { Login }
  from '../../../pages/Login/Loginpage';

import { LeftsideNavigation }
  from '../../../pages/Navigations/LeftSideNavigation';

import { AddAppType }
  from '../../../pages/Systemconfig/Taxonomy/AddAppType';

import { Reporter }
  from '../../../pages/utils/NewReport';

test(
  'Add New App Type',
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

    await navigation.goToTaxonomy();

    await page.waitForLoadState(
      'networkidle'
    );

    // await navigation.goToAppTypes();

    await page.waitForLoadState(
      'networkidle'
    );

    // ==========================
    // CREATE APP TYPE
    // ==========================
    const addAppType =
      new AddAppType(page);

    const originalTitle =
      `AppType_${Date.now()}`;

    const originalIdentifier =
      `apptype_${Date.now()}`;

    await addAppType.AddAppType(
      originalTitle,
      originalIdentifier
    );

    await page.waitForTimeout(
      1000
    );

    await page.reload();

    await page.waitForLoadState(
      'networkidle'
    );

    // ==========================
    // VERIFY CREATED APP TYPE
    // ==========================
    const searchedAppType =
      await addAppType.searchAppTypeInSummary(
        originalTitle
      );

    Reporter.validateData(
      originalTitle,
      searchedAppType,
      'Created App Type',
      testInfo
    );

    // ==========================
    // FINAL RESULT
    // ==========================
    console.log(
      '\n' + '='.repeat(60)
    );

    console.log(
      `FINAL RESULT : ${
        searchedAppType === originalTitle
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
      searchedAppType
    ).toBe(
      originalTitle
    );

    Reporter.endTest(
      testInfo
    );
  }
);