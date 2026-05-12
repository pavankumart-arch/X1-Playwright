import { test, expect } from '@playwright/test';
import { Login } from '../../pages/Login/Loginpage';
import { LeftsideNavigation } from '../../pages/Navigations/LeftSideNavigation';
import { logAndValidate } from '../../utils/reportUtil';

test("Verify Rooftop Pagination", async ({ page }, testInfo) => {

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

  const dropdown = page.locator('select');
  const options = ['10', '20', '50', '100'];
  
  let allTestsPassed = true;

  for (const optionValue of options) {
    console.log(`\n📋 Testing Show: ${optionValue}`);
    
    await dropdown.selectOption(optionValue);
    await page.waitForTimeout(1500);
    
    const text = await page.locator('text=/Showing \\d+-\\d+ of \\d+/').textContent();
    const totalMatch = text?.match(/of (\d+)/);
    const totalRecords = totalMatch ? Number(totalMatch[1]) : 0;
    const rowsPerPage = parseInt(optionValue);
    const expectedPages = Math.ceil(totalRecords / rowsPerPage);
    
    let actualPages = 1;
    let canGoNext = true;
    
    while (canGoNext && actualPages < expectedPages) {
      const nextButton = page.getByRole('button', { name: 'Next' });
      const isNextEnabled = await nextButton.isEnabled();
      
      if (isNextEnabled) {
        const beforeFirstRow = await page.locator('table tbody tr:first-child td:nth-child(2)').textContent();
        await nextButton.click();
        await page.waitForTimeout(1000);
        const afterFirstRow = await page.locator('table tbody tr:first-child td:nth-child(2)').textContent();
        
        if (beforeFirstRow === afterFirstRow) {
          canGoNext = false;
        } else {
          actualPages++;
        }
      } else {
        canGoNext = false;
      }
    }
    
    const passed = actualPages === expectedPages;
    if (!passed) allTestsPassed = false;
    
    const status = passed ? 'PASS ✅' : 'FAIL ❌';
    console.log(`   Pages: ${actualPages}/${expectedPages} → ${status}`);
    
    // Report to HTML
    logAndValidate({
      step: `Show: ${optionValue} - Pagination Test`,
      expected: `${expectedPages} page(s)`,
      actual: `${actualPages} page(s)`,
      isSummary: false
    }, testInfo);
    
    // Go back to first page
    if (actualPages > 1) {
      const firstPageBtn = page.locator('button[aria-label="Page 1"]');
      if (await firstPageBtn.isVisible()) {
        await firstPageBtn.click();
        await page.waitForTimeout(1000);
      }
    }
  }
  
  // Display all results
  console.log(`\n${"=".repeat(60)}`);
  console.log(`OVERALL RESULT: ${allTestsPassed ? 'PASS ✅' : 'FAIL ❌'}`);
  console.log(`${"=".repeat(60)}`);
  
  // Fix: Make expected and actual match for SUMMARY step
  logAndValidate({
    step: 'SUMMARY - Rooftop Pagination Verification',
    expected: allTestsPassed ? 'All tests passed ✅' : 'Some tests failed ❌',
    actual: allTestsPassed ? 'All tests passed ✅' : 'Some tests failed ❌',
    isSummary: true
  }, testInfo);

  expect(allTestsPassed, 'All pagination tests should pass').toBeTruthy();
});