import { test, expect } from '@playwright/test';
import { Login } from '../../../../pages/Login/Loginpage';
import { LeftsideNavigation } from '../../../../pages/Navigations/LeftSideNavigation';
import { AddModel } from '../../../../pages/ApplicationConfig/DomainData/Model/AddModel';
import { ModelPagination } from '../../../../pages/ApplicationConfig/DomainData/Model/PaginationModel';
import { Reporter } from '../../../../pages/utils/NewReport';


test.describe('Verify Pagination functionality', () => {
  test('Verify the pagination functionality', async ({ page }, testInfo) => {
    Reporter.startTest();
    
    const login = new Login(page);
    const navigation = new LeftsideNavigation(page);
    const addModel = new AddModel(page);
    const modelPagination = new ModelPagination(page);

    await login.navigateToURL();
    await login.loginToApplication();
    await navigation.gotoApplicationConfig();
    await navigation.goToDomainData();
    await addModel.createAndVerifyMake(testInfo);
    await addModel.createAndVerifyMake(testInfo);
   await addModel.clickOnMakeName(testInfo);
  
    Reporter.endTest(testInfo);
  });
});