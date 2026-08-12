import { test } from '@playwright/test';
import { Login } from '../../pages/Login/Loginpage';
import { LoginUI } from '../../pages/Login/LoginUI';
import { Reporter } from '../../pages/utils/NewReport';


test('Verify Login UI', async ({ page }, testInfo) => {

  Reporter.startTest();

  const loginPage = new Login(page);
  await loginPage.navigateToURL();
  const loginUI = new LoginUI(page);
  await loginUI.loginUI(testInfo);
  
  Reporter.endTest(testInfo);
});