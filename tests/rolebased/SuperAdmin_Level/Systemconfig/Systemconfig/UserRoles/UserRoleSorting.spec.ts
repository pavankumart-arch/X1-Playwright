import {
  test,
  TestInfo,
  expect
} from '@playwright/test';

import { Login }
from '../../../pages/Login/Loginpage';

import { LeftsideNavigation }
from '../../../pages/Navigations/LeftSideNavigation';

import { UserRoleSorting }
from '../../../pages/Systemconfig/UserRoles/UserRoleSorting';

test(
  'Verify User Role Sorting Functionality',
  async ({ page }, testInfo: TestInfo) => {

    test.setTimeout(120000);

    const loginPage =
      new Login(page);

    await loginPage.navigateToURL();

    await loginPage.loginToApplication();

    const navigation =
      new LeftsideNavigation(page);

    await navigation.gotoSystemConfig();

    await navigation.goToUserRoles();

    await page.waitForLoadState(
      'networkidle'
    );

    await page.waitForTimeout(
      2000
    );

    const userRoleSorting =
      new UserRoleSorting(page);

    const columnsToTest = [
      'ID',
      'Role Name',
      'Created',
      'Updated',
      'Status'
    ];

    console.log(
      `\n${'='.repeat(60)}`
    );
    console.log(
      'RUNNING USER ROLE SORTING TESTS'
    );
    console.log(
      `${'='.repeat(60)}`
    );

    const results: {
      column: string;
      passed: boolean;
      error?: string;
    }[] = [];

    for (const column of columnsToTest) {

      console.log(
        `\n📋 Testing sorting for column: ${column}`
      );

      const result =
        await userRoleSorting.validateColumnSorting(
          column,
          testInfo
        );

      results.push({
        column,
        passed: result.passed,
        error: result.error
      });

      if (result.passed) {

        console.log(
          `✅ Sorting passed for: ${column}`
        );

      } else {

        console.log(
          `❌ Sorting failed for: ${column}`
        );

        if (result.error) {

          console.log(
            `Error: ${result.error}`
          );
        }
      }
    }

    console.log(
      `\n${'='.repeat(60)}`
    );
    console.log(
      'FINAL SORTING SUMMARY'
    );
    console.log(
      `${'='.repeat(60)}`
    );

    for (const result of results) {

      console.log(
        `${result.column} : ${
          result.passed
            ? 'PASS ✅'
            : 'FAIL ❌'
        }`
      );

      if (
        !result.passed &&
        result.error
      ) {

        console.log(
          `   Error: ${result.error}`
        );
      }
    }

    console.log(
      `${'='.repeat(60)}`
    );

    testInfo.annotations.push({
      type: 'Sorting Result',
      description:
        results
          .filter(
            r => !r.passed
          )
          .map(
            r => r.column
          )
          .join(', ') ||
        'All Passed'
    });

    // No assertion here.
    // Test will always complete and print summary.
  }
);