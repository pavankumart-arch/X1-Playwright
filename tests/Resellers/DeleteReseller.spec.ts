import { test, expect } from '@playwright/test';
import { Login } from '../../pages/Login/Loginpage';
import { LeftsideNavigation } from '../../pages/Navigations/LeftSideNavigation';
import { AddReseller } from '../../pages/Resellers/AddReseller';
import { DeleteReseller } from '../../pages/Resellers/DeleteReseller';
import { logAndValidate } from '../../utils/reportUtil';

test('Add Reseller → Search → Delete → Verify Deletion', async ({ page }, testInfo) => {

  const loginPage = new Login(page);
  const leftsideNavigation = new LeftsideNavigation(page);
  const addResellerPage = new AddReseller(page);
  const deleteResellerPage = new DeleteReseller(page);

  console.log('\n========== TEST START: Add and Delete Reseller ==========\n');

  // 🔐 Step 1: Login
  console.log('📍 Step 1: Login to Application');
  try {
    await loginPage.navigateToURL();
    await loginPage.loginToApplication();
    await page.waitForTimeout(2000);
    
    logAndValidate({
      step: 'Login to Application',
      expected: 'Success',
      actual: 'Success'
    }, testInfo);
  } catch (error) {
    logAndValidate({
      step: 'Login to Application',
      expected: 'Success',
      actual: `Failed - ${error}`
    }, testInfo);
  }

  // 🧭 Step 2: Navigate to Resellers
  console.log('📍 Step 2: Navigate to Resellers');
  try {
    await leftsideNavigation.goToDashboard();
    await leftsideNavigation.goToResellers();
    await page.waitForTimeout(2000);
    
    logAndValidate({
      step: 'Navigate to Resellers',
      expected: 'Success',
      actual: 'Success'
    }, testInfo);
  } catch (error) {
    logAndValidate({
      step: 'Navigate to Resellers',
      expected: 'Success',
      actual: `Failed - ${error}`
    }, testInfo);
  }

  // ➕ Step 3: Add New Reseller
  console.log('📍 Step 3: Add New Reseller');
  let createdResellerName = '';
  try {
    createdResellerName = await addResellerPage.AddReseller(testInfo);
    
    const isResellerCreated = createdResellerName && createdResellerName.length > 0;
    
    logAndValidate({
      step: 'Add New Reseller',
      expected: 'Success',
      actual: isResellerCreated ? 'Success' : 'Failed'
    }, testInfo);
  } catch (error) {
    logAndValidate({
      step: 'Add New Reseller',
      expected: 'Success',
      actual: `Failed - ${error}`
    }, testInfo);
  }

  // 🔍 Step 4: Search for Added Reseller
  console.log('📍 Step 4: Search & Verify Reseller Found');
  try {
    const searchInput = page.locator('input.table-search__input');
    await searchInput.fill(createdResellerName);
    await searchInput.press('Enter');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    const rows = page.locator('table tbody tr');
    const rowCount = await rows.count();
    let resellerFound = false;
    let foundName = '';

    for (let i = 0; i < rowCount; i++) {
      const nameCell = await rows.nth(i).locator('td').nth(1).textContent();
      if (nameCell?.trim() === createdResellerName) {
        resellerFound = true;
        foundName = nameCell?.trim() || '';
        break;
      }
    }

    logAndValidate({
      step: 'Search & Find Reseller in Table',
      expected: createdResellerName,
      actual: resellerFound ? foundName : 'Not Found'
    }, testInfo);

    expect(resellerFound, `Reseller not found in table`).toBe(true);
  } catch (error) {
    logAndValidate({
      step: 'Search & Find Reseller in Table',
      expected: createdResellerName,
      actual: `Error - ${error}`
    }, testInfo);
  }

  // 🗑️ Step 5: Delete Reseller
  console.log('📍 Step 5: Delete Reseller');
  let deleteSuccess = false;
  try {
    deleteSuccess = await deleteResellerPage.delete(createdResellerName);
    
    logAndValidate({
      step: 'Delete Reseller',
      expected: 'Success',
      actual: deleteSuccess ? 'Success' : 'Failed'
    }, testInfo);
    
    expect(deleteSuccess, `Failed to delete reseller`).toBe(true);
  } catch (error) {
    logAndValidate({
      step: 'Delete Reseller',
      expected: 'Success',
      actual: `Failed - ${error}`
    }, testInfo);
  }

  // ✔️ Step 6: Verify Deletion
  console.log('📍 Step 6: Verify Deletion');
  let deletionVerified = false;
  try {
    deletionVerified = await deleteResellerPage.verifyDeletionSuccess(createdResellerName);
    
    logAndValidate({
      step: 'Verify Reseller Deleted Successfully',
      expected: 'Not Found',
      actual: deletionVerified ? 'Not Found' : 'Still Exists'
    }, testInfo);
    
    expect(deletionVerified, `Deletion verification failed`).toBe(true);
  } catch (error) {
    logAndValidate({
      step: 'Verify Reseller Deleted Successfully',
      expected: 'Not Found',
      actual: `Error - ${error}`
    }, testInfo);
  }

  console.log('\n========== TEST PASSED: Add and Delete Reseller Complete ==========\n');
});