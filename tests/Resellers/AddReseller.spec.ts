import { test } from '@playwright/test';
import { Login } from '../../pages/Login/Loginpage';
import { LeftsideNavigation } from '../../pages/Navigations/LeftSideNavigation';
import { AddReseller } from '../../pages/Resellers/AddReseller';

test('Verify the Add Reseller functionality', async ({ page }, testInfo) => {
  const loginPage = new Login(page);
  const navigation = new LeftsideNavigation(page);
  const addReseller = new AddReseller(page);

  await loginPage.navigateToURL();
  await loginPage.loginToApplication();
  await page.waitForLoadState('networkidle');

  await navigation.goToDashboard();
  await page.waitForLoadState('networkidle');
  await navigation.goToResellers();
  await page.waitForLoadState('networkidle');

  await addReseller.AddReseller(testInfo);
});