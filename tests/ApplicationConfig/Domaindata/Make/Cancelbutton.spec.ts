import { test } from '@playwright/test';
import { Login } from '../../../../pages/Login/Loginpage';
import { LeftsideNavigation } from '../../../../pages/Navigations/LeftSideNavigation';
import { Cancelbutton } from '../../../../pages/ApplicationConfig/DomainData/Make/CancelMake';
import { Reporter } from '../../../../pages/utils/NewReport';

test.describe('Verify the Cancel functionality', () => {
  test('Verify that clicking Cancel closes the form', async ({ page }, testInfo) => {
    Reporter.startTest();
    
    const login = new Login(page);
    const navigation = new LeftsideNavigation(page);
    const cancelbutton = new Cancelbutton(page);

    // LOGIN
    await login.navigateToURL();
    await login.loginToApplication();

    // NAVIGATION
    await navigation.gotoApplicationConfig();
    await navigation.goToDomainData();

    // VERIFY CANCEL BUTTON
    await cancelbutton.VerifyMakeCancelbutton(testInfo);
    
    Reporter.endTest(testInfo);
  });
});