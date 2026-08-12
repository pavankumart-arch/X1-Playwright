import { test } from '@playwright/test';
import { Login } from '../../../../pages/Login/Loginpage';
import { LeftsideNavigation } from '../../../../pages/Navigations/LeftSideNavigation';
import { Reporter } from '../../../../pages/utils/NewReport';
import { cancelColor } from '../../../../pages/ApplicationConfig/DomainData/Colour/cancel_color';


test('Verify that the Cancel Color functionality', async ({ page }, testInfo) => {

  Reporter.startTest();

  const login = new Login(page);
  const navigation = new LeftsideNavigation(page);
  const CancelColor=new cancelColor(page)

  await login.navigateToURL();
  await login.loginToApplication();

  await navigation.gotoApplicationConfig();
  await navigation.goToDomainData();
  await navigation.goToColors();

  //Verify the cancel button functionality
 await CancelColor.VerifyColorCancelButton(testInfo)

  Reporter.endTest(testInfo);
});
