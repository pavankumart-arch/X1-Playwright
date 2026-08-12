import { test } from '@playwright/test';
import { Login } from '../../../../pages/Login/Loginpage';
import { LeftsideNavigation } from '../../../../pages/Navigations/LeftSideNavigation';
import { Reporter } from '../../../../pages/utils/NewReport';
import { DeleteColour } from '../../../../pages/ApplicationConfig/DomainData/Colour/delete_color';


test('Verify that the Delete functionality for color', async ({ page }, testInfo) => {

  Reporter.startTest();

  const login = new Login(page);
  const navigation = new LeftsideNavigation(page);
  const deleteColour=new DeleteColour(page)

  await login.navigateToURL();
  await login.loginToApplication();

  await navigation.gotoApplicationConfig();
  await navigation.goToDomainData();
  await navigation.goToColors();

  //Verify the delete functionality for Color 
 await deleteColour.completeAddDeleteColorFlow(testInfo)

  Reporter.endTest(testInfo);
});
