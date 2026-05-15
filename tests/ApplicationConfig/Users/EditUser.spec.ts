import { test } from '@playwright/test';
import { Login } from '../../../pages/Login/Loginpage';
import { LeftsideNavigation } from '../../../pages/Navigations/LeftSideNavigation';
import { EditUser } from '../../../pages/ApplicationConfig/Users/EditUser';

test.describe('Verify the Edit User functionality', () => {
  test('Verify that the edited user appears in the summary table', async ({ page }, testInfo) => {
    const login = new Login(page);
    const navigation = new LeftsideNavigation(page);
    const edituser=new EditUser(page);
    // LOGIN
    await login.navigateToURL();
    await login.loginToApplication();

    // NAVIGATE TO USERS
    await navigation.gotoApplicationConfig();
    await navigation.goToUsers();

    //Edit USER
    await edituser.editUser();
    await edituser.verifyEditedUserIsDisplayed(testInfo);

  });
});