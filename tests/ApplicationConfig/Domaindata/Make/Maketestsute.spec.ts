import { test, expect, Page } from '@playwright/test';
import { Login } from '../../../../pages/Login/Loginpage';
import { LeftsideNavigation } from '../../../../pages/Navigations/LeftSideNavigation';
import { MakesColumns } from '../../../../pages/ApplicationConfig/DomainData/Make/ColumnsMake';
import { makevalidation } from '../../../../pages/ApplicationConfig/DomainData/Make/MakeValidation';
import { Cancelbutton } from '../../../../pages/ApplicationConfig/DomainData/Make/CancelMake';
import { AddMake } from '../../../../pages/ApplicationConfig/DomainData/Make/AddMake';
import { EditMake } from '../../../../pages/ApplicationConfig/DomainData/Make/EditMake';
import { DeleteMake } from '../../../../pages/ApplicationConfig/DomainData/Make/DeleteMake';
import { UpdateMake } from '../../../../pages/ApplicationConfig/DomainData/Make/UpdateMakets';
import { DomainDataPagination } from '../../../../pages/ApplicationConfig/DomainData/Make/PaginationMake';
import { MakeSearch } from '../../../../pages/ApplicationConfig/DomainData/Make/SearchMake';
import { MakeSortingWithPagination } from '../../../../pages/ApplicationConfig/DomainData/Make/SortingMake';
import { Reporter } from '../../../../pages/utils/NewReport';

// Configuration for parallel execution
test.describe.configure({ mode: 'parallel' });

test.describe('Domain Data - Make Module Complete Test Suite', () => {
  
  // ============================================
  // TEST 1: Column Headers Verification
  // ============================================
  test.describe('Column Headers Verification', () => {
    test('TC_MAKE_001: Verify Makes table column headers', async ({ page }, testInfo) => {
      Reporter.startTest();
      
      const login = new Login(page);
      const navigation = new LeftsideNavigation(page);
      const makesColumns = new MakesColumns(page);

      // LOGIN
      await login.navigateToURL();
      await login.loginToApplication();

      // NAVIGATION
      await navigation.gotoApplicationConfig();
      await navigation.goToDomainData();

      // VERIFY Columns names
      await makesColumns.verifyMakesColumnHeaders(testInfo);
      
      Reporter.endTest(testInfo);
    });
  });

  // ============================================
  // TEST 2: Add Make - UI Validation
  // ============================================
  test.describe('Add Make - UI Validation', () => {
    test('TC_MAKE_002: Verify Add Make Page UI Validation', async ({ page }, testInfo) => {
      Reporter.startTest();
      
      const login = new Login(page);
      const navigation = new LeftsideNavigation(page);
      const makeValidation = new makevalidation(page);

      await login.navigateToURL();
      await login.loginToApplication();
      await navigation.gotoApplicationConfig();
      await navigation.goToDomainData();
      await makeValidation.makevalidation(testInfo);
      
      Reporter.endTest(testInfo);
    });
  });

  // ============================================
  // TEST 3: Cancel Functionality
  // ============================================
  test.describe('Cancel Functionality', () => {
    test('TC_MAKE_003: Verify that clicking Cancel closes the form', async ({ page }, testInfo) => {
      Reporter.startTest();
      
      const login = new Login(page);
      const navigation = new LeftsideNavigation(page);
      const cancelbutton = new Cancelbutton(page);

      // LOGIN
      await login.navigateToURL();
      await login.loginToApplication();

      // NAVIGATION
      await navigation.gotoApplicationConfig();
      await navigation.goToDomainData();

      // VERIFY CANCEL BUTTON
      await cancelbutton.VerifyMakeCancelbutton(testInfo);
      
      Reporter.endTest(testInfo);
    });
  });

  // ============================================
  // TEST 4: Add Make - Verify in Summary Table
  // ============================================
  test.describe('Add Make - Summary Table Verification', () => {
    test('TC_MAKE_004: Verify that the added Make appears in the summary table', async ({ page }, testInfo) => {
      Reporter.startTest();
      
      const login = new Login(page);
      const navigation = new LeftsideNavigation(page);
      const addMake = new AddMake(page);

      // LOGIN
      await login.navigateToURL();
      await login.loginToApplication();

      // NAVIGATE TO MAKE
      await navigation.gotoApplicationConfig();
      await navigation.goToDomainData();

      // ADD MAKE
      await addMake.addMake(testInfo);

      // VERIFY MAKE IN SUMMARY TABLE
      await addMake.verifyAddedMakeIsDisplayed(testInfo);
      
      Reporter.endTest(testInfo);
    });
  });

  // ============================================
  // TEST 5: Add, Search, Edit, Verify, Delete Flow
  // ============================================
  test.describe('Complete CRUD Flow - Add, Search, Edit, Verify, Delete', () => {
    test('TC_MAKE_005: Verify Complete Make Flow - Add, Search, Edit, Verify, Delete', async ({ page }, testInfo) => {
      const login = new Login(page);
      const navigation = new LeftsideNavigation(page);
      const editMake = new EditMake(page);

      // LOGIN
      await login.navigateToURL();
      await login.loginToApplication();

      // NAVIGATE TO MAKE
      await navigation.gotoApplicationConfig();
      await navigation.goToDomainData();

      // EXECUTE COMPLETE FLOW: Add → Search → Edit → Verify → Delete
      const success = await editMake.editAndVerifyMake(testInfo);

      // VERIFY ALL STEPS PASSED
      expect(success).toBeTruthy();
    });
  });

  // ============================================
  // TEST 6: Add and Delete Make
  // ============================================
  test.describe('Add and Delete Make', () => {
    test('TC_MAKE_006: Verify that the added Make appears in the summary table and can be deleted', async ({ page }, testInfo) => {
      Reporter.startTest();
      
      const login = new Login(page);
      const navigation = new LeftsideNavigation(page);
      const addMake = new AddMake(page);
      const deleteMake = new DeleteMake(page);

      // LOGIN
      await login.navigateToURL();
      await login.loginToApplication();

      // NAVIGATE TO MAKE
      await navigation.gotoApplicationConfig();
      await navigation.goToDomainData();

      // ADD MAKE
      const makeName = await addMake.addMake(testInfo);

      // VERIFY MAKE IN SUMMARY TABLE
      await addMake.verifyAddedMakeIsDisplayed(testInfo);

      // CLEAN UP - DELETE THE ADDED MAKE
      await deleteMake.deleteExistingMake(makeName);
      
      Reporter.endTest(testInfo);
    });
  });

  // ============================================
  // TEST 7: Update Make
  // ============================================
  test.describe('Update Make Functionality', () => {
    test('TC_MAKE_007: Verify make can be edited and updated', async ({ page }, testInfo) => {
      Reporter.startTest();
      
      const login = new Login(page);
      const navigation = new LeftsideNavigation(page);
      const addMake = new AddMake(page);
      const updateMake = new UpdateMake(page);
      const deleteMake = new DeleteMake(page);

      // LOGIN
      await login.navigateToURL();
      await login.loginToApplication();

      // NAVIGATION
      await navigation.gotoApplicationConfig();
      await navigation.goToDomainData();

      // ADD A MAKE FIRST
      const addedMakeName = await addMake.addMake(testInfo);
      await addMake.verifyAddedMakeIsDisplayed(testInfo);

      // VERIFY BY EDITING (COMPARE ADDED MAKE NAME WITH EDIT FIELD)
      const isVerified = await updateMake.verifyMakeByEditing(addedMakeName, testInfo);
      expect(isVerified).toBeTruthy();

      Reporter.endTest(testInfo);
    });
  });

  // ============================================
  // TEST 8: Pagination Verification
  // ============================================
  test.describe('Pagination Verification', () => {
    test('TC_MAKE_008: Verify the pagination functionality', async ({ page }, testInfo) => {
      Reporter.startTest();
      
      const login = new Login(page);
      const navigation = new LeftsideNavigation(page);
      const domainDataPagination = new DomainDataPagination(page);

      // LOGIN
      await login.navigateToURL();
      await login.loginToApplication();

      // NAVIGATION
      await navigation.gotoApplicationConfig();
      await navigation.goToDomainData();

      // VERIFY PAGINATION
      await domainDataPagination.verifyDomainDataPagination(testInfo);
      
      Reporter.endTest(testInfo);
    });
  });

  // ============================================
  // TEST 9: Search Functionality
  // ============================================
  test.describe('Search Functionality', () => {
    let page: Page;
    let login: Login;
    let navigation: LeftsideNavigation;
    let makeSearch: MakeSearch;

    test.beforeAll(async ({ browser }) => {
      page = await browser.newPage();
      login = new Login(page);
      navigation = new LeftsideNavigation(page);
      makeSearch = new MakeSearch(page);
      await login.navigateToURL();
      await login.loginToApplication();
      await navigation.gotoApplicationConfig();
      await navigation.goToDomainData();
      console.log('\n✅ Setup completed - Logged in once\n');
    });

    test.afterAll(async () => {
      await page.close();
      console.log('\n✅ Cleanup completed\n');
    });

    test('TC_MAKE_009: Verify All Make Search Functionalities', async ({}, testInfo) => {
      Reporter.startTest();
      
      const failures: string[] = [];

      await test.step('Search by ID', async () => {
        const result = await makeSearch.searchByID(testInfo);
        if (!result) {
          failures.push('Search by ID Failed');
        }
      });

      await test.step('Search by Make', async () => {
        const result = await makeSearch.searchByMakeName(testInfo);
        if (!result) {
          failures.push('Search by Make Failed');
        }
      });

      await test.step('Search by Created', async () => {
        const result = await makeSearch.searchByCreatedDate(testInfo);
        if (!result) {
          failures.push('Search by Created Failed');
        }
      });

      await test.step('Search by Updated', async () => {
        const result = await makeSearch.searchByUpdatedDate(testInfo);
        if (!result) {
          failures.push('Search by Updated Failed');
        }
      });

      await test.step('Search by Status', async () => {
        const result = await makeSearch.searchByStatus(testInfo);
        if (!result) {
          failures.push('Search by Status Failed');
        }
      });

      await test.step('Invalid Data Search', async () => {
        const result = await makeSearch.invalidNameSearch(testInfo);
        if (!result) {
          failures.push('Invalid Data Search Failed');
        }
      });

      if (failures.length > 0) {
        throw new Error(`\nFailed Scenarios:\n${failures.join('\n')}\n`);
      }
      
      Reporter.endTest(testInfo);
    });
  });

  // ============================================
  // TEST 10: Sorting Functionality
  // ============================================
  test.describe.serial('Sorting Functionality', () => {
    let makeSorting: MakeSortingWithPagination;
    let sharedPage: Page;

    test.beforeAll(async ({ browser }) => {
      sharedPage = await browser.newPage();
      const login = new Login(sharedPage);
      const navigation = new LeftsideNavigation(sharedPage);
      await login.navigateToURL();
      await login.loginToApplication();
      await navigation.gotoApplicationConfig();
      await navigation.goToDomainData();
      makeSorting = new MakeSortingWithPagination(sharedPage);
    });

    test.beforeEach(async () => {
      if (makeSorting && sharedPage && !sharedPage.isClosed()) {
        await makeSorting.resetTableState();
      }
    });

    test.setTimeout(180000);

    test('TC_MAKE_010a: Verify all sortable columns in the table', async ({}, testInfo) => {
      Reporter.startTest();
      const results = await makeSorting.verifyAllColumnsSorting(testInfo);
      const sortableColumns = ['ID', 'Make', 'Created', 'Updated', 'Status'];
      const failedColumns = Object.entries(results)
        .filter(([column, passed]) => !passed && sortableColumns.includes(column))
        .map(([column]) => column);
      expect(failedColumns, `Sorting failed for columns: ${failedColumns.join(', ')}`).toEqual([]);
      Reporter.endTest(testInfo);
    });

    test('TC_MAKE_010b: Verify ID column sorting functionality', async ({}, testInfo) => {
      Reporter.startTest();
      expect(await makeSorting.verifyColumnSorting('ID', testInfo)).toBeTruthy();
      Reporter.endTest(testInfo);
    });

    test('TC_MAKE_010c: Verify Make column sorting functionality', async ({}, testInfo) => {
      Reporter.startTest();
      expect(await makeSorting.verifyColumnSorting('Make', testInfo)).toBeTruthy();
      Reporter.endTest(testInfo);
    });

    test('TC_MAKE_010d: Verify Created column sorting functionality', async ({}, testInfo) => {
      Reporter.startTest();
      expect(await makeSorting.verifyColumnSorting('Created', testInfo)).toBeTruthy();
      Reporter.endTest(testInfo);
    });

    test('TC_MAKE_010e: Verify Updated column sorting functionality', async ({}, testInfo) => {
      Reporter.startTest();
      expect(await makeSorting.verifyLastUpdatedSorting(testInfo)).toBeTruthy();
      Reporter.endTest(testInfo);
    });

    test('TC_MAKE_010f: Verify Status column sorting functionality', async ({}, testInfo) => {
      Reporter.startTest();
      expect(await makeSorting.verifyColumnSorting('Status', testInfo)).toBeTruthy();
      Reporter.endTest(testInfo);
    });
  });
});