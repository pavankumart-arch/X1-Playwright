import { test, TestInfo } from '@playwright/test';
import { Login } from '../../pages/Login/Loginpage';
import { LeftsideNavigation } from '../../pages/Navigations/LeftSideNavigation';
import { RooftopSorting } from '../../pages/Rooftops/RooftopSorting';
import { Reporter } from '../../pages/utils/NewReport';
import { RooftopNavigation } from '../../pages/Rooftops/RooftopNavigation';
import AddRooftopData from '../../testdata/AddRooftopData.json';

test.setTimeout(120000);

test("Verify Rooftop Sorting Functionality", async ({ page }, testInfo: TestInfo) => {

  // IMPORTANT - Add this line
  Reporter.startTest();

  const loginPage = new Login(page);

  // Login and navigate
  await loginPage.navigateToURL();
  await loginPage.loginToApplication();

  const navigation = new LeftsideNavigation(page);

  await navigation.goToDashboard();
  await page.waitForLoadState('networkidle');

  await navigation.goToResellers();
  await page.waitForLoadState('networkidle');

  const rooftopNavigation = new RooftopNavigation(page);

  await rooftopNavigation.searchAndOpenRecord(
    AddRooftopData.rooftopname,
    testInfo
  );

  await navigation.goToListofRooftops();
  await page.waitForLoadState('networkidle');

  const rooftopSorting = new RooftopSorting(page);

  const columnsToTest = [
    'Rooftop Name',
    'Description',
    'Created',
    'Status'
  ];

  console.log(`\n${"=".repeat(60)}`);
  console.log(`RUNNING ROOFTOP SORTING TESTS (Across All Pages)`);
  console.log(`${"=".repeat(60)}`);

  let allTestsPassed = true;

  const results: {
    column: string;
    passed: boolean;
    error?: string;
  }[] = [];

  for (const column of columnsToTest) {

    console.log(`\n📋 Testing sorting for column: ${column}`);

    try {

      const timeout =
        column === 'Status' ? 90000 : 60000;

      const result =
        await rooftopSorting.validateColumnSorting(
          column,
          testInfo,
          timeout
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
          console.log(`Error: ${result.error}`);
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
        `❌ Error testing ${column}: ${errorMessage}`
      );

      results.push({
        column,
        passed: false,
        error: errorMessage
      });

      allTestsPassed = false;
    }
  }

  // Final Summary
  console.log(`\n${"=".repeat(60)}`);
  console.log(`SORTING TEST RESULTS SUMMARY (All Pages)`);
  console.log(`${"=".repeat(60)}`);

  for (const result of results) {

    const status =
      result.passed ? 'PASS ✅' : 'FAIL ❌';

    console.log(
      `${result.column.padEnd(20)} : ${status}`
    );

    if (!result.passed && result.error) {
      console.log(`   └─ ${result.error}`);
    }
  }

  console.log(`${"=".repeat(60)}`);

  // IMPORTANT CHANGE
  Reporter.validateData(
    'PASS',
    allTestsPassed ? 'PASS' : 'FAIL',
    'SORTING TESTS SUMMARY',
    testInfo
  );

  // End Reporter
  Reporter.endTest(testInfo);

  if (allTestsPassed) {

    console.log(`✅ ALL SORTING TESTS PASSED`);

    testInfo.annotations.push({
      type: 'Sorting Test Result',
      description:
        'All sorting tests passed successfully'
    });

  } else {

    console.log(
      `❌ SOME SORTING TESTS FAILED`
    );

    for (const result of results) {

      if (!result.passed) {

        testInfo.annotations.push({
          type: `Failed Column: ${result.column}`,
          description:
            result.error ||
            'Sorting failed'
        });
      }
    }

    throw new Error(
      `Sorting failed for columns: ${
        results
          .filter(r => !r.passed)
          .map(r => r.column)
          .join(', ')
      }`
    );
  }

});