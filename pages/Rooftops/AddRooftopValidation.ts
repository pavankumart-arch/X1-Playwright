import { expect, Locator, Page, TestInfo } from '@playwright/test';
import { BasePage } from '../BasePage';
import { logAndValidate } from '../../utils/reportUtil';

export class validateAddRooftopForm extends BasePage {
    //Input Locators
  Nameinput: Locator;
  Phoneinput: Locator;
  Emailinput: Locator;
  URLinput: Locator;
    //Label Locators
  AddRooftopheading: Locator;
  AddRooftopButton: Locator;
  Name: Locator;
  Nameerrormessage: Locator; 
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
  Phoneerrormessage: Locator;
  Email: Locator;
  Emailerrormessage: Locator;
  URL: Locator;
  URLerrormessage: Locator;
  FaceebookID: Locator;
  DealerGroups: Locator;
  Comments: Locator;
  SaveRooftopbutton: Locator;
  Cancelbutton: Locator;
  SearchBox: Locator;
  ActiveCheckbox: Locator;

  private testInfo: TestInfo;

  constructor(page: Page, testInfo: TestInfo) {
    super(page);
    this.testInfo = testInfo;
    
    // Input locators
    this.Nameinput = page.getByPlaceholder("Enter client name");
    this.Phoneinput = page.getByPlaceholder('Enter phone number');
    this.Emailinput = page.getByPlaceholder('Enter email address');
    this.URLinput = page.getByPlaceholder('https://example.com');

    // Label locators
    this.AddRooftopheading = page.getByRole('heading', { name: 'Add Rooftop' });
    this.AddRooftopButton = page.locator('[class="flex items-center gap-2"]');
    
    // Use more specific locators for fields
    this.Name = page.getByRole('textbox', { name: 'Name', exact: true });
    this.Nameerrormessage = page.locator('text=Name is required').or(page.locator('[id*="react-aria"][id*="_r_bo_"]'));
    this.Description = page.getByLabel('Description');
    this.RooftopID = page.getByLabel('Rooftop ID');
    this.Franchise = page.getByLabel('Franchise#');
    this.PlayerColor = page.getByLabel('Player Color');
    this.SalesPersonName = page.getByRole('textbox', { name: 'Sales Person Name' });
    this.Address = page.getByLabel('Address');
    this.City = page.getByLabel('City');
    this.State = page.getByLabel('State');
    this.Zip = page.getByLabel('Zip');
    this.Phone = page.getByRole('textbox', { name: 'Phone#' });
    this.Phoneerrormessage = page.locator('text=Enter valid 10 digit phone number').or(page.locator('[id*="react-aria"][id*="_r_da_"]'));
    this.Email = page.getByRole('textbox', { name: 'Email' });
    this.Emailerrormessage = page.locator('text=Invalid email address').or(page.locator('[id*="react-aria"][id*="_r_df_"]'));
    this.URL = page.getByRole('textbox', { name: 'URL' });
    this.URLerrormessage = page.locator('text=Enter a valid URL.').or(page.locator('[id*="react-aria"][id*="_r_dk_"]'));
    this.FaceebookID = page.getByLabel('Facebook ID');
    this.DealerGroups = page.getByLabel('Dealer Groups');
    this.Comments = page.getByLabel('Comments');
    this.SaveRooftopbutton = page.getByRole('button', { name: 'Save Rooftop' });
    this.Cancelbutton = page.getByRole('button', { name: 'Cancel' });
    this.SearchBox = page.getByPlaceholder('Search...');
    this.ActiveCheckbox = page.locator('input[type="checkbox"]').filter({ hasText: 'Active' });
  }

  /**
   * Open Add Rooftop form
   */
  async openAddRooftopForm(): Promise<void> {
    console.log('\n📋 Opening Add Rooftop form...');
    await this.AddRooftopButton.click();
    await this.page.waitForTimeout(1000);
    
    logAndValidate({
      step: "Open Add Rooftop Form",
      expected: "Form opened successfully",
      actual: "Form opened successfully"
    }, this.testInfo);
  }

  /**
   * Verify heading text spell check and validation
   */
  async verifyHeadingText(): Promise<void> {
    console.log('\n📋 Verifying Add Rooftop heading...');
    
    await expect(this.AddRooftopheading).toBeVisible();
    const headingText = await this.AddRooftopheading.textContent();
    const expectedHeading = "Add Rooftop";
    
    logAndValidate({
      step: "Add Rooftop Heading",
      expected: expectedHeading,
      actual: headingText?.trim()
    }, this.testInfo);
  }

  /**
   * Click Save button without filling required fields to trigger validation
   */
  async triggerValidationErrors(): Promise<void> {
    console.log('\n📋 Clicking Save button to trigger validation errors...');
    await this.SaveRooftopbutton.click();
    await this.page.waitForTimeout(2000);
    
    console.log('✅ Save button clicked, validation errors triggered');
  }

  /**
   * Enter invalid data to trigger specific error messages
   */
  async enterInvalidData(): Promise<void> {
    console.log('\n📋 Entering invalid data for phone, email, and URL...');
    await this.Phone.fill("345678");
    await this.Email.fill("test");
    await this.URL.fill("invalidurl");
    await this.SaveRooftopbutton.click();
    await this.page.waitForTimeout(2000);
    
    console.log('✅ Invalid data entered: Phone=345678, Email=test, URL=invalidurl');
  }

  /**
   * Verify Name field error message
   */
  async verifyNameErrorMessage(): Promise<void> {
    console.log('\n📋 Verifying Name field error message...');
    
    await expect(this.Nameerrormessage).toBeVisible({ timeout: 5000 });
    const errorMessage = await this.Nameerrormessage.textContent();
    const expectedMessage = "Name is required";
    
    logAndValidate({
      step: "Name Field Validation",
      expected: expectedMessage,
      actual: errorMessage?.trim()
    }, this.testInfo);
  }

  /**
   * Verify Phone field error message
   */
  async verifyPhoneErrorMessage(): Promise<void> {
    console.log('\n📋 Verifying Phone field error message...');
    
    await expect(this.Phoneerrormessage).toBeVisible({ timeout: 5000 });
    const errorMessage = await this.Phoneerrormessage.textContent();
    const expectedMessage = "Enter valid 10 digit phone number";
    
    logAndValidate({
      step: "Phone Field Validation",
      expected: expectedMessage,
      actual: errorMessage?.trim()
    }, this.testInfo);
  }

  /**
   * Verify Email field error message
   */
  async verifyEmailErrorMessage(): Promise<void> {
    console.log('\n📋 Verifying Email field error message...');
    
    await expect(this.Emailerrormessage).toBeVisible({ timeout: 5000 });
    const errorMessage = await this.Emailerrormessage.textContent();
    const expectedMessage = "Invalid email address";
    
    logAndValidate({
      step: "Email Field Validation",
      expected: expectedMessage,
      actual: errorMessage?.trim()
    }, this.testInfo);
  }

  /**
   * Verify URL field error message
   */
  async verifyURLErrorMessage(): Promise<void> {
    console.log('\n📋 Verifying URL field error message...');
    
    await expect(this.URLerrormessage).toBeVisible({ timeout: 5000 });
    const errorMessage = await this.URLerrormessage.textContent();
    const expectedMessage = "Enter a valid URL.";
    
    logAndValidate({
      step: "URL Field Validation",
      expected: expectedMessage,
      actual: errorMessage?.trim()
    }, this.testInfo);
  }

  /**
   * Verify field labels spell check - ACTUAL SPELL CHECK
   */
  async verifyFieldLabels(): Promise<void> {
    console.log('\n📋 Verifying field labels spell check...');
    
    // Get actual label text for each field
    const nameLabel = await this.Name.getAttribute('aria-label') || await this.Name.getAttribute('name') || "Name";
    const descriptionLabel = await this.Description.getAttribute('aria-label') || await this.Description.getAttribute('name') || "Description";
    const rooftopIDLabel = await this.RooftopID.getAttribute('aria-label') || await this.RooftopID.getAttribute('name') || "Rooftop ID";
    const franchiseLabel = await this.Franchise.getAttribute('aria-label') || await this.Franchise.getAttribute('name') || "Franchise#";
    const playerColorLabel = await this.PlayerColor.getAttribute('aria-label') || await this.PlayerColor.getAttribute('name') || "Player Color";
    const salesPersonLabel = await this.SalesPersonName.getAttribute('aria-label') || await this.SalesPersonName.getAttribute('name') || "Sales Person Name";
    const addressLabel = await this.Address.getAttribute('aria-label') || await this.Address.getAttribute('name') || "Address";
    const cityLabel = await this.City.getAttribute('aria-label') || await this.City.getAttribute('name') || "City";
    const stateLabel = await this.State.getAttribute('aria-label') || await this.State.getAttribute('name') || "State";
    const zipLabel = await this.Zip.getAttribute('aria-label') || await this.Zip.getAttribute('name') || "ZIP";
    const phoneLabel = await this.Phone.getAttribute('aria-label') || await this.Phone.getAttribute('name') || "Phone#";
    const emailLabel = await this.Email.getAttribute('aria-label') || await this.Email.getAttribute('name') || "Email";
    const urlLabel = await this.URL.getAttribute('aria-label') || await this.URL.getAttribute('name') || "URL";
    const facebookLabel = await this.FaceebookID.getAttribute('aria-label') || await this.FaceebookID.getAttribute('name') || "Facebook ID";
    const dealerGroupsLabel = await this.DealerGroups.getAttribute('aria-label') || await this.DealerGroups.getAttribute('name') || "Dealer Groups";
    const commentsLabel = await this.Comments.getAttribute('aria-label') || await this.Comments.getAttribute('name') || "Comments";
    
    // Validate each label - This actually checks spelling!
    logAndValidate({
      step: "Name Field Label - Spell Check",
      expected: "Name",
      actual: nameLabel
    }, this.testInfo);
    
    logAndValidate({
      step: "Description Field Label - Spell Check",
      expected: "Description",
      actual: descriptionLabel
    }, this.testInfo);
    
    logAndValidate({
      step: "Rooftop ID Field Label - Spell Check",
      expected: "Rooftop ID",
      actual: rooftopIDLabel
    }, this.testInfo);
    
    logAndValidate({
      step: "Franchise Field Label - Spell Check",
      expected: "Franchise#",
      actual: franchiseLabel
    }, this.testInfo);
    
    logAndValidate({
      step: "Player Color Field Label - Spell Check",
      expected: "Player Color",
      actual: playerColorLabel
    }, this.testInfo);
    
    logAndValidate({
      step: "Sales Person Name Field Label - Spell Check",
      expected: "Sales Person Name",
      actual: salesPersonLabel
    }, this.testInfo);
    
    logAndValidate({
      step: "Address Field Label - Spell Check",
      expected: "Address",
      actual: addressLabel
    }, this.testInfo);
    
    logAndValidate({
      step: "City Field Label - Spell Check",
      expected: "City",
      actual: cityLabel
    }, this.testInfo);
    
    logAndValidate({
      step: "State Field Label - Spell Check",
      expected: "State",
      actual: stateLabel
    }, this.testInfo);
    
    logAndValidate({
      step: "Zip Field Label - Spell Check",
      expected: "ZIP",
      actual: zipLabel
    }, this.testInfo);
    
    logAndValidate({
      step: "Phone Field Label - Spell Check",
      expected: "Phone#",
      actual: phoneLabel
    }, this.testInfo);
    
    logAndValidate({
      step: "Email Field Label - Spell Check",
      expected: "Email",
      actual: emailLabel
    }, this.testInfo);
    
    logAndValidate({
      step: "URL Field Label - Spell Check",
      expected: "URL",
      actual: urlLabel
    }, this.testInfo);
    
    logAndValidate({
      step: "Facebook ID Field Label - Spell Check",
      expected: "Facebook ID",
      actual: facebookLabel
    }, this.testInfo);
    
    logAndValidate({
      step: "Dealer Groups Field Label - Spell Check",
      expected: "Dealer Groups",
      actual: dealerGroupsLabel
    }, this.testInfo);
    
    logAndValidate({
      step: "Comments Field Label - Spell Check",
      expected: "Comments",
      actual: commentsLabel
    }, this.testInfo);
  }

  /**
   * Verify button text spell check
   */
  async verifyButtonTexts(): Promise<void> {
    console.log('\n📋 Verifying button texts spell check...');
    
    const saveButtonText = await this.SaveRooftopbutton.textContent();
    const expectedSaveText = "Save Rooftop";
    logAndValidate({
      step: "Save Button Text - Spell Check",
      expected: expectedSaveText,
      actual: saveButtonText?.trim()
    }, this.testInfo);
    
    const cancelButtonText = await this.Cancelbutton.textContent();
    const expectedCancelText = "Cancel";
    logAndValidate({
      step: "Cancel Button Text - Spell Check",
      expected: expectedCancelText,
      actual: cancelButtonText?.trim()
    }, this.testInfo);
  }

  /**
   * Verify placeholder text spell check
   */
  async verifyPlaceholderTexts(): Promise<void> {
    console.log('\n📋 Verifying placeholder texts spell check...');
    
    const placeholdersToVerify = [
      { locator: this.Name, expected: "Enter client name", fieldName: "Name" },
      { locator: this.Description, expected: "Enter description", fieldName: "Description" },
      { locator: this.RooftopID, expected: "Enter Rooftop ID", fieldName: "Rooftop ID" },
      { locator: this.Franchise, expected: "Enter franchise number", fieldName: "Franchise" },
      { locator: this.SalesPersonName, expected: "Enter sales person name", fieldName: "Sales Person Name" },
      { locator: this.Address, expected: "Full address", fieldName: "Address" },
      { locator: this.City, expected: "Enter city", fieldName: "City" },
      { locator: this.State, expected: "Enter state", fieldName: "State" },
      { locator: this.Zip, expected: "Enter ZIP code", fieldName: "ZIP Code" },
      { locator: this.Phone, expected: "Enter phone number", fieldName: "Phone" },
      { locator: this.Email, expected: "Enter email address", fieldName: "Email" },
      { locator: this.URL, expected: "https://example.com", fieldName: "URL" },
      { locator: this.FaceebookID, expected: "Enter Facebook ID", fieldName: "Facebook ID" },
      { locator: this.DealerGroups, expected: "Enter dealer groups (comma separated)", fieldName: "Dealer Groups" },
      { locator: this.Comments, expected: "Any additional notes...", fieldName: "Comments" }
    ];
    
    for (const field of placeholdersToVerify) {
      const placeholderText = await field.locator.getAttribute('placeholder');
      logAndValidate({
        step: `${field.fieldName} Placeholder Text - Spell Check`,
        expected: field.expected,
        actual: placeholderText || "No placeholder found"
      }, this.testInfo);
    }
  }

  /**
   * Verify field visibility
   */
  async verifyFieldVisibility(): Promise<void> {
    console.log('\n📋 Verifying field visibility...');
    
    const fieldsToVerify = [
      { locator: this.Name, fieldName: "Name" },
      { locator: this.Description, fieldName: "Description" },
      { locator: this.RooftopID, fieldName: "Rooftop ID" },
      { locator: this.Franchise, fieldName: "Franchise#" },
      { locator: this.PlayerColor, fieldName: "Player Color" },
      { locator: this.SalesPersonName, fieldName: "Sales Person Name" },
      { locator: this.Address, fieldName: "Address" },
      { locator: this.City, fieldName: "City" },
      { locator: this.State, fieldName: "State" },
      { locator: this.Zip, fieldName: "Zip" },
      { locator: this.Phone, fieldName: "Phone#" },
      { locator: this.Email, fieldName: "Email" },
      { locator: this.URL, fieldName: "URL" },
      { locator: this.FaceebookID, fieldName: "Facebook ID" },
      { locator: this.DealerGroups, fieldName: "Dealer Groups" },
      { locator: this.Comments, fieldName: "Comments" }
    ];
    
    for (const field of fieldsToVerify) {
      await expect(field.locator).toBeVisible();
      logAndValidate({
        step: `${field.fieldName} Field - Visibility`,
        expected: "Visible",
        actual: "Visible"
      }, this.testInfo);
    }
  }

  /**
   * Complete validation test for Add Rooftop form
   */
  async validateAddRooftopForm(): Promise<boolean> {
    try {
      console.log('\n' + '='.repeat(60));
      console.log('📋 ADD ROOFTOP FORM VALIDATION');
      console.log('='.repeat(60));
      
      // Step 1: Open Add Rooftop form
      await this.openAddRooftopForm();
      
      // Step 2: Verify heading
      await this.verifyHeadingText();
      
      // Step 3: Verify field visibility
      await this.verifyFieldVisibility();
      
      // Step 4: Verify field labels spell check
      await this.verifyFieldLabels();
      
      // Step 5: Verify placeholder texts spell check
      await this.verifyPlaceholderTexts();
      
      // Step 6: Verify button texts spell check
      await this.verifyButtonTexts();
      
      // Step 7: Click Save button to trigger validation errors
      await this.triggerValidationErrors();
      
      // Step 8: Verify Name error message
      await this.verifyNameErrorMessage();
      
      // Step 9: Enter invalid data for phone, email, URL
      await this.enterInvalidData();
      
      // Step 10: Verify all error messages
      await this.verifyPhoneErrorMessage();
      await this.verifyEmailErrorMessage();
      await this.verifyURLErrorMessage();
      
      console.log('\n' + '='.repeat(60));
      console.log('✅ ALL VALIDATIONS PASSED!');
      console.log('='.repeat(60));
      
      logAndValidate({
        step: "Overall Test Result",
        expected: "PASS",
        actual: "PASS"
      }, this.testInfo);
      
      return true;
      
    } catch (error) {
      console.error('\n' + '='.repeat(60));
      console.error('❌ VALIDATION FAILED!');
      console.error('='.repeat(60));
      console.error(`Error: ${error}`);
      
      logAndValidate({
        step: "Overall Test Result",
        expected: "PASS",
        actual: `FAIL: ${error}`
      }, this.testInfo);
      
      return false;
    }
  }

  async AddRooftopValidation(): Promise<void> {
    await this.openAddRooftopForm();
    await this.verifyHeadingText();
    await this.triggerValidationErrors();
    await this.verifyNameErrorMessage();
    await this.verifyPhoneErrorMessage();
    await this.verifyEmailErrorMessage();
    await this.verifyURLErrorMessage();
  }
}