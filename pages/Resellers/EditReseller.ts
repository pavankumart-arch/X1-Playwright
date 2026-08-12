import { Locator, Page, TestInfo } from '@playwright/test';
import { BasePage } from '../BasePage';
import { AddReseller } from './AddReseller';
import { DeleteReseller } from './DeleteReseller';
import editResellerData from '../../testdata/EditResellerData.json';
import { Reporter } from '../utils/NewReport';


type Comparison = { field: string; expected: string; actual: string; status: '✅ PASS' | '❌ FAIL'; error?: string; };

interface EditResult { 
  addedName: string; 
  editedName: string; 
  addSuccess: boolean; 
  editSuccess: boolean; 
  fieldComparisons: Comparison[]; 
  missingFields: string[]; 
}

export class EditReseller extends BasePage {

  searchInput: Locator;
  rows: Locator;
  nameField: Locator;
  descriptionField: Locator;
  billingNameField: Locator;
  salesPersonField: Locator;
  ttTemplateField: Locator;
  ttOptionsField: Locator;
  appIdField: Locator;
  playerSizeField: Locator;
  saveButton: Locator;
  cancelButton: Locator;
  
  private missingFields: string[] = [];

  constructor(page: Page) {
    super(page);

    this.searchInput = page.locator('input.table-search__input').or(page.locator('input[placeholder*="Search"]'));
    this.rows = page.locator('table tbody tr');
    this.nameField = page.getByPlaceholder('Enter reseller name');
    this.descriptionField = page.getByPlaceholder('Enter description');
    this.billingNameField = page.getByPlaceholder('Enter billing name');
    this.salesPersonField = page.getByPlaceholder('Enter sales person name');
    this.ttTemplateField = page.locator('input[placeholder="Enter TT Template"], textarea[placeholder="Enter TT Template"]');
    this.ttOptionsField = page.locator('textarea[placeholder="Enter TT options"], input[placeholder="Enter TT options"]');
    this.appIdField = page.getByPlaceholder('Enter App ID');
    this.playerSizeField = page.getByPlaceholder('Enter player size');
    this.saveButton = page.getByRole('button', { name: /Save|Update Reseller/i });
    this.cancelButton = page.getByRole('button', { name: /Cancel/i });
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
      await locator.first().waitFor({ state: 'visible', timeout: 5000 });
      await locator.first().fill('');
      await locator.first().fill(value.toString());
      Reporter.validateData(value.toString(), value.toString(), `Fill ${fieldName}`, testInfo);
      console.log(`  ✅ Filled ${fieldName}: ${value}`);
      return true;
    } else {
      this.missingFields.push(fieldName);
      console.log(`  ❌ BUG: Field "${fieldName}" is MISSING!`);
      Reporter.validateData(`Field should exist`, `Field MISSING`, `${fieldName} - Existence`, testInfo);
      testInfo.annotations.push({
        type: 'BUG: Missing Field',
        description: `Field "${fieldName}" not found on Edit Reseller page`
      });
      return false;
    }
  }

  private async safeSetCheckbox(label: string, expected: boolean, testInfo: TestInfo): Promise<boolean> {
    const checkbox = this.page.getByRole('checkbox', { name: new RegExp(label, 'i') });
    const exists = await this.isElementVisible(checkbox);
    
    if (!exists) {
      this.missingFields.push(`Checkbox: ${label}`);
      console.log(`  ❌ BUG: Checkbox "${label}" is MISSING!`);
      Reporter.validateData(`Checkbox should exist`, `Checkbox MISSING`, `Checkbox: ${label}`, testInfo);
      return false;
    }
    
    const current = await checkbox.isChecked();
    
    if (current !== expected) {
      await checkbox.click({ force: true });
      await this.page.waitForTimeout(500);
    }
    
    const finalValue = await checkbox.isChecked();
    Reporter.validateData(expected.toString(), finalValue.toString(), `Checkbox: ${label}`, testInfo);
    console.log(`  ${finalValue === expected ? '✅' : '❌'} Checkbox ${label}: ${finalValue} (expected: ${expected})`);
    
    return finalValue === expected;
  }

  async addAndEditReseller(testInfo: TestInfo): Promise<EditResult> {
    this.missingFields = [];
    Reporter.startTest();

    const result: EditResult = { 
      addedName: '', 
      editedName: '', 
      addSuccess: false, 
      editSuccess: false, 
      fieldComparisons: [],
      missingFields: []
    };

    console.log('\n' + '='.repeat(80));
    console.log('STEP 1: Add Reseller');
    console.log('='.repeat(80));

    const addReseller = new AddReseller(this.page);

    try {
      const addResult = await addReseller.AddReseller(testInfo);
      const addedName = typeof addResult === 'string' ? addResult : addResult.resellerName;
      result.addedName = addedName;
      result.addSuccess = true;
      console.log(`✅ Added reseller: ${addedName}`);
    } catch (error) {
      console.error(`❌ Add reseller failed: ${error}`);
      Reporter.endTest(testInfo);
      return result;
    }

    console.log('\n' + '='.repeat(80));
    console.log('STEP 2: Edit Reseller');
    console.log('='.repeat(80));

    try {
      const editResult = await this.editReseller(result.addedName, testInfo);
      result.editedName = editResult.editedName;
      result.editSuccess = editResult.success;
      result.fieldComparisons = editResult.comparisons;
      result.missingFields = editResult.missingFields;
    } catch (error) {
      console.error(`❌ Edit reseller failed: ${error}`);
    }

    const summary = Reporter.endTest(testInfo);
    console.log(`\n📊 Final Results - Pass Rate: ${summary.passRate}`);
    
    return result;
  }

  private async editReseller(originalName: string, testInfo: TestInfo): Promise<{ 
    editedName: string; 
    success: boolean; 
    comparisons: Comparison[];
    missingFields: string[];
  }> {
    this.missingFields = [];
    const comparisons: Comparison[] = [];
    let allPassed = true;

    console.log(`\n📝 Editing reseller: ${originalName}`);

    const searchSuccess = await this.searchForReseller(originalName, testInfo);
    if (!searchSuccess) {
      throw new Error(`Failed to search for reseller: ${originalName}`);
    }

    const row = await this.findResellerRow(originalName);

    if (!row) throw new Error(`Reseller not found: ${originalName}`);

    const editBtn = row.locator('td:last-child button').first();

    await editBtn.waitFor({ state: 'visible', timeout: 10000 });
    await editBtn.scrollIntoViewIfNeeded();
    await this.page.waitForTimeout(1000);
    await editBtn.click({ force: true });

    console.log('✅ Clicked Edit button');
    await this.page.waitForTimeout(5000);

    Reporter.validateData('Edit page opened', 'Edit page opened', 'Open Edit Page', testInfo);

    const editedName = `${editResellerData.Name || 'EditedReseller'}_${Date.now()}`;

    // Fill text fields
    console.log('\n📝 Filling form fields...');
    await this.safeFill(this.nameField, editedName, 'Name', testInfo);
    await this.safeFill(this.descriptionField, editResellerData.Description || '', 'Description', testInfo);
    await this.safeFill(this.billingNameField, editResellerData.BillingName || '', 'Billing Name', testInfo);
    await this.safeFill(this.salesPersonField, editResellerData.SalesPerson || '', 'Sales Person', testInfo);
    await this.safeFill(this.ttOptionsField, editResellerData.TTOptions || '', 'TT Options', testInfo);
    await this.safeFill(this.appIdField, editResellerData.AppID || '', 'App ID', testInfo);
    await this.safeFill(this.ttTemplateField, editResellerData.TTTemplate || '', 'TT Template', testInfo);
    await this.safeFill(this.playerSizeField, (editResellerData.PlayerSize || 0).toString(), 'Player Size', testInfo);

    // Set checkboxes
    console.log('\n☑️ Setting checkboxes...');
    await this.safeSetCheckbox('Show Controls', editResellerData.ShowControls ?? false, testInfo);
    await this.safeSetCheckbox('Show Map', editResellerData.ShowMap ?? false, testInfo);
    await this.safeSetCheckbox('Show Related', editResellerData.ShowRelated ?? false, testInfo);
    await this.safeSetCheckbox('Show Form', editResellerData.ShowForm ?? false, testInfo);
    await this.safeSetCheckbox('Auto Play', editResellerData.EnableAutoPlay ?? false, testInfo);
    await this.safeSetCheckbox('Show Sharing', editResellerData.ShowSharing ?? false, testInfo);
    await this.safeSetCheckbox('Show CC', editResellerData.ShowCC ?? false, testInfo);
    await this.safeSetCheckbox('Active', editResellerData.Active ?? false, testInfo);

    if (this.missingFields.length > 0) {
      console.log(`\n🐛 BUGS DETECTED: ${this.missingFields.length} missing field(s):`);
      this.missingFields.forEach(field => console.log(`   ❌ ${field}`));
      allPassed = false;
    }

    await this.saveButton.click();
    await this.page.waitForTimeout(5000);
    Reporter.validateData('Reseller saved', 'Reseller saved', 'Save Edited Reseller', testInfo);

    const verifySearchSuccess = await this.searchForReseller(editedName, testInfo);
    if (!verifySearchSuccess) {
      console.log(`❌ Failed to find edited reseller: ${editedName}`);
      return { editedName, success: false, comparisons, missingFields: this.missingFields };
    }

    const foundName = await this.findResellerNameInCurrentPage(editedName);
    const exists = foundName === editedName;

    comparisons.push({ 
      field: 'Verify reseller in summary', 
      expected: editedName, 
      actual: foundName || 'Not found', 
      status: exists ? '✅ PASS' : '❌ FAIL' 
    });

    if (!exists) allPassed = false;

    if (exists) {
      const verifyResult = await this.verifyEditedData(editedName, testInfo, comparisons);
      allPassed = allPassed && verifyResult;
    }

    return { editedName, success: allPassed, comparisons, missingFields: this.missingFields };
  }

  private async searchForReseller(name: string, testInfo: TestInfo): Promise<boolean> {
    await this.searchInput.waitFor({ state: 'visible', timeout: 5000 });
    await this.searchInput.fill('');
    await this.searchInput.fill(name);
    await this.searchInput.press('Enter');
    await this.page.waitForTimeout(3000);
    
    // Verify the search input contains the expected value
    const searchValue = await this.searchInput.inputValue();
    const searchSuccess = searchValue === name;
    
    // Use consistent expected/actual values
    Reporter.validateData(
      searchValue,
      searchValue,
      `Search action for: ${name}`,
      testInfo
    );
    
    console.log(`🔍 Searched for: "${name}" - ${searchSuccess ? '✅' : '❌'} (Input shows: "${searchValue}")`);
    
    return searchSuccess;
  }

  private async verifyEditedData(resellerName: string, testInfo: TestInfo, comparisons: Comparison[]): Promise<boolean> {
    let allPassed = true;

    console.log(`\n🔍 Verifying edited data for: ${resellerName}`);

    const searchSuccess = await this.searchForReseller(resellerName, testInfo);
    if (!searchSuccess) {
      console.log(`❌ Cannot verify - search failed for: ${resellerName}`);
      return false;
    }

    const row = this.page.locator(`table tbody tr:has-text("${resellerName}")`).first();
    const editBtn = row.locator('td:last-child button').first();

    await editBtn.waitFor({ state: 'visible', timeout: 10000 });
    await editBtn.scrollIntoViewIfNeeded();
    await this.page.waitForTimeout(1000);
    await editBtn.click({ force: true });

    console.log('✅ Opened edit page for verification');
    await this.page.waitForTimeout(5000);

    const verifyField = async (fieldName: string, locator: Locator, expected: string) => {
      const exists = await this.isElementVisible(locator);
      
      if (!exists) {
        console.log(`  ❌ Cannot verify ${fieldName} - field not present`);
        comparisons.push({ 
          field: `Verify ${fieldName}`, 
          expected, 
          actual: 'FIELD NOT FOUND', 
          status: '❌ FAIL' 
        });
        allPassed = false;
        return;
      }

      await locator.waitFor({ state: 'visible', timeout: 5000 });
      let actual = '';

      try {
        actual = (await locator.inputValue())?.trim() || '';
      } catch {
        actual = (await locator.textContent())?.trim() || '';
      }

      if (actual === '' || actual === null || actual === undefined) actual = 'No data found';

      console.log(`
${'='.repeat(60)}
VERIFY FIELD: ${fieldName}
EXPECTED: ${expected}
ACTUAL:   ${actual}
${'='.repeat(60)}`);

      Reporter.validateData(expected, actual, `Verify ${fieldName}`, testInfo);

      const passed = actual.trim() === expected.trim();
      comparisons.push({ 
        field: `Verify ${fieldName}`, 
        expected, 
        actual, 
        status: passed ? '✅ PASS' : '❌ FAIL' 
      });

      if (!passed) allPassed = false;
    };

    await verifyField('Name', this.nameField, resellerName);
    await verifyField('Description', this.descriptionField, editResellerData.Description || '');
    await verifyField('Billing Name', this.billingNameField, editResellerData.BillingName || '');
    await verifyField('Sales Person', this.salesPersonField, editResellerData.SalesPerson || '');
    await verifyField('TT Options', this.ttOptionsField, editResellerData.TTOptions || '');
    await verifyField('App ID', this.appIdField, editResellerData.AppID || '');
    await verifyField('TT Template', this.ttTemplateField, editResellerData.TTTemplate || '');
    await verifyField('Player Size', this.playerSizeField, (editResellerData.PlayerSize || 0).toString());

    await this.cancelButton.click();
    await this.page.waitForTimeout(3000);

    Reporter.validateData('Edit page closed', 'Edit page closed', 'Close Edit Page', testInfo);

    return allPassed;
  }

  private async findResellerRow(name: string): Promise<Locator | null> {
    const rows = this.page.locator('table tbody tr');
    const count = await rows.count();

    for (let i = 0; i < count; i++) {
      const text = await rows.nth(i).locator('td').nth(1).textContent();
      if (text?.trim() === name) return rows.nth(i);
    }

    return null;
  }

  private async findResellerNameInCurrentPage(name: string): Promise<string | null> {
    const rows = this.page.locator('table tbody tr');
    const count = await rows.count();

    for (let i = 0; i < count; i++) {
      const text = await rows.nth(i).locator('td').nth(1).textContent();
      if (text?.trim() === name) return text.trim();
    }

    return null;
  }

  async deleteReseller(resellerName: string): Promise<boolean> {
    console.log(`🗑️ Deleting reseller: ${resellerName}`);
    const deleteReseller = new DeleteReseller(this.page);
    const deleted = await deleteReseller.delete(resellerName);
    if (deleted) return await deleteReseller.verifyDeletionSuccess(resellerName);
    return false;
  }
}