import { test, TestInfo } from '@playwright/test';
import { Login } from '../../../../pages/Login/Loginpage';
import { MakeSearch } from '../../../../pages/ApplicationConfig/DomainData/Make/SearchMake';
import { LeftsideNavigation } from '../../../../pages/Navigations/LeftSideNavigation';
import { Reporter } from '../../../../pages/utils/NewReport';


test.describe('Verify the Make Search Functionality', () => {
  let page: any;
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

  test('Verify All Make Search Functionalities', async ({}, testInfo: TestInfo) => {
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