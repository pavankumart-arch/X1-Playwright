import { test } from '@playwright/test';

import { Login }
from '../../../pages/Login/Loginpage';

import { LeftsideNavigation }
from '../../../pages/Navigations/LeftSideNavigation';

import { EditUserRole }
from '../../../pages/Systemconfig/UserRoles/EditUserRole';

test(
    'Verify user can edit existing User Role successfully',
    async ({ page }) => {

        const loginPage =
            new Login(page);

        const navigation =
            new LeftsideNavigation(page);

        const editUserRole =
            new EditUserRole(page);

        // Navigate to application
        await loginPage.navigateToURL();

        // Login
        await loginPage.loginToApplication();

        // Navigate to System Config
        await navigation.gotoSystemConfig();

        // Navigate to User Roles
        await navigation.goToUserRoles();

        // Existing User Role
        const existingUserRole =
            'Reseller Admin';

        // Updated User Role
        const updatedUserRole =
            'Updated Reseller Admin';

        // Edit existing User Role
        await editUserRole.EditUserRole(
            existingUserRole,
            updatedUserRole
        );

    }
);