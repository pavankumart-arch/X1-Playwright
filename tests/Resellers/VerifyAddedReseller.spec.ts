import { test } from '@playwright/test';
import { Login } from '../../pages/Login/Loginpage';
import { LeftsideNavigation } from '../../pages/Navigations/LeftSideNavigation';
import { AddReseller } from '../../pages/Resellers/AddReseller';
import { ViewReseller } from '../../pages/Resellers/View Reseller';
import AddResellerdata from '../../testdata/AddResellerData.json';

test('Verify Add + View Reseller flow', async ({ page }, testInfo) => {

  test.setTimeout(120000);

  const loginPage = new Login(page);
  const nav = new LeftsideNavigation(page);
  const addReseller = new AddReseller(page);
  const viewReseller = new ViewReseller(page, testInfo);

  await loginPage.navigateToURL();
  await loginPage.loginToApplication();

  await nav.goToDashboard();
  await nav.goToResellers();

  const createdName = await addReseller.AddReseller(testInfo);

  if (!createdName) {
    throw new Error('❌ Created reseller name not found');
  }

  console.log('✅ Created Reseller:', createdName);

  await page.waitForTimeout(2000);

  // 🔥 IMPORTANT: Open the details modal FIRST
  await viewReseller.openResellerDetails(createdName);

  // Build expected data object
  const expectedData = {
    Name: createdName,
    Description: AddResellerdata.Description,
    BillingName: AddResellerdata.BillingName,
    SalesPerson: AddResellerdata.SalesPerson,
    TTOptions: AddResellerdata.TTOptions,
    AppID: AddResellerdata.AppID,
    PlayerSize: AddResellerdata.PlayerSize,
    ShowControls: false,
    ShowMap: false,
    ShowRelated: false,
    ShowForm: false,
    AutoPlay: false,
    ShowSharing: false,
    ShowCC: false,
    Active: true,
  };

  const validationPassed = await viewReseller.verifyResellerFromJson(expectedData, testInfo);

  if (!validationPassed) {
    throw new Error('❌ Reseller validation failed - some fields did not match');
  }

  console.log('\n✅ Test completed successfully');
});