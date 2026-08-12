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
    // CLICK ON ADD USER BUTTON
    // ======================================================

    await userValidation.clickOnAddUserButton();

    // ======================================================
    // VERIFY LABELS AND BUTTON TEXT
    // ======================================================

    await userValidation.verifyLabelsAndButtonText(testInfo);

    // ======================================================
    // VERIFY PLACEHOLDER TEXT
    // ======================================================

    await userValidation.verifyPlaceholderText(testInfo);

    // ======================================================
    // VERIFY REQUIRED FIELD VALIDATIONS
    // ======================================================

    await userValidation.verifyRequiredFieldValidations(testInfo);

    // ======================================================
    // VERIFY INVALID FIELD VALIDATIONS
    // ======================================================

    await userValidation.verifyInvalidFieldValidations(testInfo);

  });

});