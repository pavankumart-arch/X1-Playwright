import { Locator, type Page } from '@playwright/test'
import { BasePage } from '../BasePage';

export class LeftsideNavigation extends BasePage{
    
    Resellers:Locator
    Rooftops:Locator
    Dashboard:Locator
    ListofRooftops:Locator
    constructor(page:Page){
        super(page)
        this.Resellers = this.page.locator('span:text("Resellers")');
        this.Rooftops=this.page.getByText('Rooftops')
        this.Dashboard=this.page.getByText('Dashboard')
        this.ListofRooftops=this.page.getByText('List Rooftops')
    }
    async goToDashboard(){
        await this.clickOnElement(this.Dashboard)
    }
async goToResellers(){
    await this.clickOnElement(this.Resellers)
}
async goToRooftops(){
    await this.clickOnElement(this.Rooftops)

}
async goToListofRooftops(){
    await this.clickOnElement(this.ListofRooftops)
}}