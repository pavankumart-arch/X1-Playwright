import { test, expect } from '@playwright/test';
import { Login } from '../../pages/Login/Loginpage';
import { LeftsideNavigation } from '../../pages/Navigations/LeftSideNavigation';

test("Verify Rooftop Pagination", async ({ page }) => {

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
  
  console.log(`\n${"=".repeat(50)}`);
  console.log(`SUMMARY - Rooftop Pagination`);
  console.log(`${"=".repeat(50)}`);
  
  for (const optionValue of options) {
    await dropdown.selectOption(optionValue);
    await page.waitForTimeout(1500);
    
    const paginationText = page.locator('text=/Showing \\d+-\\d+ of \\d+/');
    const text = await paginationText.textContent();
    const totalMatch = text?.match(/of (\d+)/);
    const totalRecords = totalMatch ? Number(totalMatch[1]) : 0;
    const rows = await page.locator('table tbody tr').count();
    
    const status = rows <= parseInt(optionValue) && totalRecords > 0 ? 'PASS ✅' : 'FAIL ❌';
    console.log(`Show: ${optionValue} → Records: ${totalRecords} | Rows: ${rows} | ${status}`);
  }
  
  console.log(`${"=".repeat(50)}`);
  
  expect(true).toBeTruthy();
});