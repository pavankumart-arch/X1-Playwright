import { Locator, type Page } from '@playwright/test'
import { BasePage } from '../BasePage';

export class LeftsideNavigation extends BasePage{
    
    Resellers:Locator
    Rooftops:Locator
    Dashboard:Locator
    ListofRooftops:Locator
    ApplicationConfig:Locator
    Users:Locator
    Domaindata:Locator
    constructor(page:Page){
        super(page)
        this.Resellers = this.page.locator('span:text("Resellers")');
        this.Rooftops=this.page.getByText('Rooftops')
        this.Dashboard=this.page.getByText('Dashboard')
        this.ListofRooftops=this.page.getByText('List Rooftops')
        this.ApplicationConfig=this.page.getByText('Application Config')
        this.Users=this.page.getByText('Users')
        this.Domaindata=this.page.getByText('Domain data')
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
}
async gotoApplicationConfig(){
    await this.clickOnElement(this.ApplicationConfig)
}
async goToUsers(){
    await this.clickOnElement(this.Users)

}
async goToDomainData(){
    await this.clickOnElement(this.Domaindata)
}}