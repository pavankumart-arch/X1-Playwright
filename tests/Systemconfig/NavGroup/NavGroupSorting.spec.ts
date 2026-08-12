import {
  test,
  expect
} from '@playwright/test';

import { Login }
  from '../../../pages/Login/Loginpage';

import { LeftsideNavigation }
  from '../../../pages/Navigations/LeftSideNavigation';

import { NavGroupSorting }
  from '../../../pages/Systemconfig/NavGroup/NavGroupSorting';

import { Reporter }
  from '../../../pages/utils/NewReport';

test(
  'Verify Nav Group Sorting Functionality',
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

    await page.waitForLoadState(
      'networkidle'
    );

    await navigation.gotoSystemConfig();

    await navigation.gotoNavGroup();

    await page.waitForLoadState(
      'networkidle'
    );

    // ==========================
    // SORTING VALIDATION
    // ==========================
    const navGroupSorting =
      new NavGroupSorting(page);

    const columnsToTest = [
      'Label',
      'Icon',
      'Level',
      'Order',
      'Depth',
      'Sticky',
      'Cont',
      'Active'
    ];

    console.log(
      '\n' + '='.repeat(60)
    );

    console.log(
      'RUNNING NAV GROUP SORTING TESTS'
    );

    console.log(
      '='.repeat(60)
    );

    let allTestsPassed = true;

    const failedColumns: string[] = [];

    for (const column of columnsToTest) {

      console.log(
        `\n📋 Testing sorting for column: ${column}`
      );

      try {

        const result =
          await navGroupSorting
            .validateColumnSorting(
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

          console.log(
            `❌ Sorting test failed for ${column}`
          );

          if (result.error) {

            console.log(
              `Error: ${result.error}`
            );
          }

        } else {

          console.log(
            `✅ Sorting test passed for ${column}`
          );
        }

      } catch (error) {

        allTestsPassed = false;

        failedColumns.push(column);

        console.log(
          `❌ Error testing ${column}: ${error}`
        );

        Reporter.validateData(
          true,
          false,
          `${column} Sorting`,
          testInfo
        );
      }
    }

    // ==========================
    // SUMMARY
    // ==========================
    Reporter.validateData(
      true,
      allTestsPassed,
      'Nav Group Sorting Validation',
      testInfo
    );

    console.log(
      '\n' + '='.repeat(60)
    );

    console.log(
      `FINAL RESULT : ${
        allTestsPassed
          ? 'PASS ✅'
          : 'FAIL ❌'
      }`
    );

    if (failedColumns.length > 0) {

      console.log(
        `Failed Columns : ${failedColumns.join(', ')}`
      );
    }

    console.log(
      '='.repeat(60)
    );

    // ==========================
    // ASSERTION
    // ==========================
    expect(
      allTestsPassed,
      `Sorting failed for: ${failedColumns.join(', ')}`
    ).toBeTruthy();

    Reporter.endTest(
      testInfo
    );
  }
);