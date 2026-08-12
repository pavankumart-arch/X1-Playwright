import { test, expect } from '@playwright/test';
import { Login } from '../../../../pages/Login/Loginpage';
import { LeftsideNavigation } from '../../../../pages/Navigations/LeftSideNavigation';
import { AddModel } from '../../../../pages/ApplicationConfig/DomainData/Model/AddModel';
import { ModelColumns } from '../../../../pages/ApplicationConfig/DomainData/Model/ColumnsModel';
import { Reporter } from '../../../../pages/utils/NewReport';


test.describe('Verify Column functionality', () => {
  test('Verify the column functionality', async ({ page }, testInfo) => {
    Reporter.startTest();
    
    const login = new Login(page);
    const navigation = new LeftsideNavigation(page);
    const addModel = new AddModel(page);
    const modelColumns = new ModelColumns(page);

    await login.navigateToURL();
    await login.loginToApplication();
    await navigation.gotoApplicationConfig();
    await navigation.goToDomainData();
    await addModel.createAndVerifyMake(testInfo);
   await addModel.clickOnMakeName(testInfo);
   await modelColumns.verifyModleColumnHeaders(testInfo);
    
    Reporter.endTest(testInfo);
  });
});