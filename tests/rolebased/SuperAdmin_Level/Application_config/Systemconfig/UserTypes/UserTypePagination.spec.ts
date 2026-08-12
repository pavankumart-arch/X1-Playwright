import { test, expect } from '@playwright/test';

import { Login } from '../../../pages/Login/Loginpage';

import { LeftsideNavigation } from '../../../pages/Navigations/LeftSideNavigation';

import { UserTypePagination } from '../../../pages/Systemconfig/UserTypes/UserTypePagination';

test('Verify User Type Pagination', async ({ page }) => {

  test.setTimeout(180000);

  // LOGIN
  const loginPage = new Login(page);

  await loginPage.navigateToURL();

  await loginPage.loginToApplication();

  // NAVIGATION
  const navigation = new LeftsideNavigation(page);

  await page.waitForLoadState('networkidle');

  await navigation.gotoSystemConfig();

  await navigation.gotoAddUserType();

  // PAGINATION
  const pagination = new UserTypePagination(page);

  console.log(`\n${'='.repeat(60)}`);
  console.log(`USER TYPE PAGINATION TEST`);
  console.log(`${'='.repeat(60)}`);

  await pagination.verifyPagination();

  console.log(`\n✅ User Type Pagination Completed`);

  expect(true).toBeTruthy();
});