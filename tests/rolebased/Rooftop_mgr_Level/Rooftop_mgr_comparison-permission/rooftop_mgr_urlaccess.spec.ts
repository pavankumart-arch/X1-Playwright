import { test } from '@playwright/test';
import UrlsrooftopmgrAccess from '../../../../testdata/UrlAccess/UrlAccess_rooftopmgr.json';
import { rooftopUserAccess } from '../../../../pages/UserAccess/UserAccess_url_rooftopviewer';
import { Login } from '../../../../pages/Login/Loginpage';


test('Verify Rooftop mgr URL Access', async ({ page }, testInfo) => {

    test.setTimeout(120000);

    // Login as Rooftop Manager
    const loginPage = new Login(page);

    await loginPage.navigateToURL();
    await loginPage.loginByRole('Rooftop_mgr' as any);

    // Verify URL access for Rooftop Manager
    const userAccess = new rooftopUserAccess(page);

    await userAccess.validateUrls(UrlsrooftopmgrAccess as any, testInfo);
});