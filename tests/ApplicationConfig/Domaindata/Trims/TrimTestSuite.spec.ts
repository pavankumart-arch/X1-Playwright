import { test } from '@playwright/test';
import { Login } from '../../../../pages/Login/Loginpage';
import { LeftsideNavigation } from '../../../../pages/Navigations/LeftSideNavigation';
import { Reporter } from '../../../../pages/utils/NewReport';
import { NavigatetoTrim } from '../../../../pages/ApplicationConfig/DomainData/Trim/NavigateTrim';
import { TrimColumns } from '../../../../pages/ApplicationConfig/DomainData/Trim/columns_trim';
import { TrimSortingWithPagination } from '../../../../pages/ApplicationConfig/DomainData/Trim/sorting_trim';
import { trimvalidation } from '../../../../pages/ApplicationConfig/DomainData/Trim/validation_trim';
import { AddTrim } from '../../../../pages/ApplicationConfig/DomainData/Trim/add-verify-trim';
import { cancelTrim } from '../../../../pages/ApplicationConfig/DomainData/Trim/cancel_trim';
import { EditTrim } from '../../../../pages/ApplicationConfig/DomainData/Trim/edit_trim';
import { DeleteTrim } from '../../../../pages/ApplicationConfig/DomainData/Trim/delete_Trim';
import { TrimPagination } from '../../../../pages/ApplicationConfig/DomainData/Trim/pagination_Trim';
import { TrimSearch } from '../../../../pages/ApplicationConfig/DomainData/Trim/search_trim';

test.describe('Trim Management Test Suite', () => {

  // Test Case 1: Verify Trim Columns
  test('TC-01: Verify that the Trim Columns are displayed correctly in the summary table', async ({ page }, testInfo) => {
    Reporter.startTest();

    const login = new Login(page);
    const navigation = new LeftsideNavigation(page);
    const navigateToTrim = new NavigatetoTrim(page);
    const trimColumns = new TrimColumns(page);

    await login.navigateToURL();
    await login.loginToApplication();
    await navigation.gotoApplicationConfig();
    await navigation.goToDomainData();
    await navigateToTrim.clickOnMakeName(testInfo);
    await navigateToTrim.clickOnModelName(testInfo);
    await trimColumns.verifyTrimColumnHeaders(testInfo);

    Reporter.endTest(testInfo);
  });

  // Test Case 2: Verify Trim Validation
  test('TC-02: Verify the validation functionality for Trim page', async ({ page }, testInfo) => {
    Reporter.startTest();

    const login = new Login(page);
    const navigation = new LeftsideNavigation(page);
    const navigateToTrim = new NavigatetoTrim(page);
    const trimValidation = new trimvalidation(page);

    await login.navigateToURL();
    await login.loginToApplication();
    await navigation.gotoApplicationConfig();
    await navigation.goToDomainData();
    await navigateToTrim.clickOnMakeName(testInfo);
    await navigateToTrim.clickOnModelName(testInfo);
    await trimValidation.trimvalidation(testInfo);

    Reporter.endTest(testInfo);
  });

  // Test Case 3: Verify Cancel Button
  test('TC-03: Verify that the Cancel button functionality works in Trim page', async ({ page }, testInfo) => {
    Reporter.startTest();

    const login = new Login(page);
    const navigation = new LeftsideNavigation(page);
    const navigateToTrim = new NavigatetoTrim(page);
   const CancelTrim=new cancelTrim(page)

    await login.navigateToURL();
    await login.loginToApplication();
    await navigation.gotoApplicationConfig();
    await navigation.goToDomainData();
    await navigateToTrim.clickOnMakeName(testInfo);
    await navigateToTrim.clickOnModelName(testInfo);
    await CancelTrim.VerifyTrimCancelbutton(testInfo);

    Reporter.endTest(testInfo);
  });

  // Test Case 4: Add and Verify Trim
  test('TC-04: Verify that the added Trim appears in the summary table', async ({ page }, testInfo) => {
    Reporter.startTest();

    const login = new Login(page);
    const navigation = new LeftsideNavigation(page);
    const navigateToTrim = new NavigatetoTrim(page);
    const addTrim = new AddTrim(page);

    await login.navigateToURL();
    await login.loginToApplication();
    await navigation.gotoApplicationConfig();
    await navigation.goToDomainData();
    await navigateToTrim.clickOnMakeName(testInfo);
    await navigateToTrim.clickOnModelName(testInfo);
    await addTrim.createAndVerifyTrim(testInfo);

    Reporter.endTest(testInfo);
  });

  // Test Case 5: Edit Trim
  test('TC-05: Verify that the Edit Trim functionality works correctly', async ({ page }, testInfo) => {
    Reporter.startTest();

    const login = new Login(page);
    const navigation = new LeftsideNavigation(page);
    const navigateToTrim = new NavigatetoTrim(page);
    const editTrim = new EditTrim(page);

    await login.navigateToURL();
    await login.loginToApplication();
    await navigation.gotoApplicationConfig();
    await navigation.goToDomainData();
    await navigateToTrim.clickOnMakeName(testInfo);
    await navigateToTrim.clickOnModelName(testInfo);
    await editTrim.editAndVerifyTrim(testInfo);

    Reporter.endTest(testInfo);
  });

  // Test Case 6: Delete Trim
  test('TC-06: Verify that the Delete Trim functionality works correctly', async ({ page }, testInfo) => {
    Reporter.startTest();

    const login = new Login(page);
    const navigation = new LeftsideNavigation(page);
    const navigateToTrim = new NavigatetoTrim(page);
    const deleteTrim = new DeleteTrim(page);

    await login.navigateToURL();
    await login.loginToApplication();
    await navigation.gotoApplicationConfig();
    await navigation.goToDomainData();
    await navigateToTrim.clickOnMakeName(testInfo);
    await navigateToTrim.clickOnModelName(testInfo);
    await deleteTrim.completeAddDeleteTrimFlow(testInfo);

    Reporter.endTest(testInfo);
  });

  // Test Case 7: Verify Trim Pagination
  test('TC-07: Verify that the Pagination functionality works correctly in Trim page', async ({ page }, testInfo) => {
    Reporter.startTest();

    const login = new Login(page);
    const navigation = new LeftsideNavigation(page);
    const navigateToTrim = new NavigatetoTrim(page);
    const trimPagination = new TrimPagination(page);

    await login.navigateToURL();
    await login.loginToApplication();
    await navigation.gotoApplicationConfig();
    await navigation.goToDomainData();
    await navigateToTrim.clickOnMakeName(testInfo);
    await navigateToTrim.clickOnModelName(testInfo);
    await trimPagination.verifyTrimPagination(testInfo);

    Reporter.endTest(testInfo);
  });

  // Test Case 8: Verify Trim Search
  test('TC-08: Verify that the Search functionality works correctly in Trim page', async ({ page }, testInfo) => {
    Reporter.startTest();

    const login = new Login(page);
    const navigation = new LeftsideNavigation(page);
    const navigateToTrim = new NavigatetoTrim(page);
    const trimSearch = new TrimSearch(page);

    await login.navigateToURL();
    await login.loginToApplication();
    await navigation.gotoApplicationConfig();
    await navigation.goToDomainData();
    await navigateToTrim.clickOnMakeName(testInfo);
    await navigateToTrim.clickOnModelName(testInfo);
    await trimSearch.verifyTrimSearch(testInfo);

    Reporter.endTest(testInfo);
  });

  // Test Case 9: Verify Sorting
  test('TC-09: Verify that the Sorting functionality works for all columns in Trim page', async ({ page }, testInfo) => {
    Reporter.startTest();

    const login = new Login(page);
    const navigation = new LeftsideNavigation(page);
    const navigateToTrim = new NavigatetoTrim(page);
    const trimSortingWithPagination = new TrimSortingWithPagination(page);

    await login.navigateToURL();
    await login.loginToApplication();
    await navigation.gotoApplicationConfig();
    await navigation.goToDomainData();
    await navigateToTrim.clickOnMakeName(testInfo);
    await navigateToTrim.clickOnModelName(testInfo);
    await trimSortingWithPagination.verifyAllColumnsSorting(testInfo);

    Reporter.endTest(testInfo);
  });

});