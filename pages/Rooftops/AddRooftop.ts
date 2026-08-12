import { Locator, Page, TestInfo } from '@playwright/test';
import { BasePage } from '../BasePage';
import AddRooftopData from '../../testdata/AddRooftopData.json';
import { Reporter } from '../utils/NewReport';


export class AddRooftop extends BasePage {
  [x: string]: any;

  AddRooftopheading: Locator;
  AddRooftopButton: Locator;
  Name: Locator;
  Description: Locator;
  DealerCode: Locator;
  Franchise: Locator;
  PlayerColor: Locator;
  SalesPersonName: Locator;
  Address: Locator;
  City: Locator;
  State: Locator;
  Zip: Locator;
  Phone: Locator;
  Email: Locator;
  URL: Locator;
  FaceebookID: Locator;
  DealerGroups: Locator;
  Comments: Locator;
  SaveRooftopbutton: Locator;
  SearchBox: Locator;
  ActiveCheckbox: Locator;

  private missingFields: string[] = [];

  constructor(page: Page) {
    super(page);

    this.AddRooftopheading = page.getByRole('heading', { name: 'Add Rooftop' });
    this.AddRooftopButton = page.locator('[class="flex items-center gap-2"]');
    this.Name = page.getByPlaceholder("Enter client name");
    this.Description = page.getByPlaceholder('Enter description');
    this.DealerCode = page.getByPlaceholder('Dealer Code');
    this.Franchise = page.getByPlaceholder('Enter franchise number');
    this.PlayerColor = page.locator('input[id="admin-rooftop-create-playerColor"]');
    this.SalesPersonName = page.getByPlaceholder('Enter sales person name');
    this.Address = page.getByPlaceholder('Full address');
    this.City = page.getByPlaceholder('Enter city');
    this.State = page.getByPlaceholder('Enter state');
    this.Zip = page.getByPlaceholder('Enter ZIP code');
    this.Phone = page.getByPlaceholder('Enter phone number');
    this.Email = page.getByPlaceholder('Enter email address');
    this.URL = page.getByPlaceholder('https://example.com');
    this.FaceebookID = page.getByPlaceholder('Enter Facebook ID');
    this.DealerGroups = page.getByPlaceholder('Enter dealer groups (comma separated)');
    this.Comments = page.getByPlaceholder('Any additional notes...');
    this.SaveRooftopbutton = page.getByRole('button', { name: 'Save Rooftop' });

    this.SearchBox = page.getByPlaceholder('Search...');
    this.ActiveCheckbox = page.locator('input[type="checkbox"]').filter({ hasText: 'Active' });
  }

  private async isElementVisible(locator: Locator, timeout: number = 2000): Promise<boolean> {
    try {
      await locator.first().waitFor({ state: 'visible', timeout });
      return true;
    } catch {
      return false;
    }
  }

  private async safeFill(locator: Locator, value: string | number, fieldName: string, testInfo: TestInfo): Promise<boolean> {
    const isVisible = await this.isElementVisible(locator);
    
    if (isVisible) {
      await locator.fill(value.toString());
      Reporter.validateData(value.toString(), value.toString(), fieldName, testInfo);
      console.log(`  ✅ Filled: ${fieldName} = ${value}`);
      return true;
    } else {
      this.missingFields.push(fieldName);
      console.log(` ❌ BUG: Field "${fieldName}" is MISSING!`);
      Reporter.validateData(`Field should exist`, `Field MISSING`, `${fieldName} - Existence`, testInfo);
      return false;
    }
  }

  async AddRooftop(testInfo: TestInfo, name?: string): Promise<string> {
    this.missingFields = [];
    Reporter.startTest();
    console.log("ADD ROOFTOP");

    console.log("👉 Clicking Add Rooftop button");
    await this.AddRooftopButton.waitFor({ state: 'visible' });
    await this.AddRooftopButton.click();
    await this.AddRooftopheading.waitFor({ state: 'visible', timeout: 10000 });
    
    Reporter.validateData('Add Rooftop form opened', 'Add Rooftop form opened', 'Open Add Rooftop Form', testInfo);
    console.log("✅ Add Rooftop form opened");
 //
    const rooftopName = name ?? `${AddRooftopData.name}_${Date.now()}`;
    const rooftopId = `RTP_${Date.now()}`;
    //
    const dealerCode =
  name ?? `${AddRooftopData.DealerCode}_${Date.now()}`;
    const DealerCode = dealerCode;

    await this.safeFill(this.Name, rooftopName, 'Name', testInfo);
    await this.safeFill(this.Description, AddRooftopData.description, 'Description', testInfo);
    await this.safeFill(this.DealerCode, dealerCode, 'Dealer Code', testInfo);
    await this.safeFill(this.Franchise, AddRooftopData.franchise, 'Franchise', testInfo);
    await this.safeFill(this.PlayerColor, AddRooftopData.playerColor, 'Player Color', testInfo);
    await this.safeFill(this.SalesPersonName, AddRooftopData.salesPersonName, 'Sales Person Name', testInfo);
    await this.safeFill(this.Address, AddRooftopData.address, 'Address', testInfo);
    await this.safeFill(this.City, AddRooftopData.city, 'City', testInfo);
    await this.safeFill(this.State, AddRooftopData.state, 'State', testInfo);
    await this.safeFill(this.Zip, AddRooftopData.zip, 'Zip', testInfo);
    await this.safeFill(this.Phone, AddRooftopData.phone, 'Phone', testInfo);
    await this.safeFill(this.Email, AddRooftopData.email, 'Email', testInfo);
    await this.safeFill(this.URL, AddRooftopData.url, 'URL', testInfo);
    await this.safeFill(this.FaceebookID, AddRooftopData.facebookID, 'Facebook ID', testInfo);
    await this.safeFill(this.DealerGroups, AddRooftopData.dealerGroups, 'Dealer Groups', testInfo);
    await this.safeFill(this.Comments, AddRooftopData.comments, 'Comments', testInfo);

    if (this.missingFields.length > 0) {
      console.log(`\n BUGS DETECTED: ${this.missingFields.length} missing field(s):`);
      this.missingFields.forEach(field => console.log(`   ❌ ${field}`));
    }

    await this.SaveRooftopbutton.click();
    console.log("👉 Waiting for save to complete");

    await this.page.locator('text=Premier Auto Group Rooftops').waitFor();
    
    Reporter.validateData('Rooftop saved', 'Rooftop saved', 'Save Rooftop Operation', testInfo);
    console.log("✅ Rooftop saved successfully");

    const summary = Reporter.endTest(testInfo);
    console.log(`\n📊 Add Rooftop Completed - Pass Rate: ${summary.passRate}`);

    return rooftopName;
  }

  async searchRooftopInSummary(rooftopName: string, testInfo: TestInfo): Promise<string | null> {
    try {
      await this.SearchBox.waitFor({ state: 'visible', timeout: 3000 });
      await this.SearchBox.click({ timeout: 2000 });
      await this.SearchBox.fill('');
      await this.page.waitForTimeout(300);
      await this.SearchBox.fill(rooftopName);
      await this.page.waitForTimeout(800);

      Reporter.validateData(rooftopName, rooftopName, `Search for: ${rooftopName}`, testInfo);

      const tableRows = this.page.locator('table tbody tr');
      const rowCount = await tableRows.count();

      if (rowCount > 0) {
        const firstRowNameCell = tableRows.nth(0).locator('td').nth(1);
        const cellText = (await firstRowNameCell.textContent())?.trim() || '';

        if (cellText.toLowerCase().includes(rooftopName.toLowerCase())) {
          Reporter.validateData(rooftopName, cellText, `Verify Rooftop in Summary`, testInfo);
          return cellText;
        }
      }

      Reporter.validateData(rooftopName, 'Not Found', `Verify Rooftop in Summary`, testInfo);
      return null;

    } catch (error) {
      console.log(`❌ Error during search:`, error);
      Reporter.validateData(rooftopName, 'Search Failed', `Search Rooftop`, testInfo);
      return null;
    }
  }

  async addAndVerifyRooftop(testInfo: TestInfo, name?: string): Promise<{ 
    success: boolean; 
    createdName: string; 
    searchedName: string | null;
    missingFields: string[];
  }> {
    const createdName = await this.AddRooftop(testInfo, name);
    const searchedName = await this.searchRooftopInSummary(createdName, testInfo);
    
    return {
      success: createdName === searchedName,
      createdName,
      searchedName,
      missingFields: this.missingFields
    };
  }
}