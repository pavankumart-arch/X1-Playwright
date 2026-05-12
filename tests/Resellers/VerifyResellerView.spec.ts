import { test, expect } from '@playwright/test';
import { Login } from '../../pages/Login/Loginpage';
import { LeftsideNavigation } from '../../pages/Navigations/LeftSideNavigation';
import { ViewReseller } from '../../pages/Resellers/View Reseller';

test('Verify Reseller Data from JSON', async ({ page }) => {

  const loginPage = new Login(page);
  const nav = new LeftsideNavigation(page);
  const viewReseller = new ViewReseller(page);

  await loginPage.navigateToURL();
  await loginPage.loginToApplication();

  await nav.goToDashboard();
  await nav.goToResellers();

  const results = await viewReseller.verifyResellerFromJson();

  for (const { step, expected, actual } of results) {
    const message = `🔍 ${step} → Expected: ${expected} | Actual: ${actual}`;
    console.log(message + (expected === actual ? ' | PASS ✅' : ' | FAIL ❌'));
    expect.soft(actual, message).toBe(expected);
  }

});
