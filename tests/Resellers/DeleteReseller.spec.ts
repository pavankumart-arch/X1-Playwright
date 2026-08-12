import { test, expect } from '@playwright/test';
import { Login } from '../../pages/Login/Loginpage';
import { LeftsideNavigation } from '../../pages/Navigations/LeftSideNavigation';
import { AddReseller } from '../../pages/Resellers/AddReseller';
import { DeleteReseller } from '../../pages/Resellers/DeleteReseller';

test('Add and Delete Reseller', async ({ page }, testInfo) => {

  const loginPage = new Login(page);
  const leftsideNavigation = new LeftsideNavigation(page);
  const addResellerPage = new AddReseller(page);
  const deleteResellerPage = new DeleteReseller(page);

  // Login and navigate
  await loginPage.navigateToURL();
  await loginPage.loginToApplication();
  await leftsideNavigation.goToDashboard();
  await leftsideNavigation.goToResellers();

  // Add reseller
  const createdName = await addResellerPage.AddReseller(testInfo);
  console.log(`✅ Created: ${createdName}`);

  // Delete reseller
  const deleteResult = await deleteResellerPage.deleteResellerAndVerify(createdName, testInfo);
  
  // Verify
  expect(deleteResult.success, deleteResult.message).toBe(true);
  console.log(`✅ Deleted: ${createdName}`);
});