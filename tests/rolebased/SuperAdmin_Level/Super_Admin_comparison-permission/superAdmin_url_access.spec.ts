import { test } from '@playwright/test';
import UrlsuperamdinAccess from '../../../../testdata/UrlAccess/UrlAccess_superAdmin.json';
import { rooftopUserAccess } from '../../../../pages/UserAccess/UserAccess_url_rooftopviewer';
import { Login } from '../../../../pages/Login/Loginpage';

test('Verify SuperAdmin URL Access', async ({ page }, testInfo) => {

    test.setTimeout(120000);

    // Login as SuperAdmin
    const loginPage = new Login(page);

    await loginPage.navigateToURL();
    await loginPage.loginByRole('Super_Admin' as any);

    // Verify URL access for SuperAdmin
    const userAccess = new rooftopUserAccess(page);

    await userAccess.validateUrls(UrlsuperamdinAccess as any, testInfo);
});