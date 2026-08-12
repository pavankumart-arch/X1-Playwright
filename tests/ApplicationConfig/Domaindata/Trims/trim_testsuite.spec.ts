import { test, Page } from '@playwright/test';
import { Login } from '../../../../pages/Login/Loginpage';
import { LeftsideNavigation } from '../../../../pages/Navigations/LeftSideNavigation';
import { Reporter } from '../../../../pages/utils/NewReport';
import { NavigatetoTrim } from '../../../../pages/ApplicationConfig/DomainData/Trim/NavigateTrim';
import { TrimColumns } from '../../../../pages/ApplicationConfig/DomainData/Trim/columns_trim';
import { trimvalidation } from '../../../../pages/ApplicationConfig/DomainData/Trim/validation_trim';
import { cancelTrim } from '../../../../pages/ApplicationConfig/DomainData/Trim/cancel_trim';
import { AddTrim } from '../../../../pages/ApplicationConfig/DomainData/Trim/add-verify-trim';
import { EditTrim } from '../../../../pages/ApplicationConfig/DomainData/Trim/edit_trim';
import { DeleteTrim } from '../../../../pages/ApplicationConfig/DomainData/Trim/delete_Trim';
import { TrimPagination } from '../../../../pages/ApplicationConfig/DomainData/Trim/pagination_Trim';
import { TrimSearch } from '../../../../pages/ApplicationConfig/DomainData/Trim/search_trim';
import { TrimSortingWithPagination } from '../../../../pages/ApplicationConfig/DomainData/Trim/sorting_trim';

async function prepareAndNavigate(page: Page) {
  const login = new Login(page);
  const navigation = new LeftsideNavigation(page);

  await login.navigateToURL();
  await login.loginToApplication();

  await navigation.gotoApplicationConfig();
  await navigation.goToDomainData();
}

async function prepareTrimPage(page: Page, testInfo: any) {
  const navigateToTrim = new NavigatetoTrim(page);

  await prepareAndNavigate(page);
  await navigateToTrim.clickOnMakeName(testInfo);
  await navigateToTrim.clickOnModelName(testInfo);
}

test.describe('Trim Test Suite - Complete Functionality Testing', () => {
  test('TC01: Verify Column Headers in Trim Summary Page', async ({ page }, testInfo) => {
    Reporter.startTest();
    const trimColumns = new TrimColumns(page);

    await prepareTrimPage(page, testInfo);
    await trimColumns.verifyTrimColumnHeaders(testInfo);

    Reporter.endTest(testInfo);
  });

  test('TC02: Verify Validation Rules for Trim Fields', async ({ page }, testInfo) => {
    Reporter.startTest();
    const trimValidation = new trimvalidation(page);

    await prepareTrimPage(page, testInfo);
    await trimValidation.trimvalidation(testInfo);

    Reporter.endTest(testInfo);
  });

  test('TC03: Verify Cancel Button Functionality on Add Trim Page', async ({ page }, testInfo) => {
    Reporter.startTest();
    const cancelTrimFlow = new cancelTrim(page);

    await prepareTrimPage(page, testInfo);
    await cancelTrimFlow.VerifyTrimCancelbutton(testInfo);

    Reporter.endTest(testInfo);
  });

  test('TC04: Verify Add and Create Trim Functionality', async ({ page }, testInfo) => {
    Reporter.startTest();
    const addTrim = new AddTrim(page);

    await prepareTrimPage(page, testInfo);
    await addTrim.createAndVerifyTrim(testInfo);

    Reporter.endTest(testInfo);
  });

  test('TC05: Verify Edit and Update Trim Functionality', async ({ page }, testInfo) => {
    Reporter.startTest();
    const editTrim = new EditTrim(page);

    await prepareTrimPage(page, testInfo);
    await editTrim.editAndVerifyTrim(testInfo);

    Reporter.endTest(testInfo);
  });

  test('TC06: Verify Delete and Remove Trim Functionality', async ({ page }, testInfo) => {
    Reporter.startTest();
    const deleteTrim = new DeleteTrim(page);

    await prepareTrimPage(page, testInfo);
    await deleteTrim.completeAddDeleteTrimFlow(testInfo);

    Reporter.endTest(testInfo);
  });

  test('TC07: Verify Pagination Functionality in Trim Summary Page', async ({ page }, testInfo) => {
    Reporter.startTest();
    const trimPagination = new TrimPagination(page);

    await prepareTrimPage(page, testInfo);
    await trimPagination.verifyTrimPagination(testInfo);

    Reporter.endTest(testInfo);
  });

  test('TC08: Verify Search Functionality in Trim Summary Page', async ({ page }, testInfo) => {
    Reporter.startTest();
    const trimSearch = new TrimSearch(page);

    await prepareTrimPage(page, testInfo);
    await trimSearch.verifyTrimSearch(testInfo);

    Reporter.endTest(testInfo);
  });

  test('TC09: Verify Sorting Functionality in Trim Summary Page', async ({ page }, testInfo) => {
    Reporter.startTest();
    const trimSortingWithPagination = new TrimSortingWithPagination(page);

    await prepareTrimPage(page, testInfo);
    await trimSortingWithPagination.verifyAllColumnsSorting(testInfo);

    Reporter.endTest(testInfo);
  });
});
