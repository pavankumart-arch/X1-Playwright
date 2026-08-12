import { test } from '@playwright/test';
import { Login } from '../../../../pages/Login/Loginpage';
import { LeftsideNavigation } from '../../../../pages/Navigations/LeftSideNavigation';
import { Reporter } from '../../../../pages/utils/NewReport';
import { colorvalidation } from '../../../../pages/ApplicationConfig/DomainData/Colour/validation_color';



test('Verify that the Validation functionality for color', async ({ page }, testInfo) => {

  Reporter.startTest();

  const login = new Login(page);
  const navigation = new LeftsideNavigation(page);
 const Colorvalidation = new colorvalidation(page);

  await login.navigateToURL();
  await login.loginToApplication();

  await navigation.gotoApplicationConfig();
  await navigation.goToDomainData();
  await navigation.goToColors();

  //Verify the validation for color page
await Colorvalidation.colorvalidation(testInfo)

  Reporter.endTest(testInfo);
});
