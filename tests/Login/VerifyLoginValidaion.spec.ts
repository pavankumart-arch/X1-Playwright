import { test } from '@playwright/test';
import { LoginValidation } from '../../pages/Login/LoginValidation';

test.describe('Login Validation Test Suite', () => {

    test(
        'Verify all login validations',
        async ({ page }, testInfo) => {

            const loginValidation = new LoginValidation(page)

            await loginValidation.navigatetoURL()

            // ✅ Empty Username & Password
            await loginValidation.verifyEmptyCredentials(testInfo)

            // ✅ Empty Username
            await loginValidation.verifyEmptyUsername(testInfo)

            // ✅ Empty Password
            await loginValidation.verifyEmptyPassword(testInfo)

            // ✅ Invalid Credentials
            await loginValidation.verifyInvalidCredentials(testInfo)

            // ✅ Case Sensitive Password
            await loginValidation.verifyCaseSensitivePassword(testInfo)

            // ✅ Valid Login
            await loginValidation.verifyValidLogin(testInfo)
        }
    )
})