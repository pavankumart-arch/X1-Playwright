
import { test } from '@playwright/test';

import { Login } from '../../../pages/Login/Loginpage';

import { LeftsideNavigation } from '../../../pages/Navigations/LeftSideNavigation';

import { NavGroupUnselectColumns } from '../../../pages/Systemconfig/NavGroup/NavGroupUnselectColumns';

test.describe(
  'Nav Group Column Visibility Verification',
  () => {

    test(
      'Verify column can be unselected (hidden) successfully',
      async ({ page }) => {

        const loginPage =
          new Login(page);

        const navigation =
          new LeftsideNavigation(page);

        // LOGIN
        await loginPage.navigateToURL();

        await loginPage.loginToApplication();

        // NAVIGATION
        await navigation.gotoSystemConfig();

        await navigation.gotoNavGroup();

        await page.waitForLoadState(
          'networkidle'
        );

       
        const navGroupColumns =
          new NavGroupUnselectColumns(page);

        // =========================================
        // COLUMN TO TEST
        // =========================================
        const columnName = 'Active';

        console.log(`\n=================================`);
        console.log(`NAV GROUP COLUMN UNSELECT TEST`);
        console.log(`=================================`);

        
         // HIDE COLUMN
        await navGroupColumns
          .hideColumn(columnName);

        // VERIFY HIDDEN
        await navGroupColumns
          .verifyColumnHidden(columnName);

        console.log(
          `\n✅ Column unselect test completed successfully`
        );
      }
    );
  }
);

