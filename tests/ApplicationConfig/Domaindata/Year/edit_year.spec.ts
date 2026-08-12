import { test } from '@playwright/test';
import { Login } from '../../../../pages/Login/Loginpage';
import { LeftsideNavigation } from '../../../../pages/Navigations/LeftSideNavigation';
import { Reporter } from '../../../../pages/utils/NewReport'
import { EditYear } from '../../../../pages/ApplicationConfig/DomainData/Year/edit_year';


test('Verify that the Edit Year functionality', async ({ page }, testInfo) => {

  Reporter.startTest();

  const login = new Login(page);
  const navigation = new LeftsideNavigation(page);
  const editYear=new EditYear(page)

  await login.navigateToURL();
  await login.loginToApplication();

  await navigation.gotoApplicationConfig();
  await navigation.goToDomainData();
  await navigation.gotoDomainyear();

  //Verify the delete year functionality
 await editYear.editAndVerifyYear(testInfo)

  Reporter.endTest(testInfo);
});
