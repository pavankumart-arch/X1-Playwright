import { test } from '@playwright/test';
import { Login } from '../../../../pages/Login/Loginpage';
import { LeftsideNavigation } from '../../../../pages/Navigations/LeftSideNavigation';
import { EditModel } from '../../../../pages/ApplicationConfig/DomainData/Model/EditModel';
import { Reporter } from '../../../../pages/utils/NewReport';

test.describe('Verify Edit Model functionality', () => {
  test('Verify that the Edit Model appears in the summary table', async ({ page }, testInfo) => {

    Reporter.startTest();

    try {
      const login = new Login(page);
      const navigation = new LeftsideNavigation(page);
      const editModel = new EditModel(page);

      await login.navigateToURL();
      await login.loginToApplication();
      await navigation.gotoApplicationConfig();
      await navigation.goToDomainData();

      await editModel.editAndVerifyModel(testInfo);

    } finally {
      Reporter.endTest(testInfo);
    }
  });
});
