import { test } from '@playwright/test';
import { Login } from '../../pages/Login/Loginpage';
import { LeftsideNavigation } from '../../pages/Navigations/LeftSideNavigation';
import { UpdatedReseller } from '../../pages/Resellers/VerifyUpdatedReseller';

test('Verify the Update Reseller functionality', async ({ page }) => {

  const loginPage = new Login(page);
  const leftsideNavigation = new LeftsideNavigation(page);
  const updatedReseller = new UpdatedReseller(page);

  await loginPage.navigateToURL();
  await loginPage.loginToApplication();
  await page.waitForLoadState('networkidle');

  await leftsideNavigation.goToDashboard();
  await leftsideNavigation.goToResellers();

  await page.locator('table tbody tr').first().waitFor({ state: 'visible' });

  await updatedReseller.UpdateResellerView();
  await updatedReseller.VerifyResellerDetails();

});
