import { test, expect } from '@playwright/test';

import { Login } from '../../../pages/Login/Loginpage';
import { LeftsideNavigation } from '../../../pages/Navigations/LeftSideNavigation';
import { UserRoleSearch } from '../../../pages/Systemconfig/UserRoles/UserRoleSearch';
import { Reporter } from '../../../pages/utils/NewReport';

test('Verify User Role Search Functionality', async ({ page }, testInfo) => {

  // ==========================
  // REPORT START
  // ==========================
  Reporter.startTest();

  test.setTimeout(180000);

  // ==========================
  // LOGIN
  // ==========================
  const loginPage = new Login(page);

  await loginPage.navigateToURL();
  await loginPage.loginToApplication();

  await page.waitForLoadState('networkidle');

  // ==========================
  // NAVIGATION
  // ==========================
  const navigation = new LeftsideNavigation(page);

  await navigation.gotoSystemConfig();
  await navigation.goToUserRoles();

  await page.waitForLoadState('networkidle');

  console.log(`Current URL: ${page.url()}`);

  // ==========================
  // SEARCH TESTS
  // ==========================
  const search = new UserRoleSearch(page, testInfo);

  // ID Search
  await search.searchByID();

  // Role Name Search
  await search.searchByRoleName();

  // Created Date Search
  await search.searchByCreatedDate();

  // Updated Date Search
  await search.searchByUpdatedDate();

  // Status Search
  await search.searchByStatus();

  // Invalid Search
  await search.invalidSearch();

  // Non-existent Role Search
  await search.searchByNonExistentRole();

  // ==========================
  // FINAL VALIDATION
  // ==========================
  const hasFailures = search.hasFailures();

  Reporter.validateData(
    false,
    hasFailures,
    'User Role Search Validation',
    testInfo
  );

  console.log('\n' + '='.repeat(60));
  console.log(`FINAL RESULT : ${hasFailures ? 'FAIL ❌' : 'PASS ✅'}`);
  console.log('='.repeat(60));

  expect(hasFailures, 'User Role search validation failed').toBeFalsy();

  // ==========================
  // REPORT END
  // ==========================
  Reporter.endTest(testInfo);
});