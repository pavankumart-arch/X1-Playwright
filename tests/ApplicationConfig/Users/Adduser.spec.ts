import { test } from '@playwright/test';
import { Login } from '../../../pages/Login/Loginpage';
import { LeftsideNavigation } from '../../../pages/Navigations/LeftSideNavigation';
import { AddUser } from '../../../pages/ApplicationConfig/Users/AddUser';


test.describe('Verify the Add User functionality', () => {
  test('Verify that the added user appears in the summary table', async ({ page }, testInfo) => {
    const login = new Login(page);
    const navigation = new LeftsideNavigation(page);
    const adduser=new AddUser(page);

    // LOGIN
    await login.navigateToURL();
    await login.loginToApplication();

    // NAVIGATE TO USERS
    await navigation.gotoApplicationConfig();
    await navigation.goToUsers();

    // ADD USER
    await adduser.addUser();
    await adduser.verifyAddedUserIsDisplayed(testInfo);
  });
});