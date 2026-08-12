import { test } from '@playwright/test';
import { Login } from '../../../../pages/Login/Loginpage';
import { LeftsideNavigation } from '../../../../pages/Navigations/LeftSideNavigation';
import { Reporter } from '../../../../pages/utils/NewReport';
import { BodyTypeSearch } from '../../../../pages/ApplicationConfig/DomainData/Body Types/search_bodytype';
import { bodytypePagination } from '../../../../pages/ApplicationConfig/DomainData/Body Types/pagination_bodytype';

test('Verify that the pagination functionality in the BodyTupy summery page', async ({ page }, testInfo) => {

  Reporter.startTest();

  const login = new Login(page);
  const navigation = new LeftsideNavigation(page);
 const BodytypePagination = new bodytypePagination(page);

  await login.navigateToURL();
  await login.loginToApplication();

  await navigation.gotoApplicationConfig();
  await navigation.goToDomainData();
  await navigation.goTobodytype();

  //Verify the Pagination for BodyType summery page
await BodytypePagination.verifyBodytypeDataPagination(testInfo);

  Reporter.endTest(testInfo);
});
