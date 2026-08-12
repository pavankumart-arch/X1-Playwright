
import { test, expect } from '@playwright/test';
 
import { Login }
from '../../../pages/Login/Loginpage';
 
import { LeftsideNavigation }
from '../../../pages/Navigations/LeftSideNavigation';
 
import { AddUserRoleCancel }
from '../../../pages/Systemconfig/UserRoles/AddUserRoleCancel';
 
test(
  'Verify User Role Cancel Button Functionality',
  async ({ page }) => {
 
    const loginPage =
      new Login(page);
 
    const navigation =
      new LeftsideNavigation(page);
 
    await loginPage.navigateToURL();
 
    await loginPage.loginToApplication();
 
    await navigation.gotoSystemConfig();
 
    await navigation.goToUserRoles();
 
    await navigation.clickAddRole();
 
    const cancelPage =
      new AddUserRoleCancel(page);
 
    const result =
      await cancelPage.verifyUserRoleCancelButton();
 
    expect(
      result,
      'Cancel button should navigate back to User Roles page'
    ).toBeTruthy();
  }
);