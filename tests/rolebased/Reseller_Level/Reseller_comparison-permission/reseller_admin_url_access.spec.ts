import { test } from '@playwright/test';
import { Login } from '../../../../pages/Login/Loginpage';
import UrlsuperamdinAccess from '../../../../testdata/UrlAccess/UrlAccess_reselleradmin.json';
import { rooftopUserAccess } from '../../../../pages/UserAccess/UserAccess_url_rooftopviewer';

test('Verify Reseller Admin URL Access', async ({ page }, testInfo) => {

    test.setTimeout(120000);

    // Login as Reseller Admin
    const loginPage = new Login(page);

    await loginPage.navigateToURL();
    await loginPage.loginByRole('Reseller_Admin' as any);

    // Verify URL access for Reseller Admin
    const userAccess = new rooftopUserAccess(page);

    await userAccess.validateUrls(UrlsuperamdinAccess as any, testInfo);
});