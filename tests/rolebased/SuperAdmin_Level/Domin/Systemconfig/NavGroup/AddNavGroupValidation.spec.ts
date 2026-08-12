import { test, expect } from '@playwright/test';

import { Login } from '../../../pages/Login/Loginpage';

import { LeftsideNavigation } from '../../../pages/Navigations/LeftSideNavigation';

import { ValidateAddNavGroupForm } from '../../../pages/Systemconfig/NavGroup/AddNavGroupValidation';

test('Validate Add Nav Group Form', async ({ page }, testInfo) => {

  test.setTimeout(180000);

  // Login
  const loginPage = new Login(page);

  await loginPage.navigateToURL();

  await loginPage.loginToApplication();

  // Navigation
  const navigation = new LeftsideNavigation(page);

  await navigation.gotoSystemConfig();

  await navigation.gotoNavGroup();

  await page.waitForLoadState('networkidle');

  // Validation Page
  const validateForm = new ValidateAddNavGroupForm(page, testInfo);

  // Run validation
  const isValid = await validateForm.validateAddNavGroupForm();

  console.log('\n' + '='.repeat(60));

  console.log(`FINAL RESULT : ${isValid ? 'PASS ✅' : 'FAIL ❌'}`);

  console.log('='.repeat(60));

  // Annotation
  testInfo.annotations.push({
    type: 'Final Result',
    description: isValid
      ? 'Add Nav Group Validation Passed'
      : 'Add Nav Group Validation Failed'
  });

  // Assertion
  expect(isValid).toBeTruthy();
});