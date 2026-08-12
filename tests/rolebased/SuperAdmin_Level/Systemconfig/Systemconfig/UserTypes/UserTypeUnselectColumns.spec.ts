import { test } from '@playwright/test';

import { Login } from '../../../pages/Login/Loginpage';
import { LeftsideNavigation } from '../../../pages/Navigations/LeftSideNavigation';
import { UserTypeColumns } from '../../../pages/Systemconfig/UserTypes/UserTypeUnselectColumns';

test.describe('User Type Column Visibility Verification', () => {

  test('Verify column can be unselected (hidden) successfully', async ({ page }) => {

    const loginPage = new Login(page);
    const navigation = new LeftsideNavigation(page);

    await loginPage.navigateToURL();
    await loginPage.loginToApplication();

    await navigation.gotoSystemConfig();
    await navigation.gotoAddUserType();

    await page.waitForLoadState('networkidle');

    // If your UI needs explicit clicks, keep it (safe fallback)
   

    await page.waitForLoadState('networkidle');

    const userTypeColumns = new UserTypeColumns(page);

    // =========================================
    // COLUMN TO TEST
    // =========================================
    const columnName = 'Status'; // change if needed

    console.log(`\n=================================`);
    console.log(`USER TYPE COLUMN UNSELECT TEST`);
    console.log(`=================================`);

    // VERIFY INITIALLY VISIBLE
    await userTypeColumns.verifyColumnVisible(columnName);

    // HIDE COLUMN
    await userTypeColumns.hideColumn(columnName);

    // VERIFY HIDDEN
    await userTypeColumns.verifyColumnHidden(columnName);

    console.log(`\n✅ Column unselect test completed successfully`);
  });

});