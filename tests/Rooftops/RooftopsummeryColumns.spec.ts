import { test, expect } from '@playwright/test';
import { Login } from '../../pages/Login/Loginpage';
import { LeftsideNavigation } from '../../pages/Navigations/LeftSideNavigation';
import { RooftopColumns } from '../../pages/Rooftops/RooftopColumns';
import { logAndValidate } from '../../utils/reportUtil';

test("Verify Rooftop Column Headings", async ({ page }, testInfo) => {

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

  // Verify Rooftop columns
  const rooftopColumns = new RooftopColumns(page);
  const { expectedColumns, actualHeaders } = await rooftopColumns.verifyRooftopColumns();

  const allMatch = JSON.stringify(expectedColumns) === JSON.stringify(actualHeaders);

  // Report each column individually to HTML report
  for (let i = 0; i < expectedColumns.length; i++) {
    const expected = expectedColumns[i];
    const actual = actualHeaders[i] || 'MISSING';
    const isMatch = expected === actual;
    
    logAndValidate({
      step: `Column ${i + 1}: ${expected}`,
      expected: expected,
      actual: actual,
      isSummary: false
    }, testInfo);
  }

  // Report summary to HTML report
  logAndValidate({
    step: 'SUMMARY - Rooftop Column Headings',
    expected: expectedColumns.join(', '),
    actual: actualHeaders.join(', '),
    isSummary: true
  }, testInfo);

  // Console output (for terminal only)
  console.log(`\n${"=".repeat(50)}`);
  console.log(`SUMMARY - Rooftop Column Headings`);
  console.log(`${"=".repeat(50)}`);
  console.log(`Expected: ${expectedColumns.join(', ')}`);
  console.log(`Actual: ${actualHeaders.join(', ')}`);
  console.log(`Status: ${allMatch ? 'PASS ✅' : 'FAIL ❌'}`);
  console.log(`${"=".repeat(50)}`);

  // Assertion
  expect(actualHeaders, 'Column headers do not match expected').toEqual(expectedColumns);
});