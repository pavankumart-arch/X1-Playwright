import { test } from '@playwright/test';
import { Login } from '../../../../pages/Login/Loginpage';
import { LeftsideNavigation } from '../../../../pages/Navigations/LeftSideNavigation';
import { Reporter } from '../../../../pages/utils/NewReport';
import { EditBodyType } from '../../../../pages/ApplicationConfig/DomainData/Body Types/edit_bodytype';
import { DeleteBodyType } from '../../../../pages/ApplicationConfig/DomainData/Body Types/delete_bodytype';



test('Verify that the Delete and Verify the bodytype functionality', async ({ page }, testInfo) => {

  Reporter.startTest();

  const login = new Login(page);
  const navigation = new LeftsideNavigation(page);
 const deleteBodyType = new DeleteBodyType(page);

  await login.navigateToURL();
  await login.loginToApplication();

  await navigation.gotoApplicationConfig();
  await navigation.goToDomainData();
  await navigation.goTobodytype();

  //Verify the Delete and Verify the bodytype functionality
await deleteBodyType.completeAddDeleteBodyTypeFlow(testInfo)

  Reporter.endTest(testInfo);
});
