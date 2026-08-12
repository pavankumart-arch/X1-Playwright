import { test } from '@playwright/test';
import { Login } from '../../../../pages/Login/Loginpage';
import { LeftsideNavigation } from '../../../../pages/Navigations/LeftSideNavigation';
import { makevalidation } from '../../../../pages/ApplicationConfig/DomainData/Make/MakeValidation';
import { Reporter } from '../../../../pages/utils/NewReport';

test.describe('Verify Add Make functionality', () => {
  test('Verify Add Make Page UI Validation', async ({ page }, testInfo) => {
    Reporter.startTest();
    
    const login = new Login(page);
    const navigation = new LeftsideNavigation(page);
    const makeValidation = new makevalidation(page);

    await login.navigateToURL();
    await login.loginToApplication();
    await navigation.gotoApplicationConfig();
    await navigation.goToDomainData();
    await makeValidation.makevalidation(testInfo);
    
    Reporter.endTest(testInfo);
  });
});