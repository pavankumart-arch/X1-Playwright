import { test, expect } from '@playwright/test';
import { Login } from '../../pages/Login/Loginpage';
import { LeftsideNavigation } from '../../pages/Navigations/LeftSideNavigation';
import { RooftopShow } from '../../pages/Rooftops/RooftopShow';

test('Show up for Rooftops', async ({ page }, testInfo) => {
  const loginPage = new Login(page);
  const navigation = new LeftsideNavigation(page);
  
  await loginPage.navigateToURL();
  await loginPage.loginToApplication();
  await page.waitForLoadState('networkidle');
  
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
  
  await navigation.goToListofRooftops();
  await page.waitForLoadState('networkidle');
  
  test.setTimeout(180000);
  
  const rooftopShow = new RooftopShow(page);
  const result = await rooftopShow.testAllShowOptions(navigation, testInfo);
  
  expect(result.success).toBeTruthy();
});