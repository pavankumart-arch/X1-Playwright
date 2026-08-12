import { test } from '@playwright/test';
import { Login } from '../../../../pages/Login/Loginpage';
import UrlAccess from '../../../../testdata/UrlAccess/UrlAccess_rooftopviewer.json';
import { rooftopUserAccess } from '../../../../pages/UserAccess/UserAccess_url_rooftopviewer';

test('Verify Rooftop Viewer URL Access', async ({ page }, testInfo) => {

    const loginPage = new Login(page);

    await loginPage.navigateToURL();
    await loginPage.loginByRole('rooftop_viewer' as any);

    const userAccess = new rooftopUserAccess(page);

    // JSON contains AccessUrls and NoAccessUrls groups; cast to any to match expected parameter type
    await userAccess.validateUrls(UrlAccess as any, testInfo);
});