import { test } from '@playwright/test';

import { Login } from '../../../pages/Login/Loginpage';

import { LeftsideNavigation } from '../../../pages/Navigations/LeftSideNavigation';
import { AddUserRole } from '../../../pages/Systemconfig/UserRoles/AddUserRole';
import userRoleData from '../../../testdata/Systemconfig/AddUserRole.json';

test(
    "Verify Add User Roles functionality",
    async ({ page }) => {

    const loginPage =
        new Login(page);

    const navigation =
        new LeftsideNavigation(page);

    const addUserRole =
        new AddUserRole(page);

    await loginPage.navigateToURL();

    await loginPage.loginToApplication();

    await navigation.gotoSystemConfig();

    await navigation.goToUserRoles();

    await navigation.clickAddRole();

    const data = userRoleData;

    await addUserRole.addUserRole(
        data.UserRole,
        
    );

    await addUserRole.validateCreatedUserRole(
        data.UserRole
    );
});