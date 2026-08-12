import { test, expect, TestInfo } from '@playwright/test';
import { Login } from '../../../pages/Login/Loginpage';
import { LeftsideNavigation } from '../../../pages/Navigations/LeftSideNavigation';
import { AddNavGroup } from '../../../pages/Systemconfig/NavGroup/AddNavGroup';
import { logAndValidate } from '../../../utils/reportUtil';

test('Add New Nav Group', async ({ page }, testInfo: TestInfo) => {

  test.setTimeout(180000);

  // =========================
  // LOGIN
  // =========================
  const loginPage = new Login(page);

  await loginPage.navigateToURL();

  await loginPage.loginToApplication();

  // =========================
  // NAVIGATION
  // =========================
  const navigation = new LeftsideNavigation(page);

  console.log('👉 Navigating to Nav Group');

  await navigation.gotoSystemConfig();

  await navigation.gotoNavGroup();

  await page.waitForLoadState('networkidle');

  console.log('✅ Navigated to Nav Group page');

  // =========================
  // CREATE NAV GROUP
  // =========================
  const addNavGroup = new AddNavGroup(page);

  const navGroupName = `NavGroup_${Date.now()}`;

  console.log(`\n${'='.repeat(40)}`);
  console.log('ADD NAV GROUP TEST');
  console.log(`${'='.repeat(40)}`);

  const createdName = await addNavGroup.addNavGroup(navGroupName);

  // =========================
  // WAIT AFTER SAVE
  // =========================
  await page.waitForTimeout(3000);

  await page.reload();

  await page.waitForLoadState('networkidle');

  await page.waitForTimeout(2000);

  // =========================
  // SEARCH NAV GROUP
  // =========================
  const searchedName = await addNavGroup.searchNavGroup(createdName);

  // =========================
  // REPORT
  // =========================
  logAndValidate({
    step: 'Add Nav Group Status',
    expected: createdName,
    actual: searchedName
  }, testInfo);

  // =========================
  // FINAL RESULT
  // =========================
  console.log(`\n${'='.repeat(50)}`);
  console.log('FINAL RESULT');
  console.log(`${'='.repeat(50)}`);

  console.log(
    `Add Nav Group : ${
      searchedName ? '✅ PASSED' : '❌ FAILED'
    }`
  );

  // =========================
  // TEST ANNOTATION
  // =========================
  testInfo.annotations.push({
    type: 'Add Nav Group',
    description: searchedName
      ? 'Nav Group created successfully'
      : 'Nav Group creation failed'
  });

  // =========================
  // ASSERTION
  // =========================
  expect(
    searchedName,
    'Nav Group should be created successfully'
  ).toBe(createdName);

});