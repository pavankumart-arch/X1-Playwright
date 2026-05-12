import { Locator, Page, TestInfo } from '@playwright/test';
import { BasePage } from '../BasePage';
import { logAndValidate } from '../../utils/reportUtil';
import EditRooftopData from '../../testdata/EditRooftopData.json';
import { AddRooftop } from './AddRooftop';
import { DeleteRooftop } from './DeleteRooftop'; // ADD THIS IMPORT - FIXES LINE 7

export class EditRooftop extends BasePage {

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
  UpdateRooftopButton: Locator;
  CancelButton: Locator;

  private addRooftopHelper: AddRooftop;
  private deleteRooftopHelper: DeleteRooftop; // FIXED: Added proper type

  constructor(page: Page) {
    super(page);

    this.addRooftopHelper = new AddRooftop(page);
    this.deleteRooftopHelper = new DeleteRooftop(page); // INITIALIZE THE DELETE HELPER - FIXES LINE 87
    
    // For Edit form
    this.Name = page.getByPlaceholder("Enter client name");
    this.Description = page.getByPlaceholder('Enter description');
    this.RooftopID = page.locator('input[placeholder="Enter Rooftop ID"]');
    this.Franchise = page.getByPlaceholder('Enter franchise number');
    this.PlayerColor = page.locator('input[id="admin-Rooftop-edit-playerColor"]');
    this.SalesPersonName = page.getByPlaceholder('Enter sales person name');
    this.Address = page.getByPlaceholder('Full address');
    this.City = page.getByPlaceholder('Enter city');
    this.State = page.getByPlaceholder('Enter state');
    this.Zip = page.getByPlaceholder('Enter ZIP code');
    this.Phone = page.getByPlaceholder('Enter phone number');
    this.Email = page.getByPlaceholder('Enter email address');
    this.URL = page.getByPlaceholder('https://example.com');
    this.FaceebookID = page.locator('input[placeholder="Enter Facebook ID"]');
    this.DealerGroups = page.locator('input[placeholder="Enter dealer groups (comma separated)"]');
    this.Comments = page.getByPlaceholder('Any additional notes...');
    this.UpdateRooftopButton = page.getByRole('button', { name: 'Update Rooftop' });
    this.CancelButton = page.getByRole('button', { name: 'Cancel' });
    this.SearchBox = page.getByPlaceholder('Search...');
    
    this.ActiveCheckbox = page.locator('label:has-text("Active") input[type="checkbox"]').or(
      page.locator('input[type="checkbox"]').filter({ hasText: 'Active' })
    );
  }

  async fillEditFormField(locator: Locator, value: string): Promise<void> {
    if (value && value.trim() !== '') {
      await locator.waitFor({ state: 'visible', timeout: 5000 });
      await locator.clear();
      await locator.fill(value);
      await this.page.waitForTimeout(300);
    }
  }

  generateUniqueName(baseName: string): string {
    const timestamp = Date.now();
    const randomNum = Math.floor(Math.random() * 10000);
    return `${baseName}_${timestamp}_${randomNum}`;
  }

  getEditRooftopData(): any {
    return EditRooftopData;
  }

  async addRooftop(rooftopName: string): Promise<string> {
    return await this.addRooftopHelper.AddRooftop(rooftopName);
  }

  async deleteRooftop(rooftopName: string): Promise<boolean> {
    console.log(`\n============================================================`);
    console.log(`🗑️  Deleting Rooftop: ${rooftopName}`);
    console.log(`============================================================`);
    
    const result = await this.deleteRooftopHelper.DeleteRooftop(rooftopName);
    return result.deletePassed && result.verificationPassed;
  }

  async searchExactRooftopInSummary(rooftopName: string): Promise<boolean> {
    try {
      await this.SearchBox.waitFor({ state: 'visible', timeout: 5000 });
      await this.SearchBox.click();
      await this.SearchBox.fill('');
      await this.page.waitForTimeout(300);
      await this.SearchBox.fill(rooftopName);
      await this.page.waitForTimeout(1000);

      const tableRows = this.page.locator('table tbody tr');
      const rowCount = await tableRows.count();

      for (let i = 0; i < rowCount; i++) {
        const nameCell = tableRows.nth(i).locator('td').nth(1);
        const cellText = (await nameCell.textContent())?.trim() || '';
        if (cellText === rooftopName) {
          return true;
        }
      }
      return false;
    } catch (error) {
      return false;
    }
  }

  async clickEditButtonForExactRooftop(rooftopName: string): Promise<boolean> {
    try {
      const found = await this.searchExactRooftopInSummary(rooftopName);
      if (!found) return false;
      
      await this.page.waitForTimeout(500);
      
      const tableRows = this.page.locator('table tbody tr');
      const rowCount = await tableRows.count();
      
      for (let i = 0; i < rowCount; i++) {
        const nameCell = tableRows.nth(i).locator('td').nth(1);
        const cellText = (await nameCell.textContent())?.trim() || '';
        
        if (cellText === rooftopName) {
          const actionsCell = tableRows.nth(i).locator('td').last();
          const editButton = actionsCell.getByRole('button').first();
          await editButton.click();
          await this.page.waitForLoadState('networkidle');
          await this.page.waitForTimeout(2000);
          return true;
        }
      }
      return false;
    } catch (error) {
      return false;
    }
  }

  async setActiveCheckbox(shouldBeChecked: boolean): Promise<void> {
    try {
      await this.ActiveCheckbox.waitFor({ state: 'attached', timeout: 5000 });
      if (await this.ActiveCheckbox.count() > 0) {
        const isChecked = await this.ActiveCheckbox.isChecked();
        if (isChecked !== shouldBeChecked) {
          await this.ActiveCheckbox.click();
        }
      }
    } catch (error) {
      // Silent fail
    }
  }

  async fillEditForm(data: any): Promise<void> {
    await this.fillEditFormField(this.Name, data.Name);
    await this.fillEditFormField(this.Description, data.Description);
    await this.fillEditFormField(this.RooftopID, data.RooftopID);
    await this.fillEditFormField(this.Franchise, data.Franchise);
    await this.fillEditFormField(this.PlayerColor, data.PlayerColor);
    await this.fillEditFormField(this.SalesPersonName, data.SalesPersonName);
    await this.fillEditFormField(this.Address, data.Address);
    await this.fillEditFormField(this.City, data.City);
    await this.fillEditFormField(this.State, data.State);
    await this.fillEditFormField(this.Zip, data.Zip);
    await this.fillEditFormField(this.Phone, data.Phone);
    await this.fillEditFormField(this.Email, data.Email);
    await this.fillEditFormField(this.URL, data.URL);
    await this.fillEditFormField(this.FaceebookID, data.FacebookID);
    
    if (data.DealerGroups) {
      await this.DealerGroups.clear();
      await this.page.waitForTimeout(300);
      await this.DealerGroups.fill(data.DealerGroups);
    }
    
    await this.fillEditFormField(this.Comments, data.Comments);
    await this.setActiveCheckbox(data.Active);
  }

  private async getFieldValue(locator: Locator): Promise<string> {
    try {
      const elementCount = await locator.count();
      if (elementCount === 0) return '';

      try {
        const inputVal = await locator.inputValue();
        if (inputVal && inputVal.trim().length > 0) return inputVal.trim();
      } catch (e) {}

      return '';
    } catch (error) {
      return '';
    }
  }

  async getCurrentRooftopData(): Promise<any> {
    return {
      name: await this.getFieldValue(this.Name),
      description: await this.getFieldValue(this.Description),
      rooftopID: await this.getFieldValue(this.RooftopID),
      franchise: await this.getFieldValue(this.Franchise),
      playerColor: await this.getFieldValue(this.PlayerColor),
      salesPersonName: await this.getFieldValue(this.SalesPersonName),
      address: await this.getFieldValue(this.Address),
      city: await this.getFieldValue(this.City),
      state: await this.getFieldValue(this.State),
      zip: await this.getFieldValue(this.Zip),
      phone: await this.getFieldValue(this.Phone),
      email: await this.getFieldValue(this.Email),
      url: await this.getFieldValue(this.URL),
      facebookID: await this.getFieldValue(this.FaceebookID),
      dealerGroups: await this.getFieldValue(this.DealerGroups),
      comments: await this.getFieldValue(this.Comments),
      active: await this.ActiveCheckbox.isChecked().catch(() => false)
    };
  }

  async clickCancelButton(): Promise<void> {
    try {
      await this.CancelButton.waitFor({ state: 'visible', timeout: 5000 });
      await this.CancelButton.click();
      await this.page.waitForLoadState('networkidle');
      await this.page.waitForTimeout(1000);
    } catch (error) {
      // Silent fail
    }
  }

  async editRooftop(originalName: string, editTemplate: any, testInfo: TestInfo): Promise<{
    success: boolean;
    originalName: string;
    newName: string;
    fieldComparisons: Array<any>;
  }> {
    try {
      const uniqueNewName = this.generateUniqueName(editTemplate.Name);
      const uniqueNewID = this.generateUniqueName(editTemplate.RooftopID);
      
      const editData = {
        ...editTemplate,
        Name: uniqueNewName,
        RooftopID: uniqueNewID
      };
      
      const editClicked = await this.clickEditButtonForExactRooftop(originalName);
      if (!editClicked) {
        return { success: false, originalName, newName: '', fieldComparisons: [] };
      }
      
      await this.fillEditForm(editData);
      
      await this.UpdateRooftopButton.waitFor({ state: 'visible', timeout: 10000 });
      await this.UpdateRooftopButton.click();
      await this.page.waitForLoadState('networkidle');
      await this.page.waitForTimeout(2000);
      
      const editedFound = await this.searchExactRooftopInSummary(uniqueNewName);
      if (!editedFound) {
        return { success: false, originalName, newName: uniqueNewName, fieldComparisons: [] };
      }
      
      await this.clickEditButtonForExactRooftop(uniqueNewName);
      const currentData = await this.getCurrentRooftopData();
      await this.clickCancelButton();
      
      const fieldComparisons = [];
      let allMatch = true;
      
      const fieldsToCompare = [
        { key: 'name', label: 'Name', expected: editData.Name },
        { key: 'description', label: 'Description', expected: editData.Description },
        { key: 'rooftopID', label: 'Rooftop ID', expected: editData.RooftopID },
        { key: 'franchise', label: 'Franchise', expected: editData.Franchise },
        { key: 'playerColor', label: 'Player Color', expected: editData.PlayerColor },
        { key: 'salesPersonName', label: 'Sales Person Name', expected: editData.SalesPersonName },
        { key: 'address', label: 'Address', expected: editData.Address },
        { key: 'city', label: 'City', expected: editData.City },
        { key: 'state', label: 'State', expected: editData.State },
        { key: 'zip', label: 'ZIP', expected: editData.Zip },
        { key: 'phone', label: 'Phone', expected: editData.Phone },
        { key: 'email', label: 'Email', expected: editData.Email },
        { key: 'url', label: 'URL', expected: editData.URL },
        { key: 'facebookID', label: 'Facebook ID', expected: editData.FacebookID },
        { key: 'dealerGroups', label: 'Dealer Groups', expected: editData.DealerGroups },
        { key: 'comments', label: 'Comments', expected: editData.Comments },
        { key: 'active', label: 'Active', expected: editData.Active ? 'true' : 'false' }
      ];
      
      for (const field of fieldsToCompare) {
        let expectedValue = String(field.expected || '');
        let actualValue = String(currentData[field.key] || '');
        
        if (field.key === 'playerColor') {
          expectedValue = expectedValue.replace('#', '').toUpperCase();
          actualValue = actualValue.replace('#', '').toUpperCase();
        } else if (field.key === 'active') {
          actualValue = actualValue === 'true' ? 'true' : 'false';
        }
        
        const match = expectedValue === actualValue;
        if (!match) allMatch = false;
        
        let errorMessage = '';
        if (!match) {
          if (actualValue === '') {
            errorMessage = `Expected "${expectedValue}" but got EMPTY value`;
          } else {
            errorMessage = `Expected "${expectedValue}" but got "${actualValue}"`;
          }
        }
        
        fieldComparisons.push({
          field: field.label,
          expected: expectedValue,
          actual: actualValue === '' ? '(EMPTY)' : actualValue,
          status: match ? '✅ PASS' : '❌ FAIL',
          error: errorMessage
        });
        
        logAndValidate({
          step: `Field: ${field.label}`,
          expected: expectedValue,
          actual: actualValue === '' ? '(EMPTY)' : actualValue,
          isSummary: false
        }, testInfo);
      }
      
      console.log(`\n${"=".repeat(60)}`);
      console.log(`📋 EDIT ROOFTOP VERIFICATION SUMMARY`);
      console.log(`${"=".repeat(60)}`);
      for (const comparison of fieldComparisons) {
        console.log(`${comparison.field.padEnd(20)} : ${comparison.status}`);
        if (comparison.error) {
          console.log(`   └─ ${comparison.error}`);
        }
      }
      console.log(`${"=".repeat(60)}`);
      
      return {
        success: allMatch,
        originalName,
        newName: uniqueNewName,
        fieldComparisons
      };
      
    } catch (error) {
      console.log(`❌ Error editing rooftop: ${error}`);
      return { success: false, originalName, newName: '', fieldComparisons: [] };
    }
  }

  async addAndEditRooftop(testInfo: TestInfo): Promise<{
    addSuccess: boolean;
    editSuccess: boolean;
    addedName: string;
    editedName: string;
    fieldComparisons: Array<any>;
  }> {
    try {
      const editTemplate = this.getEditRooftopData();
      const uniqueAddName = this.generateUniqueName("Test_Rooftop");
      
      const addedName = await this.addRooftop(uniqueAddName);
      const editResult = await this.editRooftop(addedName, editTemplate, testInfo);
      
      return {
        addSuccess: true,
        editSuccess: editResult.success,
        addedName: addedName,
        editedName: editResult.newName,
        fieldComparisons: editResult.fieldComparisons
      };
      
    } catch (error) {
      console.log(`❌ Error: ${error}`);
      return {
        addSuccess: false,
        editSuccess: false,
        addedName: '',
        editedName: '',
        fieldComparisons: []
      };
    }
  }
}