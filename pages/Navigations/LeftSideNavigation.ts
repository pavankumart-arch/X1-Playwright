import { expect, Locator, type Page } from '@playwright/test'
import { BasePage } from '../BasePage';

export class LeftsideNavigation extends BasePage{
    
    Resellers:Locator
    Rooftops:Locator
    Dashboard:Locator
    ListofRooftops:Locator
    Inventory:Locator
    ApplicationConfig:Locator
    Users:Locator
    Domaindata:Locator
    Year:Locator
    Colors:Locator;
    bodytype:Locator;
    SystemConfigbutton:Locator
    Taxonomybutton:Locator
    appTypebutton:Locator
    AddAppTypebutton:Locator
    UserRolesbutton:Locator
    AdduserRolebutton:Locator
    UserTypesbutton:Locator
    AddUserTypebutton:Locator
    NavGroupbutton:Locator
    AddNavGroupButton: Locator;
    Other: Locator;
    rooftopUser:Locator;

    
    constructor(page:Page){
        super(page)
        this.Resellers = this.page.locator('span:text("Resellers")');
        this.Rooftops=this.page.getByText('Rooftops')
        //  this.Dashboard=this.page.getByText('Dashboard')
 this.Dashboard = this.page.getByRole('link', {
    name: 'Dashboard',
    exact: true
});
        this.ListofRooftops=this.page.getByText('List Rooftops')
        this.Inventory=this.page.getByText('Inventory')
        this.ApplicationConfig=this.page.getByText('Application Config')
        this.Users=this.page.getByText('Users')
        this.Domaindata=this.page.getByText('Domain data')
        this.Year=this.page.getByText('Years')
        this.Colors=this.page.getByText('Colors')
        this.bodytype=this.page.getByText('Body Types')
        this.SystemConfigbutton =this.page.locator('text=System Config');
         this.Taxonomybutton = page.locator('text=Taxonomy');
         this.appTypebutton = page.locator('text=AppTypes');
         this.AddAppTypebutton = page.locator('text=Add AppType');
         this.UserRolesbutton = page.locator('text=User Roles');
         this.AdduserRolebutton = page.locator('button:has-text("Role")').nth(1);
         this.UserTypesbutton = this.page.getByText('User Types');
         this.AddUserTypebutton = this.page.getByRole('button', {name: 'User Type',exact: true});
         this.NavGroupbutton = page.locator('text=Nav Group');
    this.AddNavGroupButton = page.getByRole('button', {name: /\+?\s*Nav Group/i})
         //this.Other = this.page.locator('aside:has-text("Other")').first();
         this.Other=this.page.getByText('Other');
 this.rooftopUser = this.page.locator(
    'xpath=(//a[@href="/rooftops/users/list"])[2]'
);  }
    

async goToDashboard(){
        await this.clickOnElement(this.Dashboard)
    }
async goToResellers(){
    await this.clickOnElement(this.Resellers)
}
async goToRooftops(){
    await this.clickOnElement(this.Rooftops)

}
async goToInventory(){
    await this.clickOnElement(this.Inventory)
}
async goToListofRooftops(){
    await this.clickOnElement(this.ListofRooftops)
}
async gotoApplicationConfig(){
    await this.clickOnElement(this.ApplicationConfig)
}
//other navigation methods
async goToOther(){
    await this.clickOnElement(this.Other)
}
//Rooftop User navigation methods
async goToRooftopUsers(){
   await this.clickOnElement(this.rooftopUser)
}



async goToUsers(){
    await this.clickOnElement(this.Users)

//It is for Domain module
}
async goToDomainData(){
    await this.clickOnElement(this.Domaindata)
}
async gotoDomainyear(){
    await this.clickOnElement(this.Year)
}

async goToColors(){
    await this.clickOnElement(this.Colors)
}
async goTobodytype(){
    await this.clickOnElement(this.bodytype)
}



async gotoSystemConfig(){
    await this.clickOnElement(this.SystemConfigbutton)
}
async goToTaxonomy(){
    await this.clickOnElement(this.Taxonomybutton)
}
async goToUserRoles(){
    await this.clickOnElement(this.UserRolesbutton)
   
await expect(this.page).toHaveURL(/role\/list/);
 
console.log('Current URL:', this.page.url());
}
async goToAppTypes(){
    await this.clickOnElement(this.appTypebutton)
}
async AddAppType(){
    await this.clickOnElement(this.AddAppTypebutton)
}
async clickAddRole(){
     await this.AdduserRolebutton.waitFor({
        state: 'visible',
        timeout: 10000
    });  
    await this.clickOnElement(this.AdduserRolebutton)
    await this.page.waitForLoadState('networkidle');
 
await this.page.waitForTimeout(2000);
}
async gotoAddUserType(){
    await this.clickOnElement(this.UserTypesbutton)
}

 
async gotoNavGroup()
{
    console.log("👉 Navigating to Nav Group");
 
 
 
  await this.NavGroupbutton.waitFor({ state: 'visible', timeout: 10000 });
 
  await this.NavGroupbutton.click();
 
  await this.page.waitForLoadState('networkidle');
 
  console.log("✅ Navigated to Nav Group page");
  await this.page.waitForTimeout(2000);
 
 
}
//Navigation verification methods
// Verify menu is visible
async verifyMenuVisible(menu: Locator, menuName: string) {
    await expect(menu, `${menuName} should be visible`).toBeVisible();
    console.log(`✅ ${menuName} is visible`);
}

// Verify menu is not visible
async verifyMenuNotVisible(menu: Locator, menuName: string) {
    await expect(menu, `${menuName} should not be visible`).toHaveCount(0);
    console.log(`✅ ${menuName} is not visible`);
}
}
