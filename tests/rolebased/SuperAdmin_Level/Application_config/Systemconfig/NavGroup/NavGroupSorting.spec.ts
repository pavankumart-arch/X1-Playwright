
import { test, TestInfo } from '@playwright/test';

import { Login } from '../../../pages/Login/Loginpage';

import { LeftsideNavigation } from '../../../pages/Navigations/LeftSideNavigation';

import { NavGroupSorting } from '../../../pages/Systemconfig/NavGroup/NavGroupSorting';

test(
  'Verify Nav Group Sorting Functionality',
  async ({ page }, testInfo: TestInfo) => {

    test.setTimeout(180000);

    // LOGIN
    const loginPage =
      new Login(page);

    await loginPage.navigateToURL();

    await loginPage.loginToApplication();

    // NAVIGATION
    const navigation =
      new LeftsideNavigation(page);

    await page.waitForLoadState(
      'networkidle'
    );

    await navigation.gotoSystemConfig();

    await navigation.gotoNavGroup();

    // SORTING
    const navGroupSorting =
      new NavGroupSorting(page);

    // IGNORE LAST ACTION COLUMN
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

    console.log(`\n${'='.repeat(60)}`);
    console.log(`RUNNING NAV GROUP SORTING TESTS`);
    console.log(`${'='.repeat(60)}`);

    let allTestsPassed = true;

    const results: {
      column: string;
      passed: boolean;
      error?: string;
    }[] = [];

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

        results.push({
          column,
          passed: result.passed,
          error: result.error
        });

        if (!result.passed) {

          allTestsPassed = false;

          console.log(
            `❌ Sorting test failed for column: ${column}`
          );

          if (result.error) {

            console.log(
              `   Error Details: ${result.error}`
            );
          }

        } else {

          console.log(
            `✅ Sorting test passed for column: ${column}`
          );
        }

      } catch (error) {

        const errorMessage =
          error instanceof Error
            ? error.message
            : String(error);

        console.log(
          `❌ Error testing column ${column}: ${errorMessage}`
        );

        results.push({
          column,
          passed: false,
          error: errorMessage
        });

        allTestsPassed = false;
      }
    }

    // SUMMARY
    console.log(`\n${'='.repeat(60)}`);
    console.log(`SORTING TEST RESULTS SUMMARY`);
    console.log(`${'='.repeat(60)}`);

    for (const result of results) {

      const status =
        result.passed
          ? 'PASS ✅'
          : 'FAIL ❌';

      console.log(
        `${result.column.padEnd(25)} : ${status}`
      );

      if (
        !result.passed &&
        result.error
      ) {

        console.log(
          `   └─ Error: ${result.error}`
        );
      }
    }

    console.log(`${'='.repeat(60)}`);

    if (allTestsPassed) {

      console.log(
        `✅ ALL SORTING TESTS PASSED`
      );

    } else {

      console.log(
        `❌ SOME SORTING TESTS FAILED`
      );
    }

    console.log(`${'='.repeat(60)}`);

    // REPORT ANNOTATIONS
    testInfo.annotations.push({
      type: 'Sorting Test Result',
      description:
        allTestsPassed
          ? 'All sorting tests passed successfully'
          : `${results.filter(r => !r.passed).length} sorting test(s) failed`
    });

    for (const result of results) {

      if (!result.passed) {

        testInfo.annotations.push({
          type: `Failed Column: ${result.column}`,
          description:
            result.error ||
            'Sorting not working correctly'
        });
      }
    }
  }
);

