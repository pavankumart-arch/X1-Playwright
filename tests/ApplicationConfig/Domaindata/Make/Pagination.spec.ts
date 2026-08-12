import { test } from '@playwright/test';
import { LeftsideNavigation } from '../../../../pages/Navigations/LeftSideNavigation';
import { DomainDataPagination } from '../../../../pages/ApplicationConfig/DomainData/Make/PaginationMake';
import { Login } from '../../../../pages/Login/Loginpage';
import { Reporter } from '../../../../pages/utils/NewReport';


test.describe('Verify the Pagination', () => {
  test('Verify the pagination', async ({ page }, testInfo) => {
    Reporter.startTest();
    
    const login = new Login(page);
    const navigation = new LeftsideNavigation(page);
    const domainDataPagination = new DomainDataPagination(page);

    // LOGIN
    await login.navigateToURL();
    await login.loginToApplication();

    // NAVIGATION
    await navigation.gotoApplicationConfig();
    await navigation.goToDomainData();

    // VERIFY PAGINATION
    await domainDataPagination.verifyDomainDataPagination(testInfo);
    
    Reporter.endTest(testInfo);
  });
});