import { test, Page } from '@playwright/test';
import { Login } from '../../../../pages/Login/Loginpage';
import { LeftsideNavigation } from '../../../../pages/Navigations/LeftSideNavigation';
import { Reporter } from '../../../../pages/utils/NewReport';
import { Addyear } from '../../../../pages/ApplicationConfig/DomainData/Year/add_year';
import { cancelYear } from '../../../../pages/ApplicationConfig/DomainData/Year/cancel_year';
import { YearColumns } from '../../../../pages/ApplicationConfig/DomainData/Year/column_year';
import { DeleteYear } from '../../../../pages/ApplicationConfig/DomainData/Year/delete_year';
import { EditYear } from '../../../../pages/ApplicationConfig/DomainData/Year/edit_year';
import { YearPagination } from '../../../../pages/ApplicationConfig/DomainData/Year/pagination-year';
import { YearSearch } from '../../../../pages/ApplicationConfig/DomainData/Year/search_year';
import { YearSortingWithPagination } from '../../../../pages/ApplicationConfig/DomainData/Year/sorting-year';
import { yearvalidation } from '../../../../pages/ApplicationConfig/DomainData/Year/validation-year';

async function prepareAndNavigate(page: Page) {
  const login = new Login(page);
  const navigation = new LeftsideNavigation(page);

  await login.navigateToURL();
  await login.loginToApplication();

  await navigation.gotoApplicationConfig();
  await navigation.goToDomainData();
  await navigation.gotoDomainyear();
}

test.describe('Year Test Suite - Complete Functionality Testing', () => {
  test('TC01: Verify Column Headers in Year Summary Page', async ({ page }, testInfo) => {
    Reporter.startTest();
    const yearColumns = new YearColumns(page);

    await prepareAndNavigate(page);
    await yearColumns.verifyTrimColumnHeaders(testInfo);

    Reporter.endTest(testInfo);
  });

  test('TC02: Verify Validation Rules for Year Fields', async ({ page }, testInfo) => {
    Reporter.startTest();
    const yearValidation = new yearvalidation(page);

    await prepareAndNavigate(page);
    await yearValidation.yearvalidation(testInfo);

    Reporter.endTest(testInfo);
  });

  test('TC03: Verify Cancel Button Functionality on Add Year Page', async ({ page }, testInfo) => {
    Reporter.startTest();
    const cancelYearFlow = new cancelYear(page);

    await prepareAndNavigate(page);
    await cancelYearFlow.VerifyYearCancelButton(testInfo);

    Reporter.endTest(testInfo);
  });

  test('TC04: Verify Add and Create Year Functionality', async ({ page }, testInfo) => {
    Reporter.startTest();
    const addYear = new Addyear(page);

    await prepareAndNavigate(page);
    await addYear.createAndVerifyYear(testInfo);

    Reporter.endTest(testInfo);
  });

  test('TC05: Verify Edit and Update Year Functionality', async ({ page }, testInfo) => {
    Reporter.startTest();
    const editYear = new EditYear(page);

    await prepareAndNavigate(page);
    await editYear.editAndVerifyYear(testInfo);

    Reporter.endTest(testInfo);
  });

  test('TC06: Verify Delete and Remove Year Functionality', async ({ page }, testInfo) => {
    Reporter.startTest();
    const deleteYear = new DeleteYear(page);

    await prepareAndNavigate(page);
    await deleteYear.completeAddDeleteYearFlow(testInfo);

    Reporter.endTest(testInfo);
  });

  test('TC07: Verify Pagination Functionality in Year Summary Page', async ({ page }, testInfo) => {
    Reporter.startTest();
    const yearPagination = new YearPagination(page);

    await prepareAndNavigate(page);
    await yearPagination.verifyyearPagination(testInfo);

    Reporter.endTest(testInfo);
  });

  test('TC08: Verify Search Functionality in Year Summary Page', async ({ page }, testInfo) => {
    Reporter.startTest();
    const yearSearch = new YearSearch(page);

    await prepareAndNavigate(page);
    await yearSearch.verifyYearSearch(testInfo);

    Reporter.endTest(testInfo);
  });

  test('TC09: Verify Sorting Functionality in Year Summary Page', async ({ page }, testInfo) => {
    Reporter.startTest();
    const yearSorting = new YearSortingWithPagination(page);

    await prepareAndNavigate(page);
    await yearSorting.verifyAllColumnsSorting(testInfo);

    Reporter.endTest(testInfo);
  });
});
