import { test } from '@playwright/test';
import { Login } from '../../../../pages/Login/Loginpage';
import { LeftsideNavigation } from '../../../../pages/Navigations/LeftSideNavigation';
import { Reporter } from '../../../../pages/utils/NewReport';
import { BodyTypeSearch } from '../../../../pages/ApplicationConfig/DomainData/Body Types/search_bodytype';

test('Verify that the Search functionality in the BodyTupy summery page', async ({ page }, testInfo) => {

  Reporter.startTest();

  const login = new Login(page);
  const navigation = new LeftsideNavigation(page);
 const bodyTypeSearch = new BodyTypeSearch(page);

  await login.navigateToURL();
  await login.loginToApplication();

  await navigation.gotoApplicationConfig();
  await navigation.goToDomainData();
  await navigation.goTobodytype();

  //Verify the search for BodyType summery page
await bodyTypeSearch.verifyBodyTypeSearch(testInfo)

  Reporter.endTest(testInfo);
});
