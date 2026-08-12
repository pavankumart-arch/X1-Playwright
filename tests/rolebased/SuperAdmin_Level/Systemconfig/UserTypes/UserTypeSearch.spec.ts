import { test, expect } from '@playwright/test';

import { Login } from '../../../pages/Login/Loginpage';
import { LeftsideNavigation } from '../../../pages/Navigations/LeftSideNavigation';
import { UserTypeSearch } from '../../../pages/Systemconfig/UserTypes/UserTypeSearch';

test(
  'Verify User Type Search',
  async ({ page }) => {

    const loginPage = new Login(page);
    const navigation = new LeftsideNavigation(page);

    await loginPage.navigateToURL();
    await loginPage.loginToApplication();

    await navigation.gotoSystemConfig();
    await navigation.gotoAddUserType();

    const userTypeSearch =
      new UserTypeSearch(page);

    const result =
      await userTypeSearch.verifyUserTypeSearch();

    expect(
      result,
      'First User Type should be searchable'
    ).toBeTruthy();
  }
);