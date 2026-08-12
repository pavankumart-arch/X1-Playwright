import { test } from '@playwright/test';
import { Login } from '../../../../pages/Login/Loginpage';
import { LeftsideNavigation } from '../../../../pages/Navigations/LeftSideNavigation';
import { Reporter } from '../../../../pages/utils/NewReport'
import { cancelYear } from '../../../../pages/ApplicationConfig/DomainData/Year/cancel_year';
import { YearColumns } from '../../../../pages/ApplicationConfig/DomainData/Year/column_year';


test('Verify that the Columns functionality', async ({ page }, testInfo) => {

  Reporter.startTest();

  const login = new Login(page);
  const navigation = new LeftsideNavigation(page);
  const yearColumns=new YearColumns(page)

  await login.navigateToURL();
  await login.loginToApplication();

  await navigation.gotoApplicationConfig();
  await navigation.goToDomainData();
  await navigation.gotoDomainyear();

  //Verify the Cancel button functionality
 await yearColumns.verifyTrimColumnHeaders(testInfo)

  Reporter.endTest(testInfo);
});
