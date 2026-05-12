import { test, Page } from '@playwright/test'
import { Login } from '../../pages/Login/Loginpage';
import { Homepage } from '../../pages/Homepage/Homepage';

test('Verify the Login functionality', async ({ page }) => {
     const loginPage = new Login(page);
     const homePage = new Homepage(page);
    await loginPage.navigateToURL();
    await loginPage.loginToApplication();
    await homePage.VerifytheEVSLogo();
    await homePage.VerifytheLogoutfunctionality();

});