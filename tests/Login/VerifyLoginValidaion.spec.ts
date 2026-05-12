import { test } from '@playwright/test';
import { LoginValidation } from '../../pages/Login/LoginValidation';

test.describe('Login Validation Tests', () => {

    let validation: LoginValidation;  // ✅ Declare once

    test.beforeEach(async ({ page }) => {
        validation = new LoginValidation(page);  // ✅ Initialize once per test
        await validation.navigatetoURL();
    });

    test('Empty Username & Password', async () => {
        await validation.verifyEmptyCredentials();
    });

    test('Empty Username', async () => {
        await validation.verifyEmptyUsername();
    });

    test('Empty Password', async () => {
        await validation.verifyEmptyPassword();
    });

    test('Invalid Credentials', async () => {
        await validation.verifyInvalidCredentials();
    });

    test('Case Sensitive Password', async () => {
        await validation.verifyCaseSensitivePassword();
    });

    test('Valid Login', async () => {
        await validation.verifyValidLogin();
    });

});