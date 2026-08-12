import { test } from '@playwright/test';
import { Login } from '../../../../pages/Login/Loginpage';
import { LeftsideNavigation } from '../../../../pages/Navigations/LeftSideNavigation';
import { Reporter } from '../../../../pages/utils/NewReport';
import { bodytypevalidation } from '../../../../pages/ApplicationConfig/DomainData/Body Types/validation_bodytype';

test('Verify that the validation for Bodytype', async ({ page }, testInfo) => {

  Reporter.startTest();

  const login = new Login(page);
  const navigation = new LeftsideNavigation(page);
 const Bodytypevalidation = new bodytypevalidation(page);

  await login.navigateToURL();
  await login.loginToApplication();

  await navigation.gotoApplicationConfig();
  await navigation.goToDomainData();
  await navigation.goTobodytype();

  //Verify the Validation for Bodytype 
await Bodytypevalidation.bodytypevalidation(testInfo)

  Reporter.endTest(testInfo);
});
