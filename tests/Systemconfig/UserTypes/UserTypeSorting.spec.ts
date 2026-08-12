import {
  test,
  TestInfo,
  expect
} from '@playwright/test';

import { Login }
from '../../../pages/Login/Loginpage';

import { LeftsideNavigation }
from '../../../pages/Navigations/LeftSideNavigation';

import { UserTypeSorting }
from '../../../pages/Systemconfig/UserTypes/UserTypeSorting';

import { Reporter }
from '../../../pages/utils/NewReport';

test(
  'Verify User Type Sorting Functionality',
  async ({ page }, testInfo: TestInfo) => {

    test.setTimeout(180000);

    Reporter.startTest();

    try {

      // =========================
      // LOGIN
      // =========================

      const loginPage =
        new Login(page);

      await loginPage.navigateToURL();

      await loginPage.loginToApplication();

      // =========================
      // NAVIGATION
      // =========================

      const navigation =
        new LeftsideNavigation(page);

      await page.waitForLoadState(
        'networkidle'
      );

      await navigation.gotoSystemConfig();

      await navigation.gotoAddUserType();

      // =========================
      // SORTING
      // =========================

      const userTypeSorting =
        new UserTypeSorting(page);

      const columnsToTest = [
        'ID',
        'Name',
        'Created',
        'Last Updated',
        'Status'
      ];

      console.log(
        `\n${'='.repeat(60)}`
      );
      console.log(
        'RUNNING USER TYPE SORTING TESTS'
      );
      console.log(
        `${'='.repeat(60)}`
      );

      const results: {
        column: string;
        passed: boolean;
        error?: string;
      }[] = [];

      let allTestsPassed = true;

      for (const column of columnsToTest) {

        console.log(
          `\n📋 Testing sorting for column: ${column}`
        );

        try {

          const result =
            await userTypeSorting
              .validateColumnSorting(
                column,
                testInfo
              );

          results.push({
            column,
            passed: result.passed,
            error: result.error
          });

          Reporter.validateData(
            true,
            result.passed,
            `Sorting Validation - ${column}`,
            testInfo
          );

          if (!result.passed) {

            allTestsPassed = false;

            console.log(
              `❌ Sorting failed for: ${column}`
            );

            if (result.error) {

              console.log(
                `Error: ${result.error}`
              );
            }

          } else {

            console.log(
              `✅ Sorting passed for: ${column}`
            );
          }

        } catch (error) {

          const errorMessage =
            error instanceof Error
              ? error.message
              : String(error);

          results.push({
            column,
            passed: false,
            error: errorMessage
          });

          allTestsPassed = false;

          Reporter.validateData(
            true,
            false,
            `Sorting Validation - ${column}`,
            testInfo
          );

          console.log(
            `❌ Error testing ${column}: ${errorMessage}`
          );
        }
      }

      // =========================
      // SUMMARY
      // =========================

      console.log(
        `\n${'='.repeat(60)}`
      );
      console.log(
        'FINAL SORTING SUMMARY'
      );
      console.log(
        `${'='.repeat(60)}`
      );

      results.forEach(result => {

        console.log(
          `${result.column} : ${
            result.passed
              ? 'PASS ✅'
              : 'FAIL ❌'
          }`
        );
      });

      console.log(
        `${'='.repeat(60)}`
      );

      Reporter.validateData(
        true,
        allTestsPassed,
        'User Type Sorting Validation',
        testInfo
      );

      expect(
        allTestsPassed,
        'One or more sorting validations failed'
      ).toBeTruthy();

    } finally {

      Reporter.endTest(
        testInfo
      );
    }
  }
);