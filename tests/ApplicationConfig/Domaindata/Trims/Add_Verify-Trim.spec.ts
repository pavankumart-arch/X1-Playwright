import { test } from '@playwright/test';
import { Login } from '../../../../pages/Login/Loginpage';
import { LeftsideNavigation } from '../../../../pages/Navigations/LeftSideNavigation';
import { Reporter } from '../../../../pages/utils/NewReport';
import { NavigatetoTrim } from '../../../../pages/ApplicationConfig/DomainData/Trim/NavigateTrim';
import { AddTrim } from '../../../../pages/ApplicationConfig/DomainData/Trim/add-verify-trim';


test('Verify that the added Trim appears in the summary table', async ({ page }, testInfo) => {

  Reporter.startTest();

  const login = new Login(page);
  const navigation = new LeftsideNavigation(page);
  const vavigatetoTrim = new NavigatetoTrim(page);
  const addTrim=new AddTrim(page)

  await login.navigateToURL();
  await login.loginToApplication();

  await navigation.gotoApplicationConfig();
  await navigation.goToDomainData();

  //Navigate to Trim Page
  await vavigatetoTrim.clickOnMakeName(testInfo);
  await vavigatetoTrim.clickOnModelName(testInfo);

  //Add and Verify the Trim
 await addTrim.createAndVerifyTrim(testInfo);




  Reporter.endTest(testInfo);
});
