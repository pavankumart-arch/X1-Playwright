import { test, expect, Page } from '@playwright/test';
import { Login } from '../../../../pages/Login/Loginpage';
import { LeftsideNavigation } from '../../../../pages/Navigations/LeftSideNavigation';
import { MakeSortingWithPagination } from '../../../../pages/ApplicationConfig/DomainData/Make/SortingMake';
import { Reporter } from '../../../../pages/utils/NewReport';


test.describe.serial('Verify Make Table Sorting Functionality', () => {
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

  test('Verify all sortable columns in the table', async ({}, testInfo) => {
    Reporter.startTest();
    const results = await makeSorting.verifyAllColumnsSorting(testInfo);
    const sortableColumns = ['ID', 'Make', 'Created', 'Updated', 'Status'];
    const failedColumns = Object.entries(results).filter(([column, passed]) => !passed && sortableColumns.includes(column)).map(([column]) => column);
    expect(failedColumns, `Sorting failed for columns: ${failedColumns.join(', ')}`).toEqual([]);
    Reporter.endTest(testInfo);
  });

  test('Verify ID column sorting functionality', async ({}, testInfo) => {
    Reporter.startTest();
    expect(await makeSorting.verifyColumnSorting('ID', testInfo)).toBeTruthy();
    Reporter.endTest(testInfo);
  });

  test('Verify Make column sorting functionality', async ({}, testInfo) => {
    Reporter.startTest();
    expect(await makeSorting.verifyColumnSorting('Make', testInfo)).toBeTruthy();
    Reporter.endTest(testInfo);
  });

  test('Verify Created column sorting functionality', async ({}, testInfo) => {
    Reporter.startTest();
    expect(await makeSorting.verifyColumnSorting('Created', testInfo)).toBeTruthy();
    Reporter.endTest(testInfo);
  });

  test('Verify Updated column sorting functionality', async ({}, testInfo) => {
    Reporter.startTest();
    expect(await makeSorting.verifyLastUpdatedSorting(testInfo)).toBeTruthy();
    Reporter.endTest(testInfo);
  });

  test('Verify Status column sorting functionality', async ({}, testInfo) => {
    Reporter.startTest();
    expect(await makeSorting.verifyColumnSorting('Status', testInfo)).toBeTruthy();
    Reporter.endTest(testInfo);
  });
});