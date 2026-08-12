import { test } from '@playwright/test';
import { Login } from '../../../../pages/Login/Loginpage';
import { LeftsideNavigation } from '../../../../pages/Navigations/LeftSideNavigation';
import { Reporter } from '../../../../pages/utils/NewReport';
import { YearSearch } from '../../../../pages/ApplicationConfig/DomainData/Year/search_year';


test('Verify that the Search of Year functionality', async ({ page }, testInfo) => {

  Reporter.startTest();

  const login = new Login(page);
  const navigation = new LeftsideNavigation(page);
  const yearSearch = new YearSearch(page);

  await login.navigateToURL();
  await login.loginToApplication();

  await navigation.gotoApplicationConfig();
  await navigation.goToDomainData();
  await navigation.gotoDomainyear();

  //Verify the search for year
  await yearSearch.verifyYearSearch(testInfo)

  Reporter.endTest(testInfo);
});
