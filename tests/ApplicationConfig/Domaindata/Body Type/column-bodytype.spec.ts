import { test } from '@playwright/test';
import { Login } from '../../../../pages/Login/Loginpage';
import { LeftsideNavigation } from '../../../../pages/Navigations/LeftSideNavigation';
import { Reporter } from '../../../../pages/utils/NewReport';
import { EditBodyType } from '../../../../pages/ApplicationConfig/DomainData/Body Types/edit_bodytype';
import { BodyTypeColumns } from '../../../../pages/ApplicationConfig/DomainData/Body Types/column_bodytype';



test('Verify that the Column in the bodytype summery page', async ({ page }, testInfo) => {

  Reporter.startTest();

  const login = new Login(page);
  const navigation = new LeftsideNavigation(page);
 const codyTypeColumns = new BodyTypeColumns(page);

  await login.navigateToURL();
  await login.loginToApplication();

  await navigation.gotoApplicationConfig();
  await navigation.goToDomainData();
  await navigation.goTobodytype();

  //Verify the Columns in the BodyType Summery page.
await codyTypeColumns.verifyBodyTypeColumnHeaders(testInfo)

  Reporter.endTest(testInfo);
});
