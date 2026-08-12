import { test } from '@playwright/test';
import { Login } from '../../../../pages/Login/Loginpage';
import { LeftsideNavigation } from '../../../../pages/Navigations/LeftSideNavigation';
import { Reporter } from '../../../../pages/utils/NewReport';
import { yearvalidation } from '../../../../pages/ApplicationConfig/DomainData/Year/validation-year';


test('Verify that the validation of Year functionality', async ({ page }, testInfo) => {

  Reporter.startTest();

  const login = new Login(page);
  const navigation = new LeftsideNavigation(page);
  const Yearvalidation=new yearvalidation(page);

  await login.navigateToURL();
  await login.loginToApplication();

  await navigation.gotoApplicationConfig();
  await navigation.goToDomainData();
  await navigation.gotoDomainyear();

  //Verify the pagination of year
  await Yearvalidation.yearvalidation(testInfo)

  Reporter.endTest(testInfo);
});
