import page, { expect, Locator, Page } from '@playwright/test'
import { BasePage } from '../BasePage';
import { LeftsideNavigation } from '../Navigations/LeftSideNavigation';


export class VerifyBacktoReseller extends BasePage{
AddResellerButton:Locator
BackToResellerButton:Locator
    
    constructor(page:Page){
        super(page)
        this.AddResellerButton = this.page.locator('button[class="btn btn-primary"]');
        this.BackToResellerButton=this.page.locator('button[class="btn btn-outline btn-sm"]') 
        
    }
    async VerifyResellerBacktoResellerbutton() {
    try {
        await this.clickOnElement(this.AddResellerButton) // Click the "Add Reseller" button to open the form
        await this.clickOnElement(this.BackToResellerButton) // Click the "Cancel" button to close the form
        await expect.soft(this.AddResellerButton).toBeVisible() // Verify the "Add Reseller" button is visible again, indicating the form is closed

        // ✅ SUCCESS LOG
        console.log('✅ BackTo Reseller Button Functionality is working as expected');

    } catch (error) {
        // ❌ FAILURE LOG
        console.log('❌ BackTo ResellerButton Functionality is working as expected');
        console.error(error);

        // optional: rethrow to fail test
        throw error;
    }
}
}   