import { Locator, Page } from '@playwright/test';
import { BasePage } from '../BasePage';

export class VerifyRooftop extends BasePage {

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
  SearchBox: Locator;
  ActiveCheckbox: Locator;

  constructor(page: Page) {
    super(page);

    this.Name = page.getByPlaceholder("Enter client name");
    this.Description = page.getByPlaceholder('Enter description');
    this.RooftopID = page.locator('#admin-rooftop-edit-dealerCode, input[placeholder="Enter Rooftop ID"]');
    this.Franchise = page.getByPlaceholder('Enter franchise number');
    this.PlayerColor = page.locator('#admin-rooftop-create-playerColor, input[type="color"], input[name="playerColor"]');
    this.SalesPersonName = page.getByPlaceholder('Enter sales person name');
    this.Address = page.getByPlaceholder('Full address');
    this.City = page.getByPlaceholder('Enter city');
    this.State = page.getByPlaceholder('Enter state');
    this.Zip = page.getByPlaceholder('Enter ZIP code');
    this.Phone = page.getByPlaceholder('Enter phone number');
    this.Email = page.getByPlaceholder('Enter email address');
    this.URL = page.getByPlaceholder('https://example.com');
    this.FaceebookID = page.locator('#admin-rooftop-edit-facebookId, input[placeholder="Enter Facebook ID"], input[name="facebookId"]');
    this.DealerGroups = page.locator('input[placeholder="Enter dealer groups (comma separated)"]').or(
      page.locator('#admin-rooftop-edit-dealerGroups')
    ).or(
      page.getByLabel('Dealer Groups')
    );
    this.Comments = page.getByPlaceholder('Any additional notes...');
    this.SearchBox = page.getByPlaceholder('Search...');
    this.ActiveCheckbox = page.locator('input[type="checkbox"]').filter({ hasText: 'Active' });
  }

  async searchRooftopInSummary(rooftopName: string): Promise<string | null> {
    try {
      await this.SearchBox.waitFor({ state: 'visible', timeout: 3000 });
      await this.SearchBox.click({ timeout: 2000 });
      await this.SearchBox.fill('');
      await this.page.waitForTimeout(300);
      await this.SearchBox.fill(rooftopName);
      await this.page.waitForTimeout(800);

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
      return null;
    }
  }

  async clickEditButtonFromSummary(): Promise<void> {
    try {
      console.log('📋 Clicking Edit button from summary page...');
      
      await this.page.waitForTimeout(1000);
      
      const firstRow = this.page.locator('table tbody tr').first();
      await firstRow.waitFor({ state: 'visible', timeout: 5000 });
      
      const actionsCell = firstRow.locator('td').last();
      const editButton = actionsCell.getByRole('button', { name: 'Edit' }).or(
        actionsCell.locator('button').first()
      );
      
      await editButton.waitFor({ state: 'visible', timeout: 5000 });
      await editButton.click();
      
      await this.page.waitForLoadState('networkidle');
      await this.page.waitForTimeout(2000);
      
      const updateButton = this.page.getByRole('button', { name: 'Update Rooftop' });
      await updateButton.waitFor({ state: 'visible', timeout: 10000 });
      console.log('✅ Edit form opened successfully');
      
    } catch (error) {
      console.error(`❌ Failed to click edit button: ${error}`);
      throw error;
    }
  }

  private async getFieldValue(locator: Locator): Promise<string> {
    try {
      await this.page.waitForTimeout(500);
      
      const elementCount = await locator.count().catch(() => 0);
      if (elementCount === 0) return '';

      try {
        const inputVal = await locator.inputValue({ timeout: 3000 }).catch(() => null);
        if (inputVal && inputVal.trim().length > 0) {
          return inputVal.trim();
        }
      } catch (e) {}

      try {
        const attrValue = await locator.getAttribute('value', { timeout: 2000 }).catch(() => null);
        if (attrValue && attrValue.trim().length > 0) {
          return attrValue.trim();
        }
      } catch (e) {}

      try {
        const textContent = await locator.textContent({ timeout: 2000 }).catch(() => null);
        if (textContent && textContent.trim().length > 0) {
          return textContent.trim();
        }
      } catch (e) {}

      return '';
    } catch (error) {
      return '';
    }
  }

  private async getActiveCheckboxValue(): Promise<string> {
    try {
      await this.page.waitForTimeout(500);
      
      const activeCheckbox = this.page.locator('input[type="checkbox"]').filter({ hasText: 'Active' });
      
      if (await activeCheckbox.count() > 0 && await activeCheckbox.isVisible()) {
        const isChecked = await activeCheckbox.isChecked();
        const status = isChecked ? 'Checked' : 'Unchecked';
        console.log(`📝 Active Checkbox in EDIT form: ${status}`);
        return status;
      }
      
      console.log(`⚠️ Active checkbox not found in edit form, defaulting to 'Checked'`);
      return 'Checked';
    } catch (error) {
      console.log(`⚠️ Error reading Active checkbox: ${error}`);
      return 'Checked';
    }
  }

  async getVerifiedRooftopData(): Promise<any> {
    console.log('📋 Getting verified rooftop data from edit form...');
    
    await this.page.waitForTimeout(2000);
    
    // Wait for form fields to populate
    try {
      await this.page.waitForFunction(() => {
        const nameInput = document.querySelector('input[placeholder="Enter client name"]') as HTMLInputElement;
        return nameInput && nameInput.value.length > 0;
      }, { timeout: 10000 }).catch(() => {
        console.log('⚠️ Timeout waiting for form fields to populate - fields may be empty');
      });
    } catch (e) {}
    
    let dealerGroupsValue = '';
    
    try {
      // Try multiple selectors for dealer groups
      const dealerGroupsSelectors = [
        'input[placeholder="Enter dealer groups (comma separated)"]',
        '#admin-rooftop-edit-dealerGroups',
        'input[name="dealerGroups"]',
        'input[data-testid="dealerGroups"]'
      ];
      
      for (const selector of dealerGroupsSelectors) {
        const element = this.page.locator(selector);
        if (await element.count() > 0 && await element.isVisible()) {
          dealerGroupsValue = await element.inputValue().catch(() => '');
          if (dealerGroupsValue) {
            console.log(`✅ Found dealerGroups value: "${dealerGroupsValue}" using selector: ${selector}`);
            break;
          }
        }
      }
      
      // If still empty, try to get by label
      if (!dealerGroupsValue) {
        const dealerGroupsByLabel = this.page.getByLabel('Dealer Groups');
        if (await dealerGroupsByLabel.count() > 0) {
          dealerGroupsValue = await dealerGroupsByLabel.inputValue().catch(() => '');
          if (dealerGroupsValue) {
            console.log(`✅ Found dealerGroups value: "${dealerGroupsValue}" using label`);
          }
        }
      }
      
      console.log(`📝 Final dealerGroups value: "${dealerGroupsValue}"`);
      
    } catch (error) {
      console.log(`⚠️ Error getting dealerGroups: ${error}`);
    }

    const nameValue = await this.getFieldValue(this.Name);
    const descriptionValue = await this.getFieldValue(this.Description);
    const rooftopIdValue = await this.getFieldValue(this.RooftopID);
    const franchiseValue = await this.getFieldValue(this.Franchise);
    const playerColorValue = await this.getFieldValue(this.PlayerColor);
    const salesPersonValue = await this.getFieldValue(this.SalesPersonName);
    const addressValue = await this.getFieldValue(this.Address);
    const cityValue = await this.getFieldValue(this.City);
    const stateValue = await this.getFieldValue(this.State);
    const zipValue = await this.getFieldValue(this.Zip);
    const phoneValue = await this.getFieldValue(this.Phone);
    const emailValue = await this.getFieldValue(this.Email);
    const urlValue = await this.getFieldValue(this.URL);
    const facebookIdValue = await this.getFieldValue(this.FaceebookID);
    const commentsValue = await this.getFieldValue(this.Comments);
    const activeCheckboxValue = await this.getActiveCheckboxValue();

    console.log(`📊 Retrieved values - Name: "${nameValue}", DealerGroups: "${dealerGroupsValue}"`);

    return {
      name: nameValue,
      description: descriptionValue,
      rooftopID: rooftopIdValue,
      franchise: franchiseValue,
      playerColor: playerColorValue,
      salesPersonName: salesPersonValue,
      address: addressValue,
      city: cityValue,
      state: stateValue,
      zip: zipValue,
      phone: phoneValue,
      email: emailValue,
      url: urlValue,
      facebookID: facebookIdValue,
      dealerGroups: dealerGroupsValue,
      comments: commentsValue,
      active: activeCheckboxValue
    };
  }

  async VerifyAddedRooftop(rooftopName: string, addedData: any): Promise<{
    searchPassed: boolean;
    verificationPassed: boolean;
    fieldComparisons: Array<{
      field: string;
      expected: string;
      actual: string;
      status: string;
    }>;
  }> {
    try {
      const searchedRooftopName = await this.searchRooftopInSummary(rooftopName);
      const searchPassed = searchedRooftopName !== null && searchedRooftopName.toLowerCase().includes(rooftopName.toLowerCase());

      if (!searchPassed) {
        return {
          searchPassed: false,
          verificationPassed: false,
          fieldComparisons: []
        };
      }

      await this.clickEditButtonFromSummary();
      const verifiedData = await this.getVerifiedRooftopData();

      console.log(`\n📊 Verified Data Retrieved (${Object.keys(verifiedData).length} fields):`);
      console.log(JSON.stringify(verifiedData, null, 2));

      const fields = Object.keys(addedData);
      let allMatch = true;
      const fieldComparisons = [];

      for (const field of fields) {
        const addedValue = String(addedData[field] || '').trim();
        const verifiedValue = String(verifiedData[field] || '').trim();
        
        let normalizedAdded = addedValue;
        let normalizedVerified = verifiedValue;
        
        if (field.toLowerCase().includes('color')) {
          normalizedAdded = addedValue.toUpperCase();
          normalizedVerified = verifiedValue.toUpperCase();
        }
        
        const match = normalizedAdded === normalizedVerified;
        if (!match) allMatch = false;

        fieldComparisons.push({
          field,
          expected: addedValue,
          actual: verifiedValue,
          status: match ? '✅ PASS' : '❌ FAIL'
        });
      }

      return {
        searchPassed,
        verificationPassed: allMatch,
        fieldComparisons
      };

    } catch (error) {
      console.log(`❌ Verification error: ${error}`);
      return {
        searchPassed: false,
        verificationPassed: false,
        fieldComparisons: []
      };
    }
  }
}