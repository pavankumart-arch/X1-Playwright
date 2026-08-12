import { test } from '@playwright/test';
import { Login } from '../../../../pages/Login/Loginpage';
import { LeftsideNavigation } from '../../../../pages/Navigations/LeftSideNavigation';
import { Reporter } from '../../../../pages/utils/NewReport';
import { NavigatetoTrim } from '../../../../pages/ApplicationConfig/DomainData/Trim/NavigateTrim';
import { AddTrim } from '../../../../pages/ApplicationConfig/DomainData/Trim/add-verify-trim';
import { Addyear } from '../../../../pages/ApplicationConfig/DomainData/Year/add_year';


test('Verify that the added year functionality', async ({ page }, testInfo) => {

  Reporter.startTest();

  const login = new Login(page);
  const navigation = new LeftsideNavigation(page);
  const addyear=new Addyear(page)

  await login.navigateToURL();
  await login.loginToApplication();

  await navigation.gotoApplicationConfig();
  await navigation.goToDomainData();
  await navigation.gotoDomainyear();

  //Add and Verify the Year
 await addyear.createAndVerifyYear(testInfo)

  Reporter.endTest(testInfo);
});
