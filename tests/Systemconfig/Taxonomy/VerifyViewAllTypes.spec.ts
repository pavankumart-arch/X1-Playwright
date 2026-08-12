import {
  test,
  expect
} from '@playwright/test';

import { Login }
from '../../../pages/Login/Loginpage';

import { LeftsideNavigation }
from '../../../pages/Navigations/LeftSideNavigation';

import { VerifyViewAllTypes }
from '../../../pages/Systemconfig/Taxonomy/VerifyViewAllTypes';

import { Reporter }
from '../../../pages/utils/NewReport';

test(
  'Verify View All Types Page',

  async ({ page }, testInfo) => {

    Reporter.startTest();

    const loginPage =
      new Login(page);

    await loginPage.navigateToURL();

    await loginPage.loginToApplication();

    const navigation =
      new LeftsideNavigation(page);

    await navigation.goToTaxonomy();

    await page.waitForLoadState(
      'networkidle'
    );

    const verifyPage =
      new VerifyViewAllTypes(page);

    const result =
      await verifyPage.verifyViewAllTypesPage();

    Reporter.validateData(
      true,
      result,
      'View All Types Validation',
      testInfo
    );

    expect(
      result
    ).toBeTruthy();

    Reporter.endTest(
      testInfo
    );
  }
);