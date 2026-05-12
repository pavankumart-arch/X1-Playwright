import { test } from '@playwright/test';
import { Login } from '../../pages/Login/Loginpage';
import { LeftsideNavigation } from '../../pages/Navigations/LeftSideNavigation';
import { ResellerValidation } from '../../pages/Resellers/AddResellerValidation';


test.setTimeout(60000); // Extend timeout for slower environments

test('Verify the Reseller Validation functionality', async ({ page }, testInfo) => {
  const loginPage = new Login(page);
  const navigation = new LeftsideNavigation(page);
  const resellerValidation = new ResellerValidation(page);

  await loginPage.navigateToURL();
  await loginPage.loginToApplication();
  await navigation.goToDashboard();
  await page.waitForLoadState('networkidle');
  await navigation.goToResellers();
  await page.waitForLoadState('networkidle');

  // Run all validations
  await resellerValidation.validateResellerForm(testInfo);
});