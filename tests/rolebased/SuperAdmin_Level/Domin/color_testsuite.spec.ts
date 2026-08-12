import { test, Page } from '@playwright/test';
import { Login } from '../../../../pages/Login/Loginpage';
import { LeftsideNavigation } from '../../../../pages/Navigations/LeftSideNavigation';
import { Reporter } from '../../../../pages/utils/NewReport';
import { ColorColumns } from '../../../../pages/ApplicationConfig/DomainData/Colour/column_color';
import { colorvalidation } from '../../../../pages/ApplicationConfig/DomainData/Colour/validation_color';
import { cancelColor } from '../../../../pages/ApplicationConfig/DomainData/Colour/cancel_color';
import { AddColor } from '../../../../pages/ApplicationConfig/DomainData/Colour/add_color';
import { EditColor } from '../../../../pages/ApplicationConfig/DomainData/Colour/edit_color';
import { DeleteColour } from '../../../../pages/ApplicationConfig/DomainData/Colour/delete_color';
import { ColorPagination } from '../../../../pages/ApplicationConfig/DomainData/Colour/pagination_color';
import { ColorSearch } from '../../../../pages/ApplicationConfig/DomainData/Colour/search_color';
import { ColorSortingWithPagination } from '../../../../pages/ApplicationConfig/DomainData/Colour/sorting_color';

async function prepareAndNavigate(page: Page) {
  const login = new Login(page);
  const navigation = new LeftsideNavigation(page);

  await login.navigateToURL();
  await login.loginByRole("Super_Admin" as any);

  await navigation.gotoApplicationConfig();
  await navigation.goToDomainData();
  await navigation.goToColors();
}

test.describe('Color Test Suite - Complete Functionality Testing', () => {
  test('TC01: Verify Column Headers in Color Summary Page', async ({ page }, testInfo) => {
    Reporter.startTest();
    const colorColumns = new ColorColumns(page);

    await prepareAndNavigate(page);
    await colorColumns.verifyColorColumnHeaders(testInfo);

    Reporter.endTest(testInfo);
  });

  test('TC02: Verify Validation Rules for Color Fields', async ({ page }, testInfo) => {
    Reporter.startTest();
    const colorValidation = new colorvalidation(page);

    await prepareAndNavigate(page);
    await colorValidation.colorvalidation(testInfo);

    Reporter.endTest(testInfo);
  });

  test('TC03: Verify Cancel Button Functionality on Add Color Page', async ({ page }, testInfo) => {
    Reporter.startTest();
    const cancelColorFlow = new cancelColor(page);

    await prepareAndNavigate(page);
    await cancelColorFlow.VerifyColorCancelButton(testInfo);

    Reporter.endTest(testInfo);
  });

  test('TC04: Verify Add and Create Color Functionality', async ({ page }, testInfo) => {
    Reporter.startTest();
    const addColor = new AddColor(page);

    await prepareAndNavigate(page);
    await addColor.createAndVerifyColor(testInfo);

    Reporter.endTest(testInfo);
  });

  test('TC05: Verify Edit and Update Color Functionality', async ({ page }, testInfo) => {
    Reporter.startTest();
    const editColor = new EditColor(page);

    await prepareAndNavigate(page);
    await editColor.editAndVerifyColor(testInfo);

    Reporter.endTest(testInfo);
  });

  test('TC06: Verify Delete and Remove Color Functionality', async ({ page }, testInfo) => {
    Reporter.startTest();
    const deleteColour = new DeleteColour(page);

    await prepareAndNavigate(page);
    await deleteColour.completeAddDeleteColorFlow(testInfo);

    Reporter.endTest(testInfo);
  });

  test('TC07: Verify Pagination Functionality in Color Summary Page', async ({ page }, testInfo) => {
    Reporter.startTest();
    const colorPagination = new ColorPagination(page);

    await prepareAndNavigate(page);
    await colorPagination.verifyColorPagination(testInfo);

    Reporter.endTest(testInfo);
  });

  test('TC08: Verify Sorting Functionality in Color Summary Page', async ({ page }, testInfo) => {
    Reporter.startTest();
    const colorSortingWithPagination = new ColorSortingWithPagination(page);

    await prepareAndNavigate(page);
    await colorSortingWithPagination.verifyAllColumnsSorting(testInfo);

    Reporter.endTest(testInfo);
  });
});

test.describe('Color Search Functionality', () => {
  test.setTimeout(120000);

  test.beforeEach(async ({ page }) => {
    await prepareAndNavigate(page);
  });

  test('TC09-01: Verify search by ID', async ({ page }, testInfo) => {
    Reporter.startTest();
    const colorSearch = new ColorSearch(page);
    await colorSearch.searchColors(testInfo, { searchBy: 'id' });
    Reporter.endTest(testInfo);
  });

  test('TC09-02: Verify search by Color Name', async ({ page }, testInfo) => {
    Reporter.startTest();
    const colorSearch = new ColorSearch(page);
    await colorSearch.searchColors(testInfo, { searchBy: 'colorName' });
    Reporter.endTest(testInfo);
  });

  test('TC09-03: Verify search by Hex Code', async ({ page }, testInfo) => {
    Reporter.startTest();
    const colorSearch = new ColorSearch(page);
    await colorSearch.searchColors(testInfo, { searchBy: 'hex' });
    Reporter.endTest(testInfo);
  });

  test('TC09-04: Verify search by Active Status', async ({ page }, testInfo) => {
    Reporter.startTest();
    const colorSearch = new ColorSearch(page);
    await colorSearch.searchColors(testInfo, { searchBy: 'status', statusType: 'active' });
    Reporter.endTest(testInfo);
  });

  test('TC09-05: Verify search by Inactive Status', async ({ page }, testInfo) => {
    Reporter.startTest();
    const colorSearch = new ColorSearch(page);
    await colorSearch.searchColors(testInfo, { searchBy: 'status', statusType: 'inactive' });
    Reporter.endTest(testInfo);
  });

  test('TC09-06: Verify color preview images exist', async ({ page }, testInfo) => {
    Reporter.startTest();
    const colorSearch = new ColorSearch(page);
    await colorSearch.searchColors(testInfo, { searchBy: 'preview' });
    Reporter.endTest(testInfo);
  });

  test('TC09-07: Verify invalid search shows no data', async ({ page }, testInfo) => {
    Reporter.startTest();
    const colorSearch = new ColorSearch(page);
    await colorSearch.searchColors(testInfo, { searchBy: 'invalid' });
    Reporter.endTest(testInfo);
  });

  test('TC09-08: Verify invalid search with custom value shows no data', async ({ page }, testInfo) => {
    Reporter.startTest();
    const colorSearch = new ColorSearch(page);
    await colorSearch.searchColors(testInfo, {
      searchBy: 'invalid',
      customValue: 'nonexistent_color_xyz'
    });
    Reporter.endTest(testInfo);
  });
});
