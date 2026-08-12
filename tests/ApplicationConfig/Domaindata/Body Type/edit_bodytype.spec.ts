import { test } from '@playwright/test';
import { Login } from '../../../../pages/Login/Loginpage';
import { LeftsideNavigation } from '../../../../pages/Navigations/LeftSideNavigation';
import { Reporter } from '../../../../pages/utils/NewReport';
import { EditBodyType } from '../../../../pages/ApplicationConfig/DomainData/Body Types/edit_bodytype';



test('Verify that the Edit and Verify the bodytype functionality', async ({ page }, testInfo) => {

  Reporter.startTest();

  const login = new Login(page);
  const navigation = new LeftsideNavigation(page);
 const editBodyType = new EditBodyType(page);

  await login.navigateToURL();
  await login.loginToApplication();

  await navigation.gotoApplicationConfig();
  await navigation.goToDomainData();
  await navigation.goTobodytype();

  //Verify the Edit and Verify the bodytype functionality
await editBodyType.editAndVerifyBodyType(testInfo)

  Reporter.endTest(testInfo);
});
