import { test } from '@playwright/test';
import { Login } from '../../../../pages/Login/Loginpage';
import { LeftsideNavigation } from '../../../../pages/Navigations/LeftSideNavigation';
import { Reporter } from '../../../../pages/utils/NewReport';
import { ColorColumns } from '../../../../pages/ApplicationConfig/DomainData/Colour/column_color';


test('Verify that the Columns for Color functionality', async ({ page }, testInfo) => {

  Reporter.startTest();

  const login = new Login(page);
  const navigation = new LeftsideNavigation(page);
  const colorColumns=new ColorColumns(page)

  await login.navigateToURL();
  await login.loginToApplication();

  await navigation.gotoApplicationConfig();
  await navigation.goToDomainData();
  await navigation.goToColors();

  //Verify the Column functionality for Color
 await colorColumns.verifyColorColumnHeaders(testInfo)

  Reporter.endTest(testInfo);
});
