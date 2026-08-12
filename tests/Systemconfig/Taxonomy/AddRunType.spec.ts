import { test, expect } from '@playwright/test';

import { Login }
from '../../../pages/Login/Loginpage';

import { LeftsideNavigation }
from '../../../pages/Navigations/LeftSideNavigation';

import { AddModule }
from '../../../pages/Systemconfig/Taxonomy/AddModule';

import { AddRunType }
from '../../../pages/Systemconfig/Taxonomy/AddRunType';

import { Reporter }
from '../../../pages/utils/NewReport';

test(
  'Add New RunType',
  async ({ page }, testInfo) => {

    test.setTimeout(180000);

    Reporter.startTest();



    const loginPage =
      new Login(page);

    await loginPage.navigateToURL();

    await loginPage.loginToApplication();

    const navigation =
      new LeftsideNavigation(page);

    await navigation.gotoSystemConfig();

    await navigation.goToTaxonomy();

    await page.waitForLoadState(
      'networkidle'
    );

    const addModule =
      new AddModule(page);

    await addModule.openAdminApp();

    await page.waitForLoadState(
      'networkidle'
    );

    const addRunType =
      new AddRunType(page);

    await addRunType.clickAddRunType();

    const timestamp =
      Date.now();

    const runTypeName =
      `RunType_${timestamp}`;

    const typeIdentifier =
      `RUN_${timestamp}`;

    await addRunType.AddRunType(
      runTypeName,
      typeIdentifier,
      'InventoryController',
      'syncInventory'
    );

    await page.waitForLoadState(
      'networkidle'
    );

    const searchedRunType =
      await addRunType.searchRunTypeInSummary(
        runTypeName
      );

    Reporter.validateData(
      runTypeName,
      searchedRunType,
      'Created RunType Validation',
      testInfo
    );

    expect(
      searchedRunType
    ).toBe(
      runTypeName
    );

    const currentUrl =
      page.url();

    Reporter.validateData(
      true,
      currentUrl.includes(
        '/runtypes'
      ) ||
      currentUrl.includes(
        '/runtype'
      ),
      'RunType Redirect Validation',
      testInfo
    );

    testInfo.annotations.push({
      type: 'Final Result',
      description:
        `RunType Created Successfully : ${runTypeName}`
    });

    Reporter.endTest(
      testInfo
    );
  }
);