import { test, TestInfo } from '@playwright/test';
import { Login } from '../../pages/Login/Loginpage';
import { LeftsideNavigation } from '../../pages/Navigations/LeftSideNavigation';
import { RooftopSorting } from '../../pages/Rooftops/RooftopSorting';

test("Verify Rooftop Sorting Functionality", async ({ page }, testInfo: TestInfo) => {
  test.setTimeout(120000);
  
  const loginPage = new Login(page);
  await loginPage.navigateToURL();
  await loginPage.loginToApplication();

  const navigation = new LeftsideNavigation(page);

  await navigation.goToDashboard();
  await page.waitForLoadState('networkidle');

  await navigation.goToResellers();
  await page.waitForLoadState('networkidle');

  const resellerName = "Premier Auto Group";

  const resellerButton = page
    .locator('table')
    .getByRole('button', { name: resellerName })
    .first();

  await resellerButton.click();
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);

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
  const results: { column: string; passed: boolean; error?: string }[] = [];

  for (const column of columnsToTest) {
    console.log(`\n📋 Testing sorting for column: ${column}`);
    
    try {
      const timeout = column === 'Status' ? 90000 : 60000;
      const result = await rooftopSorting.validateColumnSorting(column, testInfo, timeout);
      
      results.push({ column, passed: result.passed, error: result.error });
      if (!result.passed) {
        allTestsPassed = false;
        console.log(`❌ Sorting test failed for column: ${column}`);
        if (result.error) {
          console.log(`   Error Details: ${result.error}`);
        }
      } else {
        console.log(`✅ Sorting test passed for column: ${column}`);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.log(`❌ Error testing column ${column}: ${errorMessage}`);
      results.push({ column, passed: false, error: errorMessage });
      allTestsPassed = false;
    }
  }

  console.log(`\n${"=".repeat(60)}`);
  console.log(`SORTING TEST RESULTS SUMMARY (All Pages)`);
  console.log(`${"=".repeat(60)}`);
  
  for (const result of results) {
    const status = result.passed ? 'PASS ✅' : 'FAIL ❌';
    console.log(`${result.column.padEnd(20)} : ${status}`);
    if (!result.passed && result.error) {
      console.log(`   └─ Error: ${result.error}`);
    }
  }
  
  console.log(`${"=".repeat(60)}`);
  
  if (allTestsPassed) {
    console.log(`✅ ALL SORTING TESTS PASSED`);
  } else {
    console.log(`❌ SOME SORTING TESTS FAILED - This indicates a bug in the application sorting`);
    console.log(`\n📋 Detailed Failure Report:`);
    for (const result of results) {
      if (!result.passed) {
        console.log(`\n🔴 ${result.column}:`);
        console.log(`   ${result.error}`);
      }
    }
  }
  console.log(`${"=".repeat(60)}`);

  // Add detailed annotations for the HTML report
  testInfo.annotations.push({
    type: 'Sorting Test Result',
    description: allTestsPassed 
      ? 'All sorting tests passed successfully' 
      : `${results.filter(r => !r.passed).length} sorting test(s) failed`
  });

  for (const result of results) {
    if (!result.passed) {
      testInfo.annotations.push({
        type: `Failed Column: ${result.column}`,
        description: result.error || 'Sorting not working correctly across pages'
      });
    }
  }
});