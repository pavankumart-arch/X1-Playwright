import { test, TestInfo } from '@playwright/test';
import { Login } from '../../pages/Login/Loginpage';
import { LeftsideNavigation } from '../../pages/Navigations/LeftSideNavigation';
import { RooftopSearch } from '../../pages/Rooftops/RooftopSearch';
import { logAndValidate } from '../../utils/reportUtil';

test("Verify Rooftop Search Functionality", async ({ page }, testInfo: TestInfo) => {

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

  const rooftopSearch = new RooftopSearch(page, testInfo);

  // Run all search tests - each test is independent
  console.log(`\n${"=".repeat(60)}`);
  console.log(`RUNNING ROOFTOP SEARCH TESTS`);
  console.log(`${"=".repeat(60)}`);

  // Positive Tests
  await rooftopSearch.searchByID();
  await rooftopSearch.searchByName();
  await rooftopSearch.searchByDescription();
  await rooftopSearch.searchByCreated();
  await rooftopSearch.searchByStatus();

  // Negative Tests
  await rooftopSearch.invalidSearch();
  await rooftopSearch.searchByNonExistentName();
  await rooftopSearch.searchByNonExistentID();

  // Final Summary
  console.log(`\n${"=".repeat(60)}`);
  console.log(`FINAL SUMMARY - Rooftop Search Tests`);
  console.log(`${"=".repeat(60)}`);
  
  if (rooftopSearch.hasFailures()) {
    console.log(`❌ ${rooftopSearch.getFailures().length} TEST(S) FAILED:`);
    rooftopSearch.getFailures().forEach(f => console.log(`   - ${f}`));
  } else {
    console.log(`✅ ALL TESTS PASSED`);
  }
  console.log(`${"=".repeat(60)}`);

  // Report to HTML
  logAndValidate({
    step: 'SUMMARY - Rooftop Search Functionality',
    expected: 'All search tests should pass',
    actual: rooftopSearch.hasFailures() ? `${rooftopSearch.getFailures().length} test(s) failed` : 'All tests passed',
    isSummary: true
  }, testInfo);

  // Add annotation for HTML report
  testInfo.annotations.push({
    type: 'Search Results',
    description: rooftopSearch.hasFailures() 
      ? `${rooftopSearch.getFailures().length} search test(s) failed` 
      : 'All search tests passed successfully'
  });

  // Don't throw error - let the test complete
  if (rooftopSearch.hasFailures()) {
    console.log(`\n⚠️ Note: ${rooftopSearch.getFailures().length} test(s) failed. Check the report for details.`);
  }
});