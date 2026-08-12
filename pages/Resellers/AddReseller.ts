import { expect, Locator, Page, TestInfo } from '@playwright/test';
import { BasePage } from '../BasePage';
import AddResellerdata from '../../testdata/AddResellerData.json';
import { Reporter } from '../utils/NewReport';


export class AddReseller extends BasePage {

  AddResellerButton: Locator;
  AddResellerheading: Locator;
  SaveButton: Locator;
  NameField: Locator;
  DescriptionField: Locator;
  BillingNameField: Locator;
  SalesPersonField: Locator;
  TTTemplate: Locator;
  TTOptionsField: Locator;
  AppIDField: Locator;
  PlayerSizeField: Locator;
  searchInput: Locator;
  
  // Track missing fields
  private missingFields: string[] = [];

  constructor(page: Page) {
    super(page);

    this.AddResellerButton = page.locator('button:has(span:text-is("Reseller"))');
    this.AddResellerheading = page.getByRole('heading', { name: 'Add Reseller' });
    this.SaveButton = page.getByRole('button', { name: 'Save Reseller' });
    this.NameField = page.getByPlaceholder('Enter reseller name');
    this.DescriptionField = page.getByPlaceholder('Enter description');
    this.BillingNameField = page.getByPlaceholder('Enter billing name');
    this.SalesPersonField = page.getByPlaceholder('Enter sales person name');
    this.TTTemplate = page.locator('input[placeholder="Enter TT Template"], textarea[placeholder="Enter TT Template"]');
    this.TTOptionsField = page.locator('textarea[placeholder="Enter TT options"], input[placeholder="Enter TT options"]');
    this.AppIDField = page.getByPlaceholder('Enter App ID');
    this.PlayerSizeField = page.getByPlaceholder('Enter player size');
    this.searchInput = page.locator('input[placeholder*="Search"]');
  }

  /**
   * Check if an element exists and is visible on the page
   */
  private async isElementVisible(locator: Locator, timeout: number = 2000): Promise<boolean> {
    try {
      await locator.first().waitFor({ state: 'visible', timeout });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Safely fill a field and track if it's missing
   */
  private async safeFill(
    locator: Locator, 
    value: string | number, 
    fieldName: string, 
    testInfo: TestInfo, 
    isRequired: boolean = false
  ): Promise<boolean> {
    const isVisible = await this.isElementVisible(locator);
    
    if (isVisible) {
      await locator.first().fill(value.toString());
      Reporter.validateData(value.toString(), value.toString(), fieldName, testInfo);
      console.log(`  ✅ Filled: ${fieldName} = ${value}`);
      return true;
    } else {
      // Track missing field
      this.missingFields.push(fieldName);
      
      const errorMsg = `❌ BUG DETECTED: Field "${fieldName}" is MISSING from the page!`;
      console.log(errorMsg);
      
      // Report as FAILED validation - this will make the test fail!
      Reporter.validateData(
        `Field "${fieldName}" should be present`,
        `Field "${fieldName}" is MISSING`,
        `${fieldName} - Field Existence Check`,
        testInfo
      );
      
      // Add annotation for bug report
      testInfo.annotations.push({
        type: 'BUG: Missing Field',
        description: `Field "${fieldName}" is required but not found on the page. Expected to fill with value: ${value}`
      });
      
      return false;
    }
  }

  async AddReseller(testInfo: TestInfo): Promise<string> {
    // Reset missing fields tracking
    this.missingFields = [];
    
    // Start the test reporting
    Reporter.startTest();

    const resellerName = `${AddResellerdata.Name}_${Date.now()}`;

    try {
      // OPEN ADD RESELLER
      console.log(`\n${'='.repeat(80)}`);
      console.log(`ADD RESELLER TEST - ${new Date().toLocaleString()}`);
      console.log(`${'='.repeat(80)}`);
      
      await this.AddResellerButton.click();
      await expect(this.AddResellerheading).toBeVisible();
      
      Reporter.validateData(
        'Popup opened',
        'Popup opened',
        'Open Add Reseller Modal',
        testInfo
      );
      console.log(`✅ Add Reseller modal opened`);

      // FILL ALL FIELDS - Required fields first
      console.log(`\n📝 Filling form fields...`);
      console.log(`${'─'.repeat(80)}`);
      
      // REQUIRED FIELDS (should always exist)
      await this.safeFill(this.NameField, resellerName, 'Reseller Name', testInfo, true);
      await this.safeFill(this.DescriptionField, AddResellerdata.Description, 'Description', testInfo);
      await this.safeFill(this.BillingNameField, AddResellerdata.BillingName, 'Billing Name', testInfo);
      await this.safeFill(this.SalesPersonField, AddResellerdata.SalesPerson, 'Sales Person', testInfo);
      await this.safeFill(this.TTOptionsField, AddResellerdata.TTOptions, 'TT Options', testInfo);
      await this.safeFill(this.AppIDField, AddResellerdata.AppID, 'App ID', testInfo);
      
      // TT Template - This will be tracked as missing if not found
      await this.safeFill(this.TTTemplate, AddResellerdata.TTemplate, 'TT Template', testInfo);
      
      await this.safeFill(this.PlayerSizeField, AddResellerdata.PlayerSize.toString(), 'Player Size', testInfo);

      // CHECK FOR MISSING FIELDS - This will FAIL the test if any fields are missing
      console.log(`\n${'═'.repeat(80)}`);
      if (this.missingFields.length > 0) {
        console.log(`🐛 BUG REPORT: ${this.missingFields.length} Missing Field(s) Detected!`);
        console.log(`${'═'.repeat(80)}`);
        this.missingFields.forEach(field => {
          console.log(`   ❌ ${field}`);
        });
        console.log(`${'═'.repeat(80)}`);
        
        // Add comprehensive bug summary
        testInfo.annotations.push({
          type: 'BUG SUMMARY: Missing Fields',
          description: `The following expected fields were NOT found on the page:\n${this.missingFields.join('\n')}\n\nThis indicates a development issue where the UI is missing expected form fields.`
        });
        
        // HARD FAIL the test - this will make the test show as FAILED in the report
        expect.soft(
          false, 
          `❌ TEST FAILED: ${this.missingFields.length} expected field(s) are missing from the page!\nMissing fields: ${this.missingFields.join(', ')}\n\nThis is a DEVELOPMENT BUG that needs to be fixed.`
        ).toBeTruthy();
        
      } else {
        console.log(`✅ All expected fields are present on the page!`);
      }

      // SAVE RESELLER - Only if Name field exists
      const nameFieldExists = await this.isElementVisible(this.NameField);
      
      if (!nameFieldExists) {
        throw new Error('Cannot save reseller - Name field is missing from the page!');
      }
      
      console.log(`\n💾 Saving reseller...`);
      await this.SaveButton.click();
      await this.page.waitForLoadState('networkidle');
      
      Reporter.validateData(
        'Reseller saved',
        'Reseller saved',
        'Save Reseller Operation',
        testInfo
      );
      console.log(`✅ Save button clicked`);

      // SEARCH AND VERIFY RESELLER
      console.log(`\n🔍 Searching for created reseller...`);
      await this.searchInput.fill(resellerName);
      await this.searchInput.press('Enter');
      await this.page.waitForTimeout(2000);

      const resellerText = await this.page
        .locator('table tbody tr td')
        .nth(1)
        .textContent();

      const actualResellerName = resellerText?.trim() || 'Not Found';
      
      Reporter.validateData(
        resellerName,
        actualResellerName,
        'Reseller Creation Verification',
        testInfo
      );
      
      if (actualResellerName === resellerName) {
        console.log(`✅ Reseller verified: ${resellerName}`);
      } else {
        console.log(`❌ Reseller verification failed! Expected: ${resellerName}, Found: ${actualResellerName}`);
      }
      
      expect.soft(actualResellerName).toBe(resellerName);

      // End test and get summary
      const summary = Reporter.endTest(testInfo);
      
      // FINAL SUMMARY
      console.log(`\n${'='.repeat(80)}`);
      console.log(`TEST EXECUTION COMPLETED`);
      console.log(`${'='.repeat(80)}`);
      console.log(`📊 Test Results:`);
      console.log(`   ✅ Total Validations: ${summary.totalValidations}`);
      console.log(`   ✅ Passed: ${summary.passed}`);
      console.log(`   ❌ Failed: ${summary.failed}`);
      console.log(`   📈 Pass Rate: ${summary.passRate}`);
      
      if (this.missingFields.length > 0) {
        console.log(`\n🐛 BUGS FOUND: ${this.missingFields.length} missing field(s)`);
        console.log(`   ${this.missingFields.join(', ')}`);
        console.log(`\n❌ TEST STATUS: FAILED - Development bug detected!`);
      } else {
        console.log(`\n✅ TEST STATUS: PASSED - All fields present!`);
      }
      console.log(`${'='.repeat(80)}\n`);

      return resellerName;
      
    } catch (error) {
      console.log(`\n❌ TEST FAILED: ${error instanceof Error ? error.message : String(error)}`);
      
      Reporter.validateData(
        'Success',
        'Failed',
        'Reseller Creation',
        testInfo
      );
      
      testInfo.annotations.push({
        type: 'Test Failed',
        description: `Error during reseller creation: ${error instanceof Error ? error.message : String(error)}`
      });
      
      Reporter.endTest(testInfo);
      throw error;
    }
  }

  /**
   * Method that explicitly expects certain fields to be present
   * This will FAIL the test if expected fields are missing
   */
  async AddResellerWithStrictValidation(
    testInfo: TestInfo, 
    expectedFields: string[] = ['Reseller Name', 'Description', 'Billing Name', 'Sales Person', 'TT Options', 'App ID', 'Player Size']
  ): Promise<string> {
    this.missingFields = [];
    Reporter.startTest();

    const resellerName = `${AddResellerdata.Name}_${Date.now()}`;

    console.log(`\n${'='.repeat(80)}`);
    console.log(`STRICT ADD RESELLER VALIDATION`);
    console.log(`${'='.repeat(80)}`);
    console.log(`Expected fields: ${expectedFields.join(', ')}`);

    // Open modal
    await this.AddResellerButton.click();
    await expect(this.AddResellerheading).toBeVisible();

    // Check ALL expected fields first
    console.log(`\n📋 Validating expected fields...`);
    const fieldLocators = {
      'Reseller Name': this.NameField,
      'Description': this.DescriptionField,
      'Billing Name': this.BillingNameField,
      'Sales Person': this.SalesPersonField,
      'TT Options': this.TTOptionsField,
      'App ID': this.AppIDField,
      'TT Template': this.TTTemplate,
      'Player Size': this.PlayerSizeField
    };

    for (const fieldName of expectedFields) {
      const locator = fieldLocators[fieldName as keyof typeof fieldLocators];
      if (locator) {
        const exists = await this.isElementVisible(locator);
        if (!exists) {
          this.missingFields.push(fieldName);
          console.log(`  ❌ MISSING: ${fieldName}`);
          Reporter.validateData(
            `Field "${fieldName}" should exist`,
            `Field "${fieldName}" is MISSING`,
            `Strict Validation: ${fieldName}`,
            testInfo
          );
        } else {
          console.log(`  ✅ PRESENT: ${fieldName}`);
        }
      }
    }

    // FAIL the test if any expected fields are missing
    if (this.missingFields.length > 0) {
      const errorMsg = `❌ STRICT VALIDATION FAILED: ${this.missingFields.length} expected field(s) missing!\nMissing: ${this.missingFields.join(', ')}`;
      console.log(`\n${errorMsg}`);
      
      testInfo.annotations.push({
        type: 'STRICT VALIDATION FAILED',
        description: errorMsg
      });
      
      // This will make the test FAIL in the report
      expect(
        this.missingFields.length,
        `Expected fields missing: ${this.missingFields.join(', ')}`
      ).toBe(0);
    }

    // Continue with form filling for fields that exist
    // ... rest of the form filling logic (same as above)
    
    const summary = Reporter.endTest(testInfo);
    return resellerName;
  }
}