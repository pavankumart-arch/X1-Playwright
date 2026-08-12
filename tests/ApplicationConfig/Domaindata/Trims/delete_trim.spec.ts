import { test } from '@playwright/test';
import { Login } from '../../../../pages/Login/Loginpage';
import { LeftsideNavigation } from '../../../../pages/Navigations/LeftSideNavigation';
import { Reporter } from '../../../../pages/utils/NewReport';
import { NavigatetoTrim } from '../../../../pages/ApplicationConfig/DomainData/Trim/NavigateTrim';
import { TrimColumns } from '../../../../pages/ApplicationConfig/DomainData/Trim/columns_trim';
import { DeleteTrim } from '../../../../pages/ApplicationConfig/DomainData/Trim/delete_Trim';


test('Verify that the Delete Trim functionality', async ({ page }, testInfo) => {

  Reporter.startTest();

  const login = new Login(page);
  const navigation = new LeftsideNavigation(page);
  const vavigatetoTrim = new NavigatetoTrim(page);
  const deleteTrim=new DeleteTrim(page)

  await login.navigateToURL();
  await login.loginToApplication();

  await navigation.gotoApplicationConfig();
  await navigation.goToDomainData();

  //Navigate to Trim Page
  await vavigatetoTrim.clickOnMakeName(testInfo);
  await vavigatetoTrim.clickOnModelName(testInfo);

  //Verify the Delete Trim
  await deleteTrim.completeAddDeleteTrimFlow(testInfo)

  Reporter.endTest(testInfo);
});
