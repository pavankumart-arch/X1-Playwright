import { test, expect } from '@playwright/test';

import { Login }
from '../../../pages/Login/Loginpage';

import { LeftsideNavigation }
from '../../../pages/Navigations/LeftSideNavigation';

import { UserRoleCRUD }
from '../../../pages/Systemconfig/UserRoles/UserRoleDelete';

import { Reporter }
from '../../../pages/utils/NewReport';

test(
  'Delete User Role',
  async ({ page }, testInfo) => {

    Reporter.startTest();

    let deleteStatus = false;

    try {

      const login =
        new Login(page);

      await login.navigateToURL();

      await login.loginToApplication();

      const navigation =
        new LeftsideNavigation(page);

      await navigation.gotoSystemConfig();

      await navigation.goToUserRoles();

      await page.waitForLoadState(
        'networkidle'
      );

      const userRole =
        new UserRoleCRUD(page);

      const roleName =
        'Role_To_Delete';

      await userRole.searchUserRole(
        roleName
      );

      await userRole.deleteUserRole(
        roleName
      );

      deleteStatus = true;

    } catch (error) {

      console.log(
        `❌ Delete User Role Failed: ${error}`
      );

      deleteStatus = false;
    }

    Reporter.validateDelete(
      'Role_To_Delete',
      deleteStatus,
      testInfo
    );

    Reporter.endTest(
      testInfo
    );

    expect(
      deleteStatus
    ).toBeTruthy();
  }
);