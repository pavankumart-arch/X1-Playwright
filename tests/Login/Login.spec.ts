import { test } from '@playwright/test';
import { Login } from '../../pages/Login/Loginpage';
import { Reporter } from '../../pages/utils/NewReport';

test.describe('Login Validation Test Suite', () => {

    test(
        'Verify the Login functionality',
        async ({ page }, testInfo) => {

            Reporter.startTest();

            const loginPage = new Login(page);

            await loginPage.navigateToURL();

            await loginPage.verifyLoginAndLogout(
                testInfo
            );

            Reporter.endTest(testInfo);
        }
    );

});