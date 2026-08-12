import { test } from '@playwright/test';
import { Login } from '../../../../pages/Login/Loginpage';
import { LeftsideNavigation } from '../../../../pages/Navigations/LeftSideNavigation';
import { Reporter } from '../../../../pages/utils/NewReport';
import { AddBodyType } from '../../../../pages/ApplicationConfig/DomainData/Body Types/add-bodytype';



test('Verify that the Add and Verify the bodytype functionality', async ({ page }, testInfo) => {

  Reporter.startTest();

  const login = new Login(page);
  const navigation = new LeftsideNavigation(page);
 const addBodyType = new AddBodyType(page);

  await login.navigateToURL();
  await login.loginToApplication();

  await navigation.gotoApplicationConfig();
  await navigation.goToDomainData();
  
  await navigation.goTobodytype();

  //Verify the Add and Verify the bodytype functionality
await addBodyType.createAndVerifyBodyType(testInfo)

  Reporter.endTest(testInfo);
});
