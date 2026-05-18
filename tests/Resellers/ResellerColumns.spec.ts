import { test, TestInfo } from '@playwright/test';

import { Login } from '../../pages/Login/Loginpage';

import { LeftsideNavigation } from '../../pages/Navigations/LeftSideNavigation';

import { ResellerColumns } from '../../pages/Resellers/ResellerColumns';

test('Verify Reseller Columns', async ({ page }, testInfo: TestInfo) => {

  const loginPage = new Login(page);

  const leftsideNavigation = new LeftsideNavigation(page);

  const resellerColumns = new ResellerColumns(page);

  // =====================================
  // COLUMN VALIDATION HEADING
  // =====================================

  testInfo.annotations.push({
    type: 'COLUMN VALIDATION',

    description:
`
========================================
RESELLER COLUMN VALIDATION
========================================
`
  });

  // =====================================
  // STEP 1 : LOGIN
  // =====================================

  await test.step('Login to application', async () => {

    await loginPage.navigateToURL();

    await loginPage.loginToApplication();
  });

  // =====================================
  // STEP 2 : NAVIGATION
  // =====================================

  await test.step('Navigate to Resellers page', async () => {

    await leftsideNavigation.goToDashboard();

    await leftsideNavigation.goToResellers();

    await page.waitForSelector('table');
  });

  // =====================================
  // EXPECTED HEADERS
  // =====================================

  const expectedColumns = [
    'ID',
    'Name',
    'Description',
    'Created',
    'Status',
    'Actions'
  ];

  // =====================================
  // STEP 3 : VERIFY HEADERS
  // =====================================

  await test.step('Verify reseller table headers', async () => {

    await resellerColumns.verifyHeaders(
      expectedColumns,
      testInfo
    );
  });
});