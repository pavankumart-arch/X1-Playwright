import { test } from '@playwright/test';
import { Login } from '../../../../pages/Login/Loginpage';
import { LeftsideNavigation } from '../../../../pages/Navigations/LeftSideNavigation';
import { Reporter } from '../../../../pages/utils/NewReport'
import { cancelYear } from '../../../../pages/ApplicationConfig/DomainData/Year/cancel_year';


test('Verify that the added year functionality', async ({ page }, testInfo) => {

  Reporter.startTest();

  const login = new Login(page);
  const navigation = new LeftsideNavigation(page);
  const CancelYear=new cancelYear(page)

  await login.navigateToURL();
  await login.loginToApplication();

  await navigation.gotoApplicationConfig();
  await navigation.goToDomainData();
  await navigation.gotoDomainyear();

  //Verify the Cancel button functionality
 await CancelYear.VerifyYearCancelButton(testInfo)

  Reporter.endTest(testInfo);
});
