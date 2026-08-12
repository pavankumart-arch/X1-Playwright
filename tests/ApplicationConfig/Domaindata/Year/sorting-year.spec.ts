import { test } from '@playwright/test';
import { Login } from '../../../../pages/Login/Loginpage';
import { LeftsideNavigation } from '../../../../pages/Navigations/LeftSideNavigation';
import { Reporter } from '../../../../pages/utils/NewReport';
import { YearSortingWithPagination } from '../../../../pages/ApplicationConfig/DomainData/Year/sorting-year';


test('Verify that the Pagination of Year functionality', async ({ page }, testInfo) => {

  Reporter.startTest();

  const login = new Login(page);
  const navigation = new LeftsideNavigation(page);
  const yearSortingWithPagination = new YearSortingWithPagination(page);

  await login.navigateToURL();
  await login.loginToApplication();

  await navigation.gotoApplicationConfig();
  await navigation.goToDomainData();
  await navigation.gotoDomainyear();

  //Verify the pagination of year
  await yearSortingWithPagination.verifyAllColumnsSorting(testInfo)

  Reporter.endTest(testInfo);
});
