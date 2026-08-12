import { test } from '@playwright/test';
import { Login } from '../../../../pages/Login/Loginpage';
import { LeftsideNavigation } from '../../../../pages/Navigations/LeftSideNavigation';
import { DeleteModel } from '../../../../pages/ApplicationConfig/DomainData/Model/DeleteModel';
import { Reporter } from '../../../../pages/utils/NewReport';

test('Verify Complete Add/Delete Model Flow', async ({ page }, testInfo) => {

  test.setTimeout(120000); // 2 minutes

  Reporter.startTest();

  const login = new Login(page);
  const navigation = new LeftsideNavigation(page);
  const deleteModel = new DeleteModel(page);

  await login.navigateToURL();
  await login.loginToApplication();

  await navigation.gotoApplicationConfig();
  await navigation.goToDomainData();

  await deleteModel.completeAddDeleteModelFlow(testInfo);

  Reporter.endTest(testInfo);
});