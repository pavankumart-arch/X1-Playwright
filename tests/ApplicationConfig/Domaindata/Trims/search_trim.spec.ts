import { test } from '@playwright/test';
import { Login } from '../../../../pages/Login/Loginpage';
import { LeftsideNavigation } from '../../../../pages/Navigations/LeftSideNavigation';
import { Reporter } from '../../../../pages/utils/NewReport';
import { NavigatetoTrim } from '../../../../pages/ApplicationConfig/DomainData/Trim/NavigateTrim';
import { TrimPagination } from '../../../../pages/ApplicationConfig/DomainData/Trim/pagination_Trim';
import { TrimSearch } from '../../../../pages/ApplicationConfig/DomainData/Trim/search_trim';


test('Verify that the Trim Search functionality', async ({ page }, testInfo) => {

  Reporter.startTest();

  const login = new Login(page);
  const navigation = new LeftsideNavigation(page);
  const vavigatetoTrim = new NavigatetoTrim(page);
  const trimSearch=new TrimSearch(page)

  await login.navigateToURL();
  await login.loginToApplication();

  await navigation.gotoApplicationConfig();
  await navigation.goToDomainData();

  //Navigate to Trim Page
  await vavigatetoTrim.clickOnMakeName(testInfo);
  await vavigatetoTrim.clickOnModelName(testInfo);

  //Verify the Pagination
 await trimSearch.verifyTrimSearch(testInfo)

  Reporter.endTest(testInfo);
});
