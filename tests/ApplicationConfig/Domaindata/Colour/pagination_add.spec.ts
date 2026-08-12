import { test } from '@playwright/test';
import { Login } from '../../../../pages/Login/Loginpage';
import { LeftsideNavigation } from '../../../../pages/Navigations/LeftSideNavigation';
import { Reporter } from '../../../../pages/utils/NewReport';
import { EditColor } from '../../../../pages/ApplicationConfig/DomainData/Colour/edit_color';
import { ColorPagination } from '../../../../pages/ApplicationConfig/DomainData/Colour/pagination_color';



test('Verify that the pagination functionality for color', async ({ page }, testInfo) => {

  Reporter.startTest();

  const login = new Login(page);
  const navigation = new LeftsideNavigation(page);
 const colorPagination = new ColorPagination(page);

  await login.navigateToURL();
  await login.loginToApplication();

  await navigation.gotoApplicationConfig();
  await navigation.goToDomainData();
  await navigation.goToColors();

  //Verify the pagination functionality for Color
await colorPagination.verifyColorPagination(testInfo)

  Reporter.endTest(testInfo);
});
