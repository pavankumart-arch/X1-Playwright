import { test } from '@playwright/test';

import { Login } from '../../../pages/Login/Loginpage';
import { LeftsideNavigation } from '../../../pages/Navigations/LeftSideNavigation';
import { UserRoleColumns } from '../../../pages/Systemconfig/UserRoles/UserRoleUnselectSelectColumns';

test.describe('User Role Column Visibility Verification', () => {

  test('Verify hidden column should not display in User Role UI', async ({ page }) => {

    const loginPage = new Login(page);

    const navigation = new LeftsideNavigation(page);

    const userRoleColumns = new UserRoleColumns(page);

    // =========================================
    // ✅ LOGIN
    // =========================================
    await loginPage.navigateToURL();

    await loginPage.loginToApplication();

    // =========================================
    // ✅ NAVIGATION
    // =========================================
    await navigation.gotoSystemConfig();

    await navigation.goToUserRoles();

    await page.waitForLoadState('networkidle');

    // =========================================
    // ✅ COLUMN TO HIDE
    // =========================================
    const columnName = 'Updated';

    // Verify column visible
    await userRoleColumns.verifyColumnVisible(columnName);

    // Hide column
    await userRoleColumns.hideColumn(columnName);

    // Verify hidden
    await userRoleColumns.verifyColumnHidden(columnName);

    console.log('✅ User Role Column visibility validation completed');
  });

});