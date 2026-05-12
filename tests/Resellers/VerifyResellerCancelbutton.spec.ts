import { test, Page, TestInfo } from '@playwright/test';
import { Login } from '../../pages/Login/Loginpage';
import { LeftsideNavigation } from '../../pages/Navigations/LeftSideNavigation';
import { VerifyCancelbutton } from '../../pages/Resellers/ResellerCancelbutton';

test('Verify Reseller Cancel Button', async ({ page }, testInfo: TestInfo) => {
  const loginPage = new Login(page);
  const leftsideNavigation = new LeftsideNavigation(page);
  const verifyCancelbutton = new VerifyCancelbutton(page);

  await loginPage.navigateToURL();
  await loginPage.loginToApplication();
  await page.waitForTimeout(2000);
  await leftsideNavigation.goToDashboard();
  await leftsideNavigation.goToResellers();
  await page.waitForTimeout(2000);
  await verifyCancelbutton.VerifyResellerCancelbutton(testInfo);
});