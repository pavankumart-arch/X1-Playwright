import { test, Page } from '@playwright/test'
import { Login } from '../../pages/Login/Loginpage';;
import { LeftsideNavigation } from '../../pages/Navigations/LeftSideNavigation';
import { VerifyBacktoReseller } from '../../pages/Resellers/BackToResellerbutton';

test('Verify Back to Reseller Button', async ({ page }) => {
    const loginPage = new Login(page);
    const leftsideNavigation=new LeftsideNavigation(page)
    const verifyBacktoReseller=new VerifyBacktoReseller(page)
    await loginPage.navigateToURL();
    await loginPage.loginToApplication();
    await page.waitForTimeout(2000)
    await leftsideNavigation.goToResellers();
    await page.waitForTimeout(2000)
    await verifyBacktoReseller.VerifyResellerBacktoResellerbutton();
});