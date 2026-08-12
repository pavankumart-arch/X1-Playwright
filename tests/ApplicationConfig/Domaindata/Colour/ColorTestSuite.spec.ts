import { test } from '@playwright/test';
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

test.describe('Color Test Suite', () => {

  // ============================================
  // TEST 1: Verify Column Headers for Color
  // ============================================
  test('TC-COL-001: Verify that the Columns for Color functionality', async ({ page }, testInfo) => {
    Reporter.startTest();

    const login = new Login(page);
    const navigation = new LeftsideNavigation(page);
    const colorColumns = new ColorColumns(page);

    await login.navigateToURL();
    await login.loginToApplication();

    await navigation.gotoApplicationConfig();
    await navigation.goToDomainData();
    await navigation.goToColors();

    // Verify the Column functionality for Color
    await colorColumns.verifyColorColumnHeaders(testInfo);

    Reporter.endTest(testInfo);
  });

  // ============================================
  // TEST 2: Verify Validation for Color
  // ============================================
  test('TC-COL-002: Verify that the Validation functionality for color', async ({ page }, testInfo) => {
    Reporter.startTest();

    const login = new Login(page);
    const navigation = new LeftsideNavigation(page);
    const Colorvalidation = new colorvalidation(page);

    await login.navigateToURL();
    await login.loginToApplication();

    await navigation.gotoApplicationConfig();
    await navigation.goToDomainData();
    await navigation.goToColors();

    // Verify the validation for color page
    await Colorvalidation.colorvalidation(testInfo);

    Reporter.endTest(testInfo);
  });

  // ============================================
  // TEST 3: Verify Cancel Button for Color
  // ============================================
  test('TC-COL-003: Verify that the Cancel Color functionality', async ({ page }, testInfo) => {
    Reporter.startTest();

    const login = new Login(page);
    const navigation = new LeftsideNavigation(page);
    const CancelColor = new cancelColor(page);

    await login.navigateToURL();
    await login.loginToApplication();

    await navigation.gotoApplicationConfig();
    await navigation.goToDomainData();
    await navigation.goToColors();

    // Verify the cancel button functionality
    await CancelColor.VerifyColorCancelButton(testInfo);

    Reporter.endTest(testInfo);
  });

  // ============================================
  // TEST 4: Verify Add Color Functionality
  // ============================================
  test('TC-COL-004: Verify that the added Color functionality', async ({ page }, testInfo) => {
    Reporter.startTest();

    const login = new Login(page);
    const navigation = new LeftsideNavigation(page);
    const addColor = new AddColor(page);

    await login.navigateToURL();
    await login.loginToApplication();

    await navigation.gotoApplicationConfig();
    await navigation.goToDomainData();
    await navigation.goToColors();

    // Add and color functionality
    await addColor.createAndVerifyColor(testInfo);

    Reporter.endTest(testInfo);
  });

  // ============================================
  // TEST 5: Verify Edit Color Functionality
  // ============================================
  test('TC-COL-005: Verify that the Edit functionality for color', async ({ page }, testInfo) => {
    Reporter.startTest();

    const login = new Login(page);
    const navigation = new LeftsideNavigation(page);
    const editColor = new EditColor(page);

    await login.navigateToURL();
    await login.loginToApplication();

    await navigation.gotoApplicationConfig();
    await navigation.goToDomainData();
    await navigation.goToColors();

    // Verify the edit functionality for Color
    await editColor.editAndVerifyColor(testInfo);

    Reporter.endTest(testInfo);
  });

  // ============================================
  // TEST 6: Verify Delete Color Functionality
  // ============================================
  test('TC-COL-006: Verify that the Delete functionality for color', async ({ page }, testInfo) => {
    Reporter.startTest();

    const login = new Login(page);
    const navigation = new LeftsideNavigation(page);
    const deleteColour = new DeleteColour(page);

    await login.navigateToURL();
    await login.loginToApplication();

    await navigation.gotoApplicationConfig();
    await navigation.goToDomainData();
    await navigation.goToColors();

    // Verify the delete functionality for Color
    await deleteColour.completeAddDeleteColorFlow(testInfo);

    Reporter.endTest(testInfo);
  });

  // ============================================
  // TEST 7: Verify Pagination for Color
  // ============================================
  test('TC-COL-007: Verify that the pagination functionality for color', async ({ page }, testInfo) => {
    Reporter.startTest();

    const login = new Login(page);
    const navigation = new LeftsideNavigation(page);
    const colorPagination = new ColorPagination(page);

    await login.navigateToURL();
    await login.loginToApplication();

    await navigation.gotoApplicationConfig();
    await navigation.goToDomainData();
    await navigation.goToColors();

    // Verify the pagination functionality for Color
    await colorPagination.verifyColorPagination(testInfo);

    Reporter.endTest(testInfo);
  });

  // ============================================
  // TEST 8: Verify Sorting for Color
  // ============================================
  test('TC-COL-008: Verify that the Sorting column functionality for color', async ({ page }, testInfo) => {
    Reporter.startTest();

    const login = new Login(page);
    const navigation = new LeftsideNavigation(page);
    const colorSortingWithPagination = new ColorSortingWithPagination(page);

    await login.navigateToURL();
    await login.loginToApplication();

    await navigation.gotoApplicationConfig();
    await navigation.goToDomainData();
    await navigation.goToColors();

    // Verify the Column Sorting functionality for Color
    await colorSortingWithPagination.verifyAllColumnsSorting(testInfo);

    Reporter.endTest(testInfo);
  });

  // ============================================
  // TEST 9: Color Search Functionality
  // ============================================
  test.describe('Color Search Functionality', () => {
    test.setTimeout(120000); // 2 minutes

    test.beforeEach(async ({ page }) => {
      const login = new Login(page);
      const navigation = new LeftsideNavigation(page);

      await login.navigateToURL();
      await login.loginToApplication();

      await navigation.gotoApplicationConfig();
      await navigation.goToDomainData();
      await navigation.goToColors();
    });

    // 9.1: Search by ID
    test('TC-COL-009-01: Verify search by ID', async ({ page }, testInfo) => {
      Reporter.startTest();
      const colorSearch = new ColorSearch(page);
      await colorSearch.searchColors(testInfo, { searchBy: 'id' });
      Reporter.endTest(testInfo);
    });

    // 9.2: Search by Color Name
    test('TC-COL-009-02: Verify search by Color Name', async ({ page }, testInfo) => {
      Reporter.startTest();
      const colorSearch = new ColorSearch(page);
      await colorSearch.searchColors(testInfo, { searchBy: 'colorName' });
      Reporter.endTest(testInfo);
    });

    // 9.3: Search by Hex Code
    test('TC-COL-009-03: Verify search by Hex Code', async ({ page }, testInfo) => {
      Reporter.startTest();
      const colorSearch = new ColorSearch(page);
      await colorSearch.searchColors(testInfo, { searchBy: 'hex' });
      Reporter.endTest(testInfo);
    });

    // 9.4: Search by Active Status
    test('TC-COL-009-04: Verify search by Active Status', async ({ page }, testInfo) => {
      Reporter.startTest();
      const colorSearch = new ColorSearch(page);
      await colorSearch.searchColors(testInfo, { searchBy: 'status', statusType: 'active' });
      Reporter.endTest(testInfo);
    });

    // 9.5: Search by Inactive Status
    test('TC-COL-009-05: Verify search by Inactive Status', async ({ page }, testInfo) => {
      Reporter.startTest();
      const colorSearch = new ColorSearch(page);
      await colorSearch.searchColors(testInfo, { searchBy: 'status', statusType: 'inactive' });
      Reporter.endTest(testInfo);
    });

    // 9.6: Verify Color Preview Images
    test('TC-COL-009-06: Verify color preview images exist', async ({ page }, testInfo) => {
      Reporter.startTest();
      const colorSearch = new ColorSearch(page);
      await colorSearch.searchColors(testInfo, { searchBy: 'preview' });
      Reporter.endTest(testInfo);
    });

    // 9.7: Verify Invalid Search
    test('TC-COL-009-07: Verify invalid search shows no data', async ({ page }, testInfo) => {
      Reporter.startTest();
      const colorSearch = new ColorSearch(page);
      await colorSearch.searchColors(testInfo, { searchBy: 'invalid' });
      Reporter.endTest(testInfo);
    });

    // 9.8: Verify Invalid Search with Custom Value
    test('TC-COL-009-08: Verify invalid search with custom value shows no data', async ({ page }, testInfo) => {
      Reporter.startTest();
      const colorSearch = new ColorSearch(page);
      await colorSearch.searchColors(testInfo, {
        searchBy: 'invalid',
        customValue: 'nonexistent_color_xyz'
      });
      Reporter.endTest(testInfo);
    });

  });

});