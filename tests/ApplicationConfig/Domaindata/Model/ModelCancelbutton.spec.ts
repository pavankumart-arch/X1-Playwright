import { test, expect } from '@playwright/test';
import { Login } from '../../../../pages/Login/Loginpage';
import { LeftsideNavigation } from '../../../../pages/Navigations/LeftSideNavigation';
import { AddModel } from '../../../../pages/ApplicationConfig/DomainData/Model/AddModel';
import { Cancelbutton } from '../../../../pages/ApplicationConfig/DomainData/Make/CancelMake';
import { Reporter } from '../../../../pages/utils/NewReport';


test.describe('Verify the cancel functionality', () => {
  test('Verify the functionality of cancel button', async ({ page }, testInfo) => {
    Reporter.startTest();
    
    const login = new Login(page);
    const navigation = new LeftsideNavigation(page);
    const addModel = new AddModel(page);
    const cancelbutton = new Cancelbutton(page);

    await login.navigateToURL();
    await login.loginToApplication();
    await navigation.gotoApplicationConfig();
    await navigation.goToDomainData();
    await addModel.createAndVerifyMake(testInfo);
    await addModel.clickOnMakeName(testInfo);
    await addModel.verifyAddModelButtonIsVisible(testInfo);
    await cancelbutton.VerifyMakeCancelbutton(testInfo);
    
    Reporter.endTest(testInfo);
  });
});