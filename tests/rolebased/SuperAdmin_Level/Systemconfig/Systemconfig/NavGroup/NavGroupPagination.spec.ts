import { test, expect } from '@playwright/test';

import { Login } from '../../../pages/Login/Loginpage';
import { LeftsideNavigation } from '../../../pages/Navigations/LeftSideNavigation';

import { NavGroupPagination } from '../../../pages/Systemconfig/NavGroup/NavGroupPagination';

test('Nav Group Pagination Validation', async ({ page }) => {

  // login
  const login = new Login(page);

  await login.navigateToURL();
  await login.loginToApplication();

  // navigation
  const navigation = new LeftsideNavigation(page);

  await navigation.goToDashboard();

  console.log('👉 Navigating to Nav Group');

  await navigation.gotoSystemConfig();
  await navigation.gotoNavGroup();

  console.log('✅ Navigated to Nav Group page');

  // pagination validation
  const pagination =
    new NavGroupPagination(page);

  const result =
    await pagination.validatePagination();

  // final assertion
  expect(result).toBeTruthy();
});