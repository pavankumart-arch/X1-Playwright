import { test } from '@playwright/test';
import { Login } from '../../../../pages/Login/Loginpage';
import { LeftsideNavigation } from '../../../../pages/Navigations/LeftSideNavigation';
import { Reporter } from '../../../../pages/utils/NewReport';
import { NavigatetoTrim } from '../../../../pages/ApplicationConfig/DomainData/Trim/NavigateTrim';
import { TrimColumns } from '../../../../pages/ApplicationConfig/DomainData/Trim/columns_trim';


test('Verify that the Trim Columns in the summary table', async ({ page }, testInfo) => {

  Reporter.startTest();

  const login = new Login(page);
  const navigation = new LeftsideNavigation(page);
  const vavigatetoTrim = new NavigatetoTrim(page);
  const trimColumns=new TrimColumns(page)

  await login.navigateToURL();
  await login.loginToApplication();

  await navigation.gotoApplicationConfig();
  await navigation.goToDomainData();

  //Navigate to Trim Page
  await vavigatetoTrim.clickOnMakeName(testInfo);
  await vavigatetoTrim.clickOnModelName(testInfo);

  //Verify the Columns
  await trimColumns.verifyTrimColumnHeaders(testInfo)

  Reporter.endTest(testInfo);
});
