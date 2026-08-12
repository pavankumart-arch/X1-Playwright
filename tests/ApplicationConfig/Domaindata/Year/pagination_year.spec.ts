import { test } from '@playwright/test';
import { Login } from '../../../../pages/Login/Loginpage';
import { LeftsideNavigation } from '../../../../pages/Navigations/LeftSideNavigation';
import { Reporter } from '../../../../pages/utils/NewReport';
import { yearvalidation } from '../../../../pages/ApplicationConfig/DomainData/Year/validation-year';
import { YearPagination } from '../../../../pages/ApplicationConfig/DomainData/Year/pagination-year';


test('Verify that the Pagination of Year functionality', async ({ page }, testInfo) => {

  Reporter.startTest();

  const login = new Login(page);
  const navigation = new LeftsideNavigation(page);
  const yearPagination = new YearPagination(page);

  await login.navigateToURL();
  await login.loginToApplication();

  await navigation.gotoApplicationConfig();
  await navigation.goToDomainData();
  await navigation.gotoDomainyear();

  //Verify the Pagination for year
  await yearPagination.verifyyearPagination(testInfo)

  Reporter.endTest(testInfo);
});
