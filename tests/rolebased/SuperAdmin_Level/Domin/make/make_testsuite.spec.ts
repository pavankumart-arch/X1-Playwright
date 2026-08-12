import { test, expect, Page } from '@playwright/test';
import { Login } from '../../../../../pages/Login/Loginpage';
import { LeftsideNavigation } from '../../../../../pages/Navigations/LeftSideNavigation';
import { MakesColumns } from '../../../../../pages/ApplicationConfig/DomainData/Make/ColumnsMake';
import { Reporter } from '../../../../../pages/utils/NewReport';
import { makevalidation } from '../../../../../pages/ApplicationConfig/DomainData/Make/MakeValidation';
import { Cancelbutton } from '../../../../../pages/ApplicationConfig/DomainData/Make/CancelMake';
import { AddMake } from '../../../../../pages/ApplicationConfig/DomainData/Make/AddMake';
import { DeleteMake } from '../../../../../pages/ApplicationConfig/DomainData/Make/DeleteMake';
import { DomainDataPagination } from '../../../../../pages/ApplicationConfig/DomainData/Make/PaginationMake';
import { MakeSortingWithPagination } from '../../../../../pages/ApplicationConfig/DomainData/Make/SortingMake';
import { MakeSearch } from '../../../../../pages/ApplicationConfig/DomainData/Make/SearchMake';
import { UpdateMake } from '../../../../../pages/ApplicationConfig/DomainData/Make/UpdateMakets';
import { EditMake } from '../../../../../pages/ApplicationConfig/DomainData/Make/EditMake';

async function prepareAndNavigate(page: Page) {
  const login = new Login(page);
  const navigation = new LeftsideNavigation(page);

  await login.navigateToURL();
await login.loginByRole("Super_Admin" as any);

  await navigation.gotoApplicationConfig();
  await navigation.goToDomainData();
}

test.describe('Make Test Suite - Complete Functionality Testing', () => {
  test('TC01: Verify Column Headers in Make Summary Page', async ({ page }, testInfo) => {
    Reporter.startTest();
    const makesColumns = new MakesColumns(page);

    await prepareAndNavigate(page);
    await makesColumns.verifyMakesColumnHeaders(testInfo);

    Reporter.endTest(testInfo);
  });

  test('TC02: Verify Validation Rules for Make Fields', async ({ page }, testInfo) => {
    Reporter.startTest();
    const makeValidation = new makevalidation(page);

    await prepareAndNavigate(page);
    await makeValidation.makevalidation(testInfo);

    Reporter.endTest(testInfo);
  });

  test('TC03: Verify Cancel Button Functionality on Add Make Page', async ({ page }, testInfo) => {
    Reporter.startTest();
    const cancelButton = new Cancelbutton(page);

    await prepareAndNavigate(page);
    await cancelButton.VerifyMakeCancelbutton(testInfo);

    Reporter.endTest(testInfo);
  });

  test('TC04: Verify Add and Create Make Functionality', async ({ page }, testInfo) => {
    Reporter.startTest();
    const addMake = new AddMake(page);

    await prepareAndNavigate(page);
    await addMake.addMake(testInfo);
    await addMake.verifyAddedMakeIsDisplayed(testInfo);

    Reporter.endTest(testInfo);
  });

  test('TC05: Verify Edit and Update Make Functionality', async ({ page }, testInfo) => {
    Reporter.startTest();
    const editMake = new EditMake(page);

    await prepareAndNavigate(page);
    const success = await editMake.editAndVerifyMake(testInfo);
    expect(success).toBeTruthy();

    Reporter.endTest(testInfo);
  });

  test('TC06: Verify Delete and Remove Make Functionality', async ({ page }, testInfo) => {
    Reporter.startTest();
    const addMake = new AddMake(page);
    const deleteMake = new DeleteMake(page);

    await prepareAndNavigate(page);
    const makeName = await addMake.addMake(testInfo);
    await addMake.verifyAddedMakeIsDisplayed(testInfo);
    await deleteMake.deleteExistingMake(makeName);

    Reporter.endTest(testInfo);
  });

  test('TC07: Verify Pagination Functionality in Make Summary Page', async ({ page }, testInfo) => {
    Reporter.startTest();
    const domainDataPagination = new DomainDataPagination(page);

    await prepareAndNavigate(page);
    await domainDataPagination.verifyDomainDataPagination(testInfo);

    Reporter.endTest(testInfo);
  });

  test('TC08: Verify Sorting Functionality in Make Summary Page', async ({ page }, testInfo) => {
    Reporter.startTest();
    const makeSorting = new MakeSortingWithPagination(page);

    await prepareAndNavigate(page);
    const results = await makeSorting.verifyAllColumnsSorting(testInfo);
    const sortableColumns = ['ID', 'Make', 'Created', 'Updated', 'Status'];
    const failedColumns = Object.entries(results).filter(([column, passed]) => !passed && sortableColumns.includes(column)).map(([column]) => column);
    expect(failedColumns).toEqual([]);

    Reporter.endTest(testInfo);
  });
});

test.describe('Make Search Functionality', () => {
  test.setTimeout(180000);

  test.beforeEach(async ({ page }) => {
    await prepareAndNavigate(page);
  });

  test('TC09-01: Verify search by ID', async ({ page }, testInfo) => {
    Reporter.startTest();
    const makeSearch = new MakeSearch(page);
    await makeSearch.searchByID(testInfo);
    Reporter.endTest(testInfo);
  });

  test('TC09-02: Verify search by Make Name', async ({ page }, testInfo) => {
    Reporter.startTest();
    const makeSearch = new MakeSearch(page);
    await makeSearch.searchByMakeName(testInfo);
    Reporter.endTest(testInfo);
  });

  test('TC09-03: Verify search by Created Date', async ({ page }, testInfo) => {
    Reporter.startTest();
    const makeSearch = new MakeSearch(page);
    await makeSearch.searchByCreatedDate(testInfo);
    Reporter.endTest(testInfo);
  });

  test('TC09-04: Verify search by Updated Date', async ({ page }, testInfo) => {
    Reporter.startTest();
    const makeSearch = new MakeSearch(page);
    await makeSearch.searchByUpdatedDate(testInfo);
    Reporter.endTest(testInfo);
  });

  test('TC09-05: Verify search by Status', async ({ page }, testInfo) => {
    Reporter.startTest();
    const makeSearch = new MakeSearch(page);
    await makeSearch.searchByStatus(testInfo);
    Reporter.endTest(testInfo);
  });

  test('TC09-06: Verify invalid search shows no data', async ({ page }, testInfo) => {
    Reporter.startTest();
    const makeSearch = new MakeSearch(page);
    await makeSearch.invalidNameSearch(testInfo);
    Reporter.endTest(testInfo);
  });
});

test.describe('Update Make Functionality', () => {
  test('TC10: Verify Make can be edited and updated', async ({ page }, testInfo) => {
    Reporter.startTest();
    const addMake = new AddMake(page);
    const updateMake = new UpdateMake(page);

    await prepareAndNavigate(page);
    const addedMakeName = await addMake.addMake(testInfo);
    await addMake.verifyAddedMakeIsDisplayed(testInfo);
    const isVerified = await updateMake.verifyMakeByEditing(addedMakeName, testInfo);
    expect(isVerified).toBeTruthy();

    Reporter.endTest(testInfo);
  });
});
