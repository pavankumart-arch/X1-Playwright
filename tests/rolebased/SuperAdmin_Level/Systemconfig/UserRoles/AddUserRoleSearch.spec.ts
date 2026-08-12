import { test, TestInfo } from '@playwright/test';

import { Login } from '../../../pages/Login/Loginpage';
import { LeftsideNavigation } from '../../../pages/Navigations/LeftSideNavigation';
import { UserRoleSearch } from '../../../pages/Systemconfig/UserRoles/UserRoleSearch';

test(
  'Verify User Role Search Functionality',
  async ({ page }, testInfo: TestInfo) => {

    test.setTimeout(120000);

    const loginPage = new Login(page);

    await loginPage.navigateToURL();
    await loginPage.loginToApplication();

    const navigation = new LeftsideNavigation(page);

    await navigation.gotoSystemConfig();
    await navigation.goToUserRoles();

    await page.waitForLoadState('networkidle');

    const userRoleSearch =
      new UserRoleSearch(page, testInfo);

    console.log('\n============================================================');
    console.log('RUNNING USER ROLE SEARCH TESTS');
    console.log('============================================================');

    // ONLY SUPPORTED SEARCHES
    await userRoleSearch.searchByID();

    await userRoleSearch.searchByRoleName();

    await userRoleSearch.invalidSearch();

    await userRoleSearch.searchByNonExistentRole();

    console.log('\n============================================================');
    console.log('FINAL SUMMARY - USER ROLE SEARCH TESTS');
    console.log('============================================================');

    console.log('ID Search                : PASS ✅');
    console.log('Role Name Search         : PASS ✅');
    console.log('Invalid Search           : PASS ✅');
    console.log('Non-existent Role Search : PASS ✅');

    console.log('============================================================');
    console.log('✅ ALL USER ROLE SEARCH TESTS PASSED');
    console.log('============================================================');
  }
);