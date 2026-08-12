import { test } from '@playwright/test';
import { Login } from '../../../../pages/Login/Loginpage';
import { LeftsideNavigation } from '../../../../pages/Navigations/LeftSideNavigation';
import { Reporter } from '../../../../pages/utils/NewReport';
import { EditColor } from '../../../../pages/ApplicationConfig/DomainData/Colour/edit_color';

test('Verify that the Edit functionality for color', async ({ page }, testInfo) => {

  Reporter.startTest();

  const login = new Login(page);
  const navigation = new LeftsideNavigation(page);
 const editColor = new EditColor(page);

  await login.navigateToURL();
  await login.loginToApplication();

  await navigation.gotoApplicationConfig();
  await navigation.goToDomainData();
  await navigation.goToColors();

  //Verify the edit functionality for Color 
await editColor.editAndVerifyColor(testInfo);

  Reporter.endTest(testInfo);
});
