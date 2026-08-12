import { test } from '@playwright/test';
import { Login } from '../../../pages/Login/Loginpage';
import { LeftsideNavigation } from '../../../pages/Navigations/LeftSideNavigation';
import { UsersPagination } from '../../../pages/ApplicationConfig/Users/Pagination';

test.describe('Users Pagination Validation', () => {
  test('Verify Users Pagination', async ({ page }, testInfo) => {
    const login = new Login(page);
    const navigation = new LeftsideNavigation(page);
    const usersPagination = new UsersPagination(page);

    await login.navigateToURL();
    await login.loginToApplication();

    await navigation.gotoApplicationConfig();
    await navigation.goToUsers();

    await usersPagination.verifyUsersPagination(testInfo);
  });
});