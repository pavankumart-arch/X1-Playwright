import { expect, Locator, Page } from '@playwright/test'
import { BasePage } from '../BasePage';

export class Homepage extends BasePage {

    Logo: Locator
    LogoutArrow: Locator
    Logout: Locator

    constructor(page: Page) {

        super(page)

        this.Logo = this.page.locator('img[alt="Logo"]')

        this.LogoutArrow = this.page.locator(
            '[class*="text-xs text-gray-500 leading-none mt-0.5"]'
        )

        this.Logout = this.page.getByRole('button', { name: "Log Out" })
    }

    // ✅ Verify EVS Logo
    async VerifytheEVSLogo() {

        await expect(this.Logo).toBeVisible()

        console.log('✅ EVS Logo is successfully verified');
    }

    // ✅ Logout Functionality
    async VerifytheLogoutfunctionality() {

        await this.clickOnElement(this.LogoutArrow)

        await this.page.waitForTimeout(2000)

        await expect(this.Logout).toBeVisible()

        await this.clickOnElement(this.Logout)

        console.log('✅ Logout successful');
    }
}