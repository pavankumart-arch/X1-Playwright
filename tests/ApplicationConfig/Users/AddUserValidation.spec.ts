import { test } from '@playwright/test';

import { Login } from '../../../pages/Login/Loginpage';
import { LeftsideNavigation } from '../../../pages/Navigations/LeftSideNavigation';
import { UserValidation } from '../../../pages/ApplicationConfig/Users/AddUserValidation';

test.describe('User Validation', () => {

  test('Verify all User validations', async ({ page }, testInfo) => {

    const login = new Login(page);
    const navigation = new LeftsideNavigation(page);
    const userValidation = new UserValidation(page);

    // ======================================================
    // LOGIN
    // ======================================================

    await login.navigateToURL();
    await login.loginToApplication();

    // ======================================================
    // NAVIGATE TO USERS
    // ======================================================

    await navigation.gotoApplicationConfig();
    await navigation.goToUsers();

    // ======================================================
    // Click on Adduser button
    // ======================================================
    await userValidation.clickOnAddUserButton();
    

    // VERIFY SPELL CHECKS
    // ======================================================

    await userValidation.verifyspellcheckfortheinputfields(testInfo);

//     // ======================================================
//     // VERIFY PLACEHOLDERS
//     // ======================================================

//     await userValidation.verifyplaceholdertextfortheinputfields(testInfo);

//     // ======================================================
//     // VERIFY REQUIRED VALIDATIONS
//     // ======================================================

//     await userValidation.verifythevalidationmessagesfortheinputfields(testInfo);

//     // ======================================================
//     // VERIFY INVALID DATA VALIDATIONS
//     // ======================================================

//     await userValidation.verifythevalidationmessagesfortheinputfieldswithinvaliddata(testInfo);

  });

});