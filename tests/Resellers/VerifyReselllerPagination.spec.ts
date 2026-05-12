import { test, expect } from '@playwright/test'
import { Login } from '../../pages/Login/Loginpage';
import { LeftsideNavigation } from '../../pages/Navigations/LeftSideNavigation';
import { ResellerPagination } from '../../pages/Resellers/ResellerPagination';

test('Verify Reseller Pagination', async ({ page }) => {
    const loginPage = new Login(page);
    const leftsideNavigation = new LeftsideNavigation(page);
    const resellerPagination = new ResellerPagination(page);

    await loginPage.navigateToURL();
    await loginPage.loginToApplication();
    await page.waitForTimeout(2000);
    await leftsideNavigation.goToDashboard();
    await leftsideNavigation.goToResellers();

    const results = await resellerPagination.verifyAllPagination();

    for (const { step, expected, actual } of results) {
        const status = expected === actual ? 'PASS ✅' : 'FAIL ❌';
        const message = `🔍 ${step} → Expected: ${expected} | Actual: ${actual} | ${status}`;
        test.info().annotations.push({ type: 'Result', description: message });
        if (expected !== actual) {
            throw new Error(message);
        }
    }
});