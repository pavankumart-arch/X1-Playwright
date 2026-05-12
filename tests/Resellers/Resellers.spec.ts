import { test, expect, TestInfo } from '@playwright/test';
import { Login } from '../../pages/Login/Loginpage';
import { LeftsideNavigation } from '../../pages/Navigations/LeftSideNavigation';
import { AddReseller } from '../../pages/Resellers/AddReseller';
import { DeleteReseller } from '../../pages/Resellers/DeleteReseller';
import { EditReseller } from '../../pages/Resellers/EditReseller';
import { ResellerValidation } from '../../pages/Resellers/AddResellerValidation';
import { ViewReseller } from '../../pages/Resellers/View Reseller';
import { VerifyCancelbutton } from '../../pages/Resellers/ResellerCancelbutton';
import { ResellerColumns } from '../../pages/Resellers/ResellerColumns';
import { ResellerSearch } from '../../pages/Resellers/ResellerSearch';
import { TableSorting } from '../../pages/Resellers/ResellerSorting';
import { ResellerPagination } from '../../pages/Resellers/ResellerPagination';
import { logAndValidate } from '../../utils/reportUtil';

test.describe('Reseller Test Suite', () => {

  // ========================================
  // 1️⃣ RESELLER VALIDATION TEST
  // ========================================
  test('1️⃣ Verify Reseller Validation Functionality', async ({ page }, testInfo) => {
    console.log('\n========== TEST 1: Reseller Validation ==========\n');

    const loginPage = new Login(page);
    const navigation = new LeftsideNavigation(page);
    const resellerValidation = new ResellerValidation(page);
    
    try {
      await loginPage.navigateToURL();
      await loginPage.loginToApplication();
      await navigation.goToDashboard();
      await page.waitForTimeout(2000);
      await navigation.goToResellers();
      await page.waitForTimeout(2000);
      
      await resellerValidation.validateResellerForm(testInfo);
      
      logAndValidate({
        step: 'Reseller Validation',
        expected: 'Success',
        actual: 'Success'
      }, testInfo);
    } catch (error) {
      logAndValidate({
        step: 'Reseller Validation',
        expected: 'Success',
        actual: `Failed - ${error}`
      }, testInfo);
    }

    console.log('========== TEST 1 COMPLETED ==========\n');
  });

  // ========================================
  // 2️⃣ ADD RESELLER TEST
  // ========================================
  test('2️⃣ Verify Add Reseller Functionality', async ({ page }, testInfo) => {
    console.log('\n========== TEST 2: Add Reseller ==========\n');

    const loginPage = new Login(page);
    const navigation = new LeftsideNavigation(page);
    const addReseller = new AddReseller(page);

    try {
      await loginPage.navigateToURL();
      await loginPage.loginToApplication();
      await navigation.goToDashboard();
      await navigation.goToResellers();

      await addReseller.AddReseller(testInfo);
      
      logAndValidate({
        step: 'Add Reseller Complete',
        expected: 'Success',
        actual: 'Success'
      }, testInfo);
    } catch (error) {
      logAndValidate({
        step: 'Add Reseller',
        expected: 'Success',
        actual: `Failed - ${error}`
      }, testInfo);
    }

    console.log('========== TEST 2 COMPLETED ==========\n');
  });

  // ========================================
  // 3️⃣ ADD + VIEW RESELLER TEST
  // ========================================
  test('3️⃣ Verify Add + View Reseller Flow', async ({ page }, testInfo) => {
    console.log('\n========== TEST 3: Add + View Reseller ==========\n');

    test.setTimeout(120000);

    const loginPage = new Login(page);
    const nav = new LeftsideNavigation(page);
    const addReseller = new AddReseller(page);
    const viewReseller = new ViewReseller(page, testInfo);

    try {
      await loginPage.navigateToURL();
      await loginPage.loginToApplication();

      await nav.goToDashboard();
      await nav.goToResellers();

      const addResults = await addReseller.AddReseller(testInfo);

      let createdName: string = '';

      if (Array.isArray(addResults)) {
        const nameResult = addResults.find(r => r.step === 'Name');
        createdName = nameResult?.expected;
      } else {
        createdName = addResults;
      }

      if (!createdName) {
        throw new Error('❌ Created reseller name not found');
      }

      console.log('✅ Created Reseller:', createdName);

      await page.waitForTimeout(2000);

      const results = await viewReseller.verifyResellerFromJson(createdName);

      if (!results || results.length === 0) {
        throw new Error('❌ No validation results returned');
      }

      logAndValidate({
        step: 'Add + View Reseller',
        expected: 'Success',
        actual: 'Success'
      }, testInfo);
    } catch (error) {
      logAndValidate({
        step: 'Add + View Reseller',
        expected: 'Success',
        actual: `Failed - ${error}`
      }, testInfo);
    }

    console.log('========== TEST 3 COMPLETED ==========\n');
  });

  // ========================================
  // 4️⃣ ADD + DELETE RESELLER TEST
  // ========================================
  test('4️⃣ Verify Add + Delete Reseller Flow', async ({ page }, testInfo) => {
    console.log('\n========== TEST 4: Add + Delete Reseller ==========\n');

    const loginPage = new Login(page);
    const leftsideNavigation = new LeftsideNavigation(page);
    const addResellerPage = new AddReseller(page);
    const deleteResellerPage = new DeleteReseller(page);

    try {
      // 🔐 Login
      await loginPage.navigateToURL();
      await loginPage.loginToApplication();
      await page.waitForTimeout(2000);
      
      logAndValidate({
        step: 'Login to Application',
        expected: 'Success',
        actual: 'Success'
      }, testInfo);

      // 🧭 Navigate to Resellers
      await leftsideNavigation.goToDashboard();
      await leftsideNavigation.goToResellers();
      await page.waitForTimeout(2000);
      
      logAndValidate({
        step: 'Navigate to Resellers',
        expected: 'Success',
        actual: 'Success'
      }, testInfo);

      // ➕ Add New Reseller
      let createdResellerName = '';
      createdResellerName = await addResellerPage.AddReseller(testInfo);
      
      const isResellerCreated = createdResellerName && createdResellerName.length > 0;
      logAndValidate({
        step: 'Add New Reseller',
        expected: 'Success',
        actual: isResellerCreated ? 'Success' : 'Failed'
      }, testInfo);

      // 🔍 Search for Added Reseller
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

      // 🗑️ Delete Reseller
      let deleteSuccess = false;
      deleteSuccess = await deleteResellerPage.delete(createdResellerName);
      
      logAndValidate({
        step: 'Delete Reseller',
        expected: 'Success',
        actual: deleteSuccess ? 'Success' : 'Failed'
      }, testInfo);

      // ✔️ Verify Deletion
      let deletionVerified = false;
      deletionVerified = await deleteResellerPage.verifyDeletionSuccess(createdResellerName);
      
      logAndValidate({
        step: 'Verify Reseller Deleted Successfully',
        expected: 'Not Found',
        actual: deletionVerified ? 'Not Found' : 'Still Exists'
      }, testInfo);

    } catch (error) {
      logAndValidate({
        step: 'Add + Delete Reseller',
        expected: 'Success',
        actual: `Failed - ${error}`
      }, testInfo);
    }

    console.log('========== TEST 4 COMPLETED ==========\n');
  });

  // ========================================
  // 5️⃣ ADD + EDIT RESELLER TEST
  // ========================================
  test('5️⃣ Verify Add + Edit Reseller Flow', async ({ page }, testInfo) => {
    console.log('\n========== TEST 5: Add + Edit Reseller ==========\n');

    const loginPage = new Login(page);
    const leftsideNavigation = new LeftsideNavigation(page);
    const addResellerPage = new AddReseller(page);
    const editResellerPage = new EditReseller(page);

    try {
      // 🔐 Login
      await loginPage.navigateToURL();
      await loginPage.loginToApplication();
      await page.waitForTimeout(2000);

      logAndValidate({
        step: 'Login to Application',
        expected: 'Success',
        actual: 'Success'
      }, testInfo);

      // 🧭 Navigate to Resellers
      await leftsideNavigation.goToDashboard();
      await leftsideNavigation.goToResellers();
      await page.waitForTimeout(2000);

      logAndValidate({
        step: 'Navigate to Resellers',
        expected: 'Success',
        actual: 'Success'
      }, testInfo);

      // ➕ Add New Reseller
      let createdResellerName = '';
      createdResellerName = await addResellerPage.AddReseller(testInfo);
      
      const isResellerCreated = createdResellerName && createdResellerName.length > 0;
      logAndValidate({
        step: 'Add New Reseller',
        expected: 'Success',
        actual: isResellerCreated ? 'Success' : 'Failed'
      }, testInfo);

      // 🔍 Search for Added Reseller
      const searchInput = page.locator('input.table-search__input');
      await searchInput.fill(createdResellerName);
      await searchInput.press('Enter');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1000);

      // ✏️ Click Edit Button
      const editButtonClicked = await editResellerPage.clickEditButton(testInfo);
      expect(editButtonClicked, 'Failed to click edit button').toBe(true);

      // 📝 Fill Edit Form
      let editedName = '';
      editedName = await editResellerPage.fillEditForm(testInfo);
      logAndValidate({
        step: 'Fill Edit Form with New Data',
        expected: 'All fields updated',
        actual: 'All fields updated'
      }, testInfo);

      // ✅ Verify Form Fields Before Submit
      await editResellerPage.verifyFormFields(editedName, testInfo);

      // 💾 Submit Edit Form
      const submitSuccess = await editResellerPage.submitEditForm(testInfo);
      expect(submitSuccess, 'Failed to submit form').toBe(true);

      // 🔍 Search for Updated Reseller
      await searchInput.fill(editedName);
      await searchInput.press('Enter');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1000);

      // ✏️ Click Edit Button Again
      const editButtonClicked2 = await editResellerPage.clickEditButton(testInfo);
      expect(editButtonClicked2, 'Failed to click edit button second time').toBe(true);

      // 📊 Get All Field Values
      let retrievedFieldData: any = {};
      retrievedFieldData = await editResellerPage.getFieldValuesFromEditForm(testInfo);

      // 🔄 Go Back
      await page.goBack();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1500);

      // 📋 Compare Retrieved Data with JSON
      await editResellerPage.compareFieldDataWithJSON(retrievedFieldData, testInfo);

    } catch (error) {
      logAndValidate({
        step: 'Add + Edit Reseller',
        expected: 'Success',
        actual: `Failed - ${error}`
      }, testInfo);
    }

    console.log('========== TEST 5 COMPLETED ==========\n');
  });

  // ========================================
  // 6️⃣ CANCEL BUTTON TEST
  // ========================================
  test('6️⃣ Verify Reseller Cancel Button', async ({ page }, testInfo) => {
    console.log('\n========== TEST 6: Cancel Button ==========\n');

    const loginPage = new Login(page);
    const leftsideNavigation = new LeftsideNavigation(page);
    const verifyCancelbutton = new VerifyCancelbutton(page);
    
    try {
      await loginPage.navigateToURL();
      await loginPage.loginToApplication();
      await page.waitForTimeout(2000);
      await leftsideNavigation.goToDashboard();
      await leftsideNavigation.goToResellers();
      await page.waitForTimeout(2000);
      
      await verifyCancelbutton.VerifyResellerCancelbutton();
      
      logAndValidate({
        step: 'Cancel Button Verification',
        expected: 'Success',
        actual: 'Success'
      }, testInfo);
    } catch (error) {
      logAndValidate({
        step: 'Cancel Button Verification',
        expected: 'Success',
        actual: `Failed - ${error}`
      }, testInfo);
    }

    console.log('========== TEST 6 COMPLETED ==========\n');
  });

  // ========================================
  // 7️⃣ RESELLER COLUMNS TEST
  // ========================================
  test('7️⃣ Verify Reseller Columns', async ({ page }, testInfo) => {
    console.log('\n========== TEST 7: Reseller Columns ==========\n');

    const loginPage = new Login(page);
    const leftsideNavigation = new LeftsideNavigation(page);
    const resellerColumns = new ResellerColumns(page);

    try {
      await loginPage.navigateToURL();
      await loginPage.loginToApplication();
      await leftsideNavigation.goToDashboard();
      await leftsideNavigation.goToResellers();
      await page.waitForSelector('table');
      
      await resellerColumns.verifyResellerColumns();
      
      logAndValidate({
        step: 'Reseller Columns Verification',
        expected: 'Success',
        actual: 'Success'
      }, testInfo);
    } catch (error) {
      logAndValidate({
        step: 'Reseller Columns Verification',
        expected: 'Success',
        actual: `Failed - ${error}`
      }, testInfo);
    }

    console.log('========== TEST 7 COMPLETED ==========\n');
  });

  // ========================================
  // 8️⃣ RESELLER SEARCH - POSITIVE TESTS
  // ========================================
  
  test('8️⃣ Search by ID', async ({ page }, testInfo) => {
    console.log('\n========== TEST 8: Search by ID ==========\n');

    const loginPage = new Login(page);
    const leftsideNavigation = new LeftsideNavigation(page);
    const resellerSearch = new ResellerSearch(page);

    try {
      await loginPage.navigateToURL();
      await loginPage.loginToApplication();
      await leftsideNavigation.goToDashboard();
      await leftsideNavigation.goToResellers();

      await resellerSearch.searchByID();
      
      logAndValidate({
        step: 'Search by ID',
        expected: 'Success',
        actual: 'Success'
      }, testInfo);
    } catch (error) {
      logAndValidate({
        step: 'Search by ID',
        expected: 'Success',
        actual: `Failed - ${error}`
      }, testInfo);
    }

    console.log('========== TEST 8 COMPLETED ==========\n');
  });

  test('9️⃣ Search by Name', async ({ page }, testInfo) => {
    console.log('\n========== TEST 9: Search by Name ==========\n');

    const loginPage = new Login(page);
    const leftsideNavigation = new LeftsideNavigation(page);
    const resellerSearch = new ResellerSearch(page);

    try {
      await loginPage.navigateToURL();
      await loginPage.loginToApplication();
      await leftsideNavigation.goToDashboard();
      await leftsideNavigation.goToResellers();

      await resellerSearch.searchByName();
      
      logAndValidate({
        step: 'Search by Name',
        expected: 'Success',
        actual: 'Success'
      }, testInfo);
    } catch (error) {
      logAndValidate({
        step: 'Search by Name',
        expected: 'Success',
        actual: `Failed - ${error}`
      }, testInfo);
    }

    console.log('========== TEST 9 COMPLETED ==========\n');
  });

  test('🔟 Search by Description', async ({ page }, testInfo) => {
    console.log('\n========== TEST 10: Search by Description ==========\n');

    const loginPage = new Login(page);
    const leftsideNavigation = new LeftsideNavigation(page);
    const resellerSearch = new ResellerSearch(page);

    try {
      await loginPage.navigateToURL();
      await loginPage.loginToApplication();
      await leftsideNavigation.goToDashboard();
      await leftsideNavigation.goToResellers();

      await resellerSearch.searchByDescription();
      
      logAndValidate({
        step: 'Search by Description',
        expected: 'Success',
        actual: 'Success'
      }, testInfo);
    } catch (error) {
      logAndValidate({
        step: 'Search by Description',
        expected: 'Success',
        actual: `Failed - ${error}`
      }, testInfo);
    }

    console.log('========== TEST 10 COMPLETED ==========\n');
  });

  test('1️⃣1️⃣ Search by Created Date', async ({ page }, testInfo) => {
    console.log('\n========== TEST 11: Search by Created Date ==========\n');

    const loginPage = new Login(page);
    const leftsideNavigation = new LeftsideNavigation(page);
    const resellerSearch = new ResellerSearch(page);

    try {
      await loginPage.navigateToURL();
      await loginPage.loginToApplication();
      await leftsideNavigation.goToDashboard();
      await leftsideNavigation.goToResellers();

      await resellerSearch.searchByCreated();
      
      logAndValidate({
        step: 'Search by Created',
        expected: 'Success',
        actual: 'Success'
      }, testInfo);
    } catch (error) {
      logAndValidate({
        step: 'Search by Created',
        expected: 'Success',
        actual: `Failed - ${error}`
      }, testInfo);
    }

    console.log('========== TEST 11 COMPLETED ==========\n');
  });

  test('1️⃣2️⃣ Search by Status', async ({ page }, testInfo) => {
    console.log('\n========== TEST 12: Search by Status ==========\n');

    const loginPage = new Login(page);
    const leftsideNavigation = new LeftsideNavigation(page);
    const resellerSearch = new ResellerSearch(page);

    try {
      await loginPage.navigateToURL();
      await loginPage.loginToApplication();
      await leftsideNavigation.goToDashboard();
      await leftsideNavigation.goToResellers();

      await resellerSearch.searchByStatus();
      
      logAndValidate({
        step: 'Search by Status',
        expected: 'Success',
        actual: 'Success'
      }, testInfo);
    } catch (error) {
      logAndValidate({
        step: 'Search by Status',
        expected: 'Success',
        actual: `Failed - ${error}`
      }, testInfo);
    }

    console.log('========== TEST 12 COMPLETED ==========\n');
  });

  // ========================================
  // ❌ RESELLER SEARCH - NEGATIVE TESTS
  // ========================================

  test('1️⃣3️⃣ Search by Billing Name (No Data Expected)', async ({ page }, testInfo) => {
    console.log('\n========== TEST 13: Search by Billing Name (Negative) ==========\n');

    const loginPage = new Login(page);
    const leftsideNavigation = new LeftsideNavigation(page);
    const resellerSearch = new ResellerSearch(page);

    try {
      await loginPage.navigateToURL();
      await loginPage.loginToApplication();
      await leftsideNavigation.goToDashboard();
      await leftsideNavigation.goToResellers();

      await resellerSearch.searchByBillingName();
      
      logAndValidate({
        step: 'Search by Billing Name (Negative)',
        expected: 'No Data',
        actual: 'No Data'
      }, testInfo);
    } catch (error) {
      logAndValidate({
        step: 'Search by Billing Name',
        expected: 'No Data',
        actual: `${error}`
      }, testInfo);
    }

    console.log('========== TEST 13 COMPLETED ==========\n');
  });

  test('1️⃣4️⃣ Search by Sales Person (No Data Expected)', async ({ page }, testInfo) => {
    console.log('\n========== TEST 14: Search by Sales Person (Negative) ==========\n');

    const loginPage = new Login(page);
    const leftsideNavigation = new LeftsideNavigation(page);
    const resellerSearch = new ResellerSearch(page);

    try {
      await loginPage.navigateToURL();
      await loginPage.loginToApplication();
      await leftsideNavigation.goToDashboard();
      await leftsideNavigation.goToResellers();

      await resellerSearch.searchBySalesPerson();
      
      logAndValidate({
        step: 'Search by Sales Person (Negative)',
        expected: 'No Data',
        actual: 'No Data'
      }, testInfo);
    } catch (error) {
      logAndValidate({
        step: 'Search by Sales Person',
        expected: 'No Data',
        actual: `${error}`
      }, testInfo);
    }

    console.log('========== TEST 14 COMPLETED ==========\n');
  });

  test('1️⃣5️⃣ Search by TT Options (No Data Expected)', async ({ page }, testInfo) => {
    console.log('\n========== TEST 15: Search by TT Options (Negative) ==========\n');

    const loginPage = new Login(page);
    const leftsideNavigation = new LeftsideNavigation(page);
    const resellerSearch = new ResellerSearch(page);

    try {
      await loginPage.navigateToURL();
      await loginPage.loginToApplication();
      await leftsideNavigation.goToDashboard();
      await leftsideNavigation.goToResellers();

      await resellerSearch.searchByTTOptions();
      
      logAndValidate({
        step: 'Search by TT Options (Negative)',
        expected: 'No Data',
        actual: 'No Data'
      }, testInfo);
    } catch (error) {
      logAndValidate({
        step: 'Search by TT Options',
        expected: 'No Data',
        actual: `${error}`
      }, testInfo);
    }

    console.log('========== TEST 15 COMPLETED ==========\n');
  });

  test('1️⃣6️⃣ Search by App ID (No Data Expected)', async ({ page }, testInfo) => {
    console.log('\n========== TEST 16: Search by App ID (Negative) ==========\n');

    const loginPage = new Login(page);
    const leftsideNavigation = new LeftsideNavigation(page);
    const resellerSearch = new ResellerSearch(page);

    try {
      await loginPage.navigateToURL();
      await loginPage.loginToApplication();
      await leftsideNavigation.goToDashboard();
      await leftsideNavigation.goToResellers();

      await resellerSearch.searchByAppID();
      
      logAndValidate({
        step: 'Search by App ID (Negative)',
        expected: 'No Data',
        actual: 'No Data'
      }, testInfo);
    } catch (error) {
      logAndValidate({
        step: 'Search by App ID',
        expected: 'No Data',
        actual: `${error}`
      }, testInfo);
    }

    console.log('========== TEST 16 COMPLETED ==========\n');
  });

  test('1️⃣7️⃣ Search by Player Size (No Data Expected)', async ({ page }, testInfo) => {
    console.log('\n========== TEST 17: Search by Player Size (Negative) ==========\n');

    const loginPage = new Login(page);
    const leftsideNavigation = new LeftsideNavigation(page);
    const resellerSearch = new ResellerSearch(page);

    try {
      await loginPage.navigateToURL();
      await loginPage.loginToApplication();
      await leftsideNavigation.goToDashboard();
      await leftsideNavigation.goToResellers();

      await resellerSearch.searchByPlayerSize();
      
      logAndValidate({
        step: 'Search by Player Size (Negative)',
        expected: 'No Data',
        actual: 'No Data'
      }, testInfo);
    } catch (error) {
      logAndValidate({
        step: 'Search by Player Size',
        expected: 'No Data',
        actual: `${error}`
      }, testInfo);
    }

    console.log('========== TEST 17 COMPLETED ==========\n');
  });

  test('1️⃣8️⃣ Invalid Search (No Data Expected)', async ({ page }, testInfo) => {
    console.log('\n========== TEST 18: Invalid Search (Negative) ==========\n');

    const loginPage = new Login(page);
    const leftsideNavigation = new LeftsideNavigation(page);
    const resellerSearch = new ResellerSearch(page);

    try {
      await loginPage.navigateToURL();
      await loginPage.loginToApplication();
      await leftsideNavigation.goToDashboard();
      await leftsideNavigation.goToResellers();

      await resellerSearch.invalidSearch();
      
      logAndValidate({
        step: 'Invalid Search (Negative)',
        expected: 'No Data',
        actual: 'No Data'
      }, testInfo);
    } catch (error) {
      logAndValidate({
        step: 'Invalid Search',
        expected: 'No Data',
        actual: `${error}`
      }, testInfo);
    }

    console.log('========== TEST 18 COMPLETED ==========\n');
  });

  // ========================================
  // 1️⃣9️⃣ TABLE SORTING TESTS
  // ========================================

  const columns = ['ID', 'NAME', 'CREATED'];

  for (const column of columns) {
    test(`Sorting Validation - ${column}`, async ({ page }, testInfo: TestInfo) => {
      console.log(`\n========== TEST: Sort by ${column} ==========\n`);

      const loginPage = new Login(page);
      const navigation = new LeftsideNavigation(page);
      const sorting = new TableSorting(page);

      try {
        await loginPage.navigateToURL();
        await loginPage.loginToApplication();

        await navigation.goToDashboard();
        await navigation.goToResellers();

        const result = await sorting.validateColumnSorting(column, testInfo);

        logAndValidate({
          step: `Sorting Validation - ${column}`,
          expected: 'Success',
          actual: result ? 'Success' : 'Failed'
        }, testInfo);

        expect(result, `${column} Sorting Failed`).toBeTruthy();
      } catch (error) {
        logAndValidate({
          step: `Sorting Validation - ${column}`,
          expected: 'Success',
          actual: `Failed - ${error}`
        }, testInfo);
      }

      console.log(`========== TEST: Sort by ${column} COMPLETED ==========\n`);
    });
  }

  // ========================================
  // 2️⃣2️⃣ PAGINATION TEST
  // ========================================
  test('Verify Reseller Pagination', async ({ page }, testInfo) => {
    console.log('\n========== TEST: Reseller Pagination ==========\n');

    const loginPage = new Login(page);
    const leftsideNavigation = new LeftsideNavigation(page);
    const resellerPagination = new ResellerPagination(page);

    try {
      await loginPage.navigateToURL();
      await loginPage.loginToApplication();
      await page.waitForTimeout(2000);
      await leftsideNavigation.goToDashboard();
      await leftsideNavigation.goToResellers();

      const results = await resellerPagination.verifyAllPagination();

      for (const { step, expected, actual } of results) {
        const status = expected === actual ? 'PASS ✅' : 'FAIL ❌';
        const message = `🔍 ${step} → Expected: ${expected} | Actual: ${actual} | ${status}`;
        testInfo.annotations.push({ type: 'Result', description: message });
        
        logAndValidate({
          step,
          expected,
          actual
        }, testInfo);

        if (expected !== actual) {
          throw new Error(message);
        }
      }
    } catch (error) {
      logAndValidate({
        step: 'Reseller Pagination',
        expected: 'Success',
        actual: `Failed - ${error}`
      }, testInfo);
    }

    console.log('========== TEST: Reseller Pagination COMPLETED ==========\n');
  });

});