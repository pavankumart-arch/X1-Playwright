import {
  test,
  expect
} from '@playwright/test';

import { Login }
from '../../../pages/Login/Loginpage';

import { LeftsideNavigation }
from '../../../pages/Navigations/LeftSideNavigation';

import { NavItemSorting }
from '../../../pages/Systemconfig/NavGroup/NavItemSorting';

import { Reporter }
from '../../../pages/utils/NewReport';

test(
  'Verify Nav Item Sorting Functionality',
  async ({ page }, testInfo) => {

    Reporter.startTest();

    test.setTimeout(180000);

    // LOGIN
    const login =
      new Login(page);

    await login.navigateToURL();

    await login.loginToApplication();

    // NAVIGATION
    const navigation =
      new LeftsideNavigation(page);

    await navigation.gotoSystemConfig();

    await navigation.gotoNavGroup();

    const navItemSorting =
      new NavItemSorting(page);

    // Open Nav Item page
    await navItemSorting.openNavItems();

    const columnsToTest = [
      'Label',
      'RunType',
      'Level',
      'Order',
      'Active'
    ];

    let allTestsPassed = true;

    const failedColumns: string[] = [];

    for (const column of columnsToTest) {

      const result =
        await navItemSorting.validateColumnSorting(
          column,
          testInfo
        );

      Reporter.validateData(
        true,
        result.passed,
        `${column} Sorting`,
        testInfo
      );

      if (!result.passed) {

        allTestsPassed = false;

        failedColumns.push(column);
      }
    }

    Reporter.validateData(
      true,
      allTestsPassed,
      'Nav Item Sorting Validation',
      testInfo
    );

    expect(
      allTestsPassed,
      `Sorting failed for ${failedColumns.join(', ')}`
    ).toBeTruthy();

    Reporter.endTest(testInfo);

  }
);