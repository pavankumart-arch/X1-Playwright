import { test } from '@playwright/test';
import { Login } from '../../../../pages/Login/Loginpage';
import { LeftsideNavigation } from '../../../../pages/Navigations/LeftSideNavigation';
import { Reporter } from '../../../../pages/utils/NewReport'
import { DeleteYear } from '../../../../pages/ApplicationConfig/DomainData/Year/delete_year';


test('Verify that the Delete Year functionality', async ({ page }, testInfo) => {

  Reporter.startTest();

  const login = new Login(page);
  const navigation = new LeftsideNavigation(page);
  const deleteYear=new DeleteYear(page)

  await login.navigateToURL();
  await login.loginToApplication();

  await navigation.gotoApplicationConfig();
  await navigation.goToDomainData();
  await navigation.gotoDomainyear();

  //Verify the delete year functionality
 await deleteYear.completeAddDeleteYearFlow(testInfo)

  Reporter.endTest(testInfo);
});
