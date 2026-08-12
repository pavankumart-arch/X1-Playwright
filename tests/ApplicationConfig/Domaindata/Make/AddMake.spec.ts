import { test, expect } from '@playwright/test';
import { Login } from '../../../../pages/Login/Loginpage';
import { LeftsideNavigation } from '../../../../pages/Navigations/LeftSideNavigation';
import { AddMake } from '../../../../pages/ApplicationConfig/DomainData/Make/AddMake';
import { Reporter } from '../../../../pages/utils/NewReport';


test.describe('Verify Add Make functionality', () => {
  test('Verify that the added Make appears in the summary table', async ({ page }, testInfo) => {
    Reporter.startTest();
    
    const login = new Login(page);
    const navigation = new LeftsideNavigation(page);
    const addMake = new AddMake(page);

    // LOGIN
    await login.navigateToURL();
    await login.loginToApplication();

    // NAVIGATE TO MAKE
    await navigation.gotoApplicationConfig();
    await navigation.goToDomainData();

    // ADD MAKE
    await addMake.addMake(testInfo);

    // VERIFY MAKE IN SUMMARY TABLE
    await addMake.verifyAddedMakeIsDisplayed(testInfo);
    
    Reporter.endTest(testInfo);
  });
});