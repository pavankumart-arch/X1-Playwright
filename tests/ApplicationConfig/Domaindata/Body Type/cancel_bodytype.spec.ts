import { test } from '@playwright/test';
import { Login } from '../../../../pages/Login/Loginpage';
import { LeftsideNavigation } from '../../../../pages/Navigations/LeftSideNavigation';
import { Reporter } from '../../../../pages/utils/NewReport';
import { AddBodyType } from '../../../../pages/ApplicationConfig/DomainData/Body Types/add-bodytype';
import { CancelBodyType } from '../../../../pages/ApplicationConfig/DomainData/Body Types/cancel_bodytype';



test('Verify that the Cancel button in the Add bodytype page functionality', async ({ page }, testInfo) => {

  Reporter.startTest();

  const login = new Login(page);
  const navigation = new LeftsideNavigation(page);
 const cancelBodyType = new CancelBodyType(page);

  await login.navigateToURL();
  await login.loginToApplication();

  await navigation.gotoApplicationConfig();
  await navigation.goToDomainData();
  await navigation.goTobodytype();

  //Verify the Cancel button for Add BodyType page functionality
await cancelBodyType.VerifyBodyTypeCancelbutton(testInfo)

  Reporter.endTest(testInfo);
});
