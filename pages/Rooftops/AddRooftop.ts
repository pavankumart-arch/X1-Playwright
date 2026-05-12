import { Locator, Page } from '@playwright/test';
import { BasePage } from '../BasePage';
import AddRooftopData from '../../testdata/AddRooftopData.json';

export class AddRooftop extends BasePage {
  [x: string]: any;

  AddRooftopheading: Locator;
  AddRooftopButton: Locator;
  Name: Locator;
  Description: Locator;
  RooftopID: Locator;
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
  ActiveCheckbox: Locator;  // ADDED

  private addedRooftopData: any = null;

  constructor(page: Page) {
    super(page);

    this.AddRooftopheading = page.getByRole('heading', { name: 'Add Rooftop' });
    this.AddRooftopButton = page.locator('[class="flex items-center gap-2"]');
    this.Name = page.getByPlaceholder("Enter client name");
    this.Description = page.getByPlaceholder('Enter description');
    this.RooftopID = page.getByPlaceholder('Enter Rooftop ID');
    this.Franchise = page.getByPlaceholder('Enter franchise number');
    this.PlayerColor = page.locator('input[id="admin-Rooftop-create-playerColor"]');
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
    this.ActiveCheckbox = page.locator('input[type="checkbox"]').filter({ hasText: 'Active' });  // ADDED
  }

  async AddRooftop(name: string): Promise<string> {

    console.log("👉 Clicking Add Rooftop button");

    await this.AddRooftopButton.waitFor({ state: 'visible' });
    await this.AddRooftopButton.click();

    await this.AddRooftopheading.waitFor({ state: 'visible', timeout: 10000 });

    console.log("✅ Add Rooftop form opened");

    await this.fillElement(this.Name, name);
    await this.fillElement(this.Description, "Test rooftop description");

    const rooftopId = `RTP_${Date.now()}`;
    await this.fillElement(this.RooftopID, rooftopId);

    await this.fillElement(this.Franchise, "FRN67890");
    await this.fillElement(this.PlayerColor, "#FF5733");
    await this.fillElement(this.SalesPersonName, "John Doe");
    await this.fillElement(this.Address, "123 Main St");
    await this.fillElement(this.City, "Anytown");
    await this.fillElement(this.State, "CA");
    await this.fillElement(this.Zip, "90210");
    await this.fillElement(this.Phone, "5551234567");
    await this.fillElement(this.Email, "test@example.com");
    await this.fillElement(this.URL, "https://example.com");
    await this.fillElement(this.FaceebookID, "FB123");
    await this.fillElement(this.DealerGroups, "Group A");
    await this.fillElement(this.Comments, "Automation Test");

    // Get Active checkbox value
    let activeStatus = "Checked";
    try {
      if (await this.ActiveCheckbox.count() > 0) {
        const isChecked = await this.ActiveCheckbox.isChecked();
        activeStatus = isChecked ? 'Checked' : 'Unchecked';
        console.log(`📝 Active Checkbox in ADD form: ${activeStatus}`);
      } else {
        console.log(`⚠️ Active checkbox not found, defaulting to 'Checked'`);
      }
    } catch (error) {
      console.log(`⚠️ Error reading Active checkbox: ${error}`);
    }

    // Store the added data - NOW WITH ACTIVE FIELD
    this.addedRooftopData = {
      name: name,
      description: "Test rooftop description",
      rooftopID: rooftopId,
      franchise: "FRN67890",
      playerColor: "#FF5733",
      salesPersonName: "John Doe",
      address: "123 Main St",
      city: "Anytown",
      state: "CA",
      zip: "90210",
      phone: "5551234567",
      email: "test@example.com",
      url: "https://example.com",
      facebookID: "FB123",
      dealerGroups: "Group A",
      comments: "Automation Test",
      active: activeStatus  // ADDED THIS LINE
    };

    await this.SaveRooftopbutton.click();

    console.log("👉 Waiting for save to complete");

    await this.page.locator('text=Premier Auto Group Rooftops').waitFor();

    console.log("✅ Rooftop saved successfully");

    return name;
  }

  /**
   * Search for rooftop using search box - optimized for speed
   */
  async searchRooftopInSummary(rooftopName: string): Promise<string | null> {
    try {
      // Wait for search box with reduced timeout
      await this.SearchBox.waitFor({ state: 'visible', timeout: 3000 });

      // Click and clear
      await this.SearchBox.click({ timeout: 2000 });
      await this.SearchBox.fill('');
      await this.page.waitForTimeout(300);

      // Type search term
      await this.SearchBox.fill(rooftopName);
      
      // Wait only for table to update - not networkidle
      await this.page.waitForTimeout(800);

      // Get result quickly
      const tableRows = this.page.locator('table tbody tr');
      const rowCount = await tableRows.count();

      if (rowCount > 0) {
        const firstRowNameCell = tableRows.nth(0).locator('td').nth(1);
        const cellText = (await firstRowNameCell.textContent())?.trim() || '';
        
        if (cellText.toLowerCase().includes(rooftopName.toLowerCase())) {
          return cellText;
        }
      }

      return null;

    } catch (error) {
      console.log(`❌ Error during search:`, error);
      return null;
    }
  }

  getAddedRooftopData(): any {
    return this.addedRooftopData;
  }
}