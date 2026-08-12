import { test, expect } from '@playwright/test';
import { Login } from '../../../../pages/Login/Loginpage';
import { LeftsideNavigation } from '../../../../pages/Navigations/LeftSideNavigation';
import { AddModel } from '../../../../pages/ApplicationConfig/DomainData/Model/AddModel';
import { modelvalidation } from '../../../../pages/ApplicationConfig/DomainData/Model/ModelValidation';
import { Reporter } from '../../../../pages/utils/NewReport';
import { Addandverification } from '../../../../pages/ApplicationConfig/DomainData/Model/UpdateModel';

test.describe('Verify Added Model functionality', () => {
  test('Verify the Added Model for the model page', async ({ page }, testInfo) => {
    Reporter.startTest();
    
    const login = new Login(page);
    const navigation = new LeftsideNavigation(page);
    const addModel = new AddModel(page);
    const addandverification = new Addandverification(page);

    await login.navigateToURL();
    await login.loginToApplication();
    await navigation.gotoApplicationConfig();
    await navigation.goToDomainData();
   await addModel.createAndVerifyMake(testInfo);
    await addModel.clickOnMakeName(testInfo);
    await addModel.verifyAddModelButtonIsVisible(testInfo);
    await addandverification.verifyAddedModelInEditPage(testInfo)
    
    Reporter.endTest(testInfo);
  });
});