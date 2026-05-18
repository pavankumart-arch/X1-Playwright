import { test, expect } from '@playwright/test';
import { Login } from '../../pages/Login/Loginpage';

test.describe(
  'Login Validation Test Suite',
  () => {

    test(
      'Verify the Login functionality',
      async ({ page }, testInfo) => {

        const loginPage = new Login(page);

        // Navigate to URL
        await loginPage.navigateToURL();

        // Login
        const homePage =
          await loginPage.loginToApplication();

        // ✅ Dynamic Values
        const expectedResult = 'Homepage should be displayed after login';

        const actualResult =
          homePage !== null
            ? 'Homepage displayed successfully'
            : 'Homepage not displayed';

        const loginStatus =
          homePage !== null ? 'PASS' : 'FAIL';

        // ✅ TOP REPORT
        testInfo.annotations.push({
          type: 'REPORT : 1',
          description:
`Verify Login functionality
STATUS   : ${loginStatus} ${loginStatus === 'PASS' ? '✅' : '❌'}
EXPECTED : ${expectedResult}
ACTUAL   : ${actualResult}`
        });

        // Assertion
        expect(homePage).not.toBeNull();

        // Verify Logo
        await homePage!.VerifytheEVSLogo();

        // Logout
        await homePage!.VerifytheLogoutfunctionality();
      }
    );
  }
);