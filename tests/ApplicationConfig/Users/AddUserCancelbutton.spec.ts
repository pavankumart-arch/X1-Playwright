import { test } from '@playwright/test';
import { Login } from '../../../pages/Login/Loginpage';
import { LeftsideNavigation } from '../../../pages/Navigations/LeftSideNavigation';
import { VerifyUserCancelButton } from '../../../pages/ApplicationConfig/Users/AddUserCancelbutton';

test.describe('User Cancel Button Validation', () => {
  test('Verify Cancel button closes the Add User form', async ({ page }, testInfo) => {
    const login = new Login(page);
    const navigation = new LeftsideNavigation(page);
    const cancelTest = new VerifyUserCancelButton(page);

    // LOGIN
     ;
    await login.navigateToURL();
    await login.loginToApplication();

    // NAVIGATE TO USERS
    await navigation.gotoApplicationConfig();
    await navigation.goToUsers();

    // VERIFY CANCEL BUTTON
    await cancelTest.verifyUserCancelButton(testInfo);
  });
});