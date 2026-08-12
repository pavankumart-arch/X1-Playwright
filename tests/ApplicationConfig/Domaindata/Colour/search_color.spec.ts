import { test } from '@playwright/test';
import { Login } from '../../../../pages/Login/Loginpage';
import { LeftsideNavigation } from '../../../../pages/Navigations/LeftSideNavigation';
import { Reporter } from '../../../../pages/utils/NewReport';
import { ColorSearch } from '../../../../pages/ApplicationConfig/DomainData/Colour/search_color';

test.describe('Color Search', () => {

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

  test('Verify search by ID', async ({ page }, testInfo) => {
    Reporter.startTest();
    const colorSearch = new ColorSearch(page);
    await colorSearch.searchColors(testInfo, { searchBy: 'id' });
    Reporter.endTest(testInfo);
  });

  test('Verify search by Color Name', async ({ page }, testInfo) => {
    Reporter.startTest();
    const colorSearch = new ColorSearch(page);
    await colorSearch.searchColors(testInfo, { searchBy: 'colorName' });
    Reporter.endTest(testInfo);
  });

  test('Verify search by Hex Code', async ({ page }, testInfo) => {
    Reporter.startTest();
    const colorSearch = new ColorSearch(page);
    await colorSearch.searchColors(testInfo, { searchBy: 'hex' });
    Reporter.endTest(testInfo);
  });

  test('Verify search by Active Status', async ({ page }, testInfo) => {
    Reporter.startTest();
    const colorSearch = new ColorSearch(page);
    await colorSearch.searchColors(testInfo, { searchBy: 'status', statusType: 'active' });
    Reporter.endTest(testInfo);
  });

  test('Verify search by Inactive Status', async ({ page }, testInfo) => {
    Reporter.startTest();
    const colorSearch = new ColorSearch(page);
    await colorSearch.searchColors(testInfo, { searchBy: 'status', statusType: 'inactive' });
    Reporter.endTest(testInfo);
  });

  test('Verify color preview images exist', async ({ page }, testInfo) => {
    Reporter.startTest();
    const colorSearch = new ColorSearch(page);
    await colorSearch.searchColors(testInfo, { searchBy: 'preview' });
    Reporter.endTest(testInfo);
  });

  test('Verify invalid search shows no data', async ({ page }, testInfo) => {
    Reporter.startTest();
    const colorSearch = new ColorSearch(page);
    await colorSearch.searchColors(testInfo, { searchBy: 'invalid' });
    Reporter.endTest(testInfo);
  });

  test('Verify invalid search with custom value shows no data', async ({ page }, testInfo) => {
    Reporter.startTest();
    const colorSearch = new ColorSearch(page);
    await colorSearch.searchColors(testInfo, { 
      searchBy: 'invalid', 
      customValue: 'nonexistent_color_xyz' 
    });
    Reporter.endTest(testInfo);
  });

});