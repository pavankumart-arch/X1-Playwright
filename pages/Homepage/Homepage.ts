import page, { expect, Locator, Page } from '@playwright/test'
import { BasePage } from '../BasePage';
export class Homepage extends BasePage{
    static VerifytheLogoutfunctionality() {
        throw new Error('Method not implemented.');
    }
    static verifytheEVSLogo() {
        throw new Error('Method not implemented.');
    }
    Logo:Locator
    LogoutArrow:Locator
    Logout:Locator
    constructor(page:Page){
        super(page)
        this.Logo=this.page.locator('img[alt="Logo"]')
        //this.LogoutArrow=this.page.locator('[class*="w-4 h-4"]');
        this.LogoutArrow=this.page.locator('[class*="text-xs text-gray-500 leading-none mt-0.5"]');
        this.Logout=this.page.getByRole('button', {name:"Log Out"})
    }
    async VerifytheEVSLogo(){
        const EVSLogo=this.Logo
        if (await EVSLogo.isVisible()) {
        console.log('✅ EVS Logo is successfully verified');
    } else {
        console.log('❌ EVS Logo is NOT visible');
        throw new Error('EVS Logo verification failed');
    }

    }
    async VerifytheLogoutfunctionality(){
        await this.clickOnElement(this.LogoutArrow)
          await this.page.waitForTimeout(2000)
        await this.clickOnElement(this.Logout)
}}

