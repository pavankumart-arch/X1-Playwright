import { test } from '@playwright/test';
import { Login } from '../../../../pages/Login/Loginpage';
import { LeftsideNavigation } from '../../../../pages/Navigations/LeftSideNavigation';
import { AddModel } from '../../../../pages/ApplicationConfig/DomainData/Model/AddModel';
import { Reporter } from '../../../../pages/utils/NewReport';

test.describe('Verify Add Model functionality', () => {
  test('Verify that the added Model appears in the summary table', async ({ page }, testInfo) => {
    Reporter.startTest();
    
    const login = new Login(page);
    const navigation = new LeftsideNavigation(page);
    const addModel = new AddModel(page);

    await login.navigateToURL();
    await login.loginToApplication();
    await navigation.gotoApplicationConfig();
    await navigation.goToDomainData();
    await addModel.createAndVerifyMake(testInfo);
    await addModel.clickOnMakeName(testInfo);
    await addModel.verifyAddModelButtonIsVisible(testInfo);
    await addModel.addModel(testInfo);
    await addModel.verifyAddedModelIsDisplayed(testInfo);
    
    Reporter.endTest(testInfo);
  });
});