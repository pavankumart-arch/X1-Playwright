import { test } from '@playwright/test';
import { Login } from '../../../../pages/Login/Loginpage';
import { LeftsideNavigation } from '../../../../pages/Navigations/LeftSideNavigation';
import { Reporter } from '../../../../pages/utils/NewReport';
import { cancelYear } from '../../../../pages/ApplicationConfig/DomainData/Year/cancel_year';
import { YearColumns } from '../../../../pages/ApplicationConfig/DomainData/Year/column_year';
import { yearvalidation } from '../../../../pages/ApplicationConfig/DomainData/Year/validation-year';
import { Addyear } from '../../../../pages/ApplicationConfig/DomainData/Year/add_year';
import { EditYear } from '../../../../pages/ApplicationConfig/DomainData/Year/edit_year';
import { DeleteYear } from '../../../../pages/ApplicationConfig/DomainData/Year/delete_year';
import { YearPagination } from '../../../../pages/ApplicationConfig/DomainData/Year/pagination-year';
import { YearSearch } from '../../../../pages/ApplicationConfig/DomainData/Year/search_year';
import { YearSortingWithPagination } from '../../../../pages/ApplicationConfig/DomainData/Year/sorting-year';

test.describe('Year Functionality Test Suite', () => {
  
  // ==================== TEST CASE 1: ADD YEAR ====================
  test('TC001 - Verify Add Year functionality', async ({ page }, testInfo) => {
    Reporter.startTest();

    const login = new Login(page);
    const navigation = new LeftsideNavigation(page);
    const addyear = new Addyear(page);

    await login.navigateToURL();
    await login.loginToApplication();
    await navigation.gotoApplicationConfig();
    await navigation.goToDomainData();
    await navigation.gotoDomainyear();

    // Add and Verify the Year
    await addyear.createAndVerifyYear(testInfo);

    Reporter.endTest(testInfo);
  });

  // ==================== TEST CASE 2: EDIT YEAR ====================
  test('TC002 - Verify Edit Year functionality', async ({ page }, testInfo) => {
    Reporter.startTest();

    const login = new Login(page);
    const navigation = new LeftsideNavigation(page);
    const editYear = new EditYear(page);

    await login.navigateToURL();
    await login.loginToApplication();
    await navigation.gotoApplicationConfig();
    await navigation.goToDomainData();
    await navigation.gotoDomainyear();

    // Verify the edit year functionality
    await editYear.editAndVerifyYear(testInfo);

    Reporter.endTest(testInfo);
  });

  // ==================== TEST CASE 3: DELETE YEAR ====================
  test('TC003 - Verify Delete Year functionality', async ({ page }, testInfo) => {
    Reporter.startTest();

    const login = new Login(page);
    const navigation = new LeftsideNavigation(page);
    const deleteYear = new DeleteYear(page);

    await login.navigateToURL();
    await login.loginToApplication();
    await navigation.gotoApplicationConfig();
    await navigation.goToDomainData();
    await navigation.gotoDomainyear();

    // Verify the delete year functionality
    await deleteYear.completeAddDeleteYearFlow(testInfo);

    Reporter.endTest(testInfo);
  });

  // ==================== TEST CASE 4: CANCEL YEAR ====================
  test('TC004 - Verify Cancel Year functionality', async ({ page }, testInfo) => {
    Reporter.startTest();

    const login = new Login(page);
    const navigation = new LeftsideNavigation(page);
    const CancelYear = new cancelYear(page);

    await login.navigateToURL();
    await login.loginToApplication();
    await navigation.gotoApplicationConfig();
    await navigation.goToDomainData();
    await navigation.gotoDomainyear();

    // Verify the Cancel button functionality
    await CancelYear.VerifyYearCancelButton(testInfo);

    Reporter.endTest(testInfo);
  });

  // ==================== TEST CASE 5: SEARCH YEAR ====================
  test('TC005 - Verify Search Year functionality', async ({ page }, testInfo) => {
    Reporter.startTest();

    const login = new Login(page);
    const navigation = new LeftsideNavigation(page);
    const yearSearch = new YearSearch(page);

    await login.navigateToURL();
    await login.loginToApplication();
    await navigation.gotoApplicationConfig();
    await navigation.goToDomainData();
    await navigation.gotoDomainyear();

    // Verify the search for year
    await yearSearch.verifyYearSearch(testInfo);

    Reporter.endTest(testInfo);
  });

  // ==================== TEST CASE 6: COLUMNS FUNCTIONALITY ====================
  test('TC006 - Verify Columns functionality', async ({ page }, testInfo) => {
    Reporter.startTest();

    const login = new Login(page);
    const navigation = new LeftsideNavigation(page);
    const yearColumns = new YearColumns(page);

    await login.navigateToURL();
    await login.loginToApplication();
    await navigation.gotoApplicationConfig();
    await navigation.goToDomainData();
    await navigation.gotoDomainyear();

    // Verify the Columns button functionality
    await yearColumns.verifyTrimColumnHeaders(testInfo);

    Reporter.endTest(testInfo);
  });

  // ==================== TEST CASE 7: SORTING FUNCTIONALITY ====================
  test('TC007 - Verify Sorting functionality for all columns', async ({ page }, testInfo) => {
    Reporter.startTest();

    const login = new Login(page);
    const navigation = new LeftsideNavigation(page);
    const yearSortingWithPagination = new YearSortingWithPagination(page);

    await login.navigateToURL();
    await login.loginToApplication();
    await navigation.gotoApplicationConfig();
    await navigation.goToDomainData();
    await navigation.gotoDomainyear();

    // Verify the sorting of year columns
    await yearSortingWithPagination.verifyAllColumnsSorting(testInfo);

    Reporter.endTest(testInfo);
  });

  // ==================== TEST CASE 8: PAGINATION FUNCTIONALITY ====================
  test('TC008 - Verify Pagination functionality', async ({ page }, testInfo) => {
    Reporter.startTest();

    const login = new Login(page);
    const navigation = new LeftsideNavigation(page);
    const yearPagination = new YearPagination(page);

    await login.navigateToURL();
    await login.loginToApplication();
    await navigation.gotoApplicationConfig();
    await navigation.goToDomainData();
    await navigation.gotoDomainyear();

    // Verify the Pagination for year
    await yearPagination.verifyyearPagination(testInfo);

    Reporter.endTest(testInfo);
  });

  // ==================== TEST CASE 9: VALIDATION FUNCTIONALITY ====================
  test('TC009 - Verify Validation of Year functionality', async ({ page }, testInfo) => {
    Reporter.startTest();

    const login = new Login(page);
    const navigation = new LeftsideNavigation(page);
    const Yearvalidation = new yearvalidation(page);

    await login.navigateToURL();
    await login.loginToApplication();
    await navigation.gotoApplicationConfig();
    await navigation.goToDomainData();
    await navigation.gotoDomainyear();

    // Verify the validation of year
    await Yearvalidation.yearvalidation(testInfo);

    Reporter.endTest(testInfo);
  });

});