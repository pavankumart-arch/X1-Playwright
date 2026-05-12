import { test, Page } from '@playwright/test'
import { Login } from '../../pages/Login/Loginpage';
import { LeftsideNavigation } from '../../pages/Navigations/LeftSideNavigation';
import { ResellerCount } from '../../pages/Resellers/Resellerscount';

test('Verify Reseller Record Count', async ({ page }) => {
    const loginPage = new Login(page);
    const leftsideNavigation=new LeftsideNavigation(page)
     const resellerCount=new ResellerCount(page);
    await loginPage.navigateToURL();
    await loginPage.loginToApplication();
    await page.waitForTimeout(2000)
    await leftsideNavigation.goToDashboard();
    await leftsideNavigation.goToResellers();
    await page.waitForTimeout(2000)
    await resellerCount.getTotalCountFromUI();
    await resellerCount.getTotalTableCount();
    await resellerCount.verifyRecordCount();

    
});