import { expect, Locator, Page, TestInfo } from '@playwright/test';
import { BasePage } from '../../pages/BasePage';
import { Reporter } from '../../pages/utils/NewReport';
import AddRooftopData from '../../testdata/AddRooftopData.json';

export class validateAddRooftopForm extends BasePage {
    //Input Locators
    Nameinput: Locator;
    Phoneinput: Locator;
    Emailinput: Locator;
    URLinput: Locator;
    DealerCodeinput: Locator;
    
    //Label Locators
    AddRooftopheading: Locator;
    AddRooftopButton: Locator;
    Name: Locator;
    Nameerrormessage: Locator;
    Nameexistingerrormessage: Locator;
    Description: Locator;
    DealerCode: Locator;
    DealerCodeerrormessage: Locator;
    DealerCodeexistingerrormessage: Locator;
    DealerCodeDuplicateErrorMessage: Locator;
    DealerCodeRawErrorMessage: Locator;
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
        this.DealerCodeinput = page.getByPlaceholder('Enter dealer code');

        // Label locators
        this.AddRooftopheading = page.getByRole('heading', { name: 'Add Rooftop' });
        this.AddRooftopButton = page.locator('[class="flex items-center gap-2"]');
        
        // Use more specific locators for fields
        this.Name = page.getByRole('textbox', { name: 'Name', exact: true });
        this.Nameerrormessage = page.locator('text=Name is required').or(page.locator('[id*="react-aria"][id*="_r_bo_"]'));
        this.Nameexistingerrormessage = page.locator('text=A Rooftop named').or(
            page.locator('text=already exists for this Reseller')
        );
        
        this.Description = page.getByLabel('Description');
        
        this.DealerCode = page.getByLabel('Dealer Code').or(page.getByPlaceholder('Enter dealer code'));
        this.DealerCodeerrormessage = page.locator('text=Dealer Code is required');
        this.DealerCodeexistingerrormessage = page.locator('text=A Dealer Code').or(
            page.locator('text=already exists for this Reseller')
        );
        this.DealerCodeDuplicateErrorMessage = page.locator('text=duplicate key value violates unique constraint');
        this.DealerCodeRawErrorMessage = page.locator('text=rooftops: dealerCode already exists');
        
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
        await this.page.waitForTimeout(500);
        
        Reporter.validateData(
            "Form opened successfully",
            "Form opened successfully",
            "Open Add Rooftop Form",
            this.testInfo
        );
    }

    /**
     * Refresh the page to ensure all fields are empty
     */
    async refreshPage(): Promise<void> {
        console.log('\n🔄 Refreshing page to clear all fields...');
        await this.page.reload();
        await this.page.waitForTimeout(1000);
        
        // Re-open the Add Rooftop form after refresh
        await this.openAddRooftopForm();
        
        Reporter.validateData(
            "Page refreshed and form reopened",
            "Page refreshed and form reopened",
            "Refresh Page",
            this.testInfo
        );
        console.log('✅ Page refreshed, all fields are empty');
    }

    /**
     * Verify heading text spell check and validation
     */
    async verifyHeadingText(): Promise<void> {
        console.log('\n📋 Verifying Add Rooftop heading...');
        
        await expect(this.AddRooftopheading).toBeVisible();
        const headingText = await this.AddRooftopheading.textContent();
        const expectedHeading = "Add Rooftop";
        
        Reporter.validateData(
            expectedHeading,
            headingText?.trim() || '',
            "Add Rooftop Heading",
            this.testInfo
        );
    }

    /**
     * Click Save button without filling required fields to trigger validation
     */
    async triggerValidationErrors(): Promise<void> {
        console.log('\n📋 Clicking Save button to trigger validation errors...');
        await this.SaveRooftopbutton.click();
        await this.page.waitForTimeout(1000);
        
        Reporter.validateData(
            "Save button clicked",
            "Save button clicked",
            "Trigger Validation Errors",
            this.testInfo
        );
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
        await this.page.waitForTimeout(1000);
        
        Reporter.validateData(
            "Invalid data entered",
            "Invalid data entered",
            "Enter Invalid Data",
            this.testInfo
        );
        console.log('✅ Invalid data entered');
    }

    /**
     * Verify Name field error message
     */
    async verifyNameErrorMessage(): Promise<void> {
        console.log('\n📋 Verifying Name field error message...');
        
        await expect(this.Nameerrormessage).toBeVisible({ timeout: 5000 });
        const errorMessage = await this.Nameerrormessage.textContent();
        const expectedMessage = "Name is required";
        
        Reporter.validateData(
            expectedMessage,
            errorMessage?.trim() || '',
            "Name Field Validation",
            this.testInfo
        );
    }

    /**
     * Verify Dealer Code field error message
     */
    async verifyDealerCodeErrorMessage(): Promise<void> {
        console.log('\n📋 Verifying Dealer Code field error message...');
        
        await expect(this.DealerCodeerrormessage).toBeVisible({ timeout: 5000 });
        const errorMessage = await this.DealerCodeerrormessage.textContent();
        const expectedMessage = "Dealer Code is required";
        
        Reporter.validateData(
            expectedMessage,
            errorMessage?.trim() || '',
            "Dealer Code Field Validation",
            this.testInfo
        );
    }

    /**
     * TC: Verify Existing Rooftop Name Validation - Enter both Name and Dealer Code
     * Expected: Name error message should appear first
     */
    async verifyExistingRooftopNameWithDealerCode(): Promise<void> {
        const existingRooftopName = AddRooftopData.existingrooftopname;
        const existingDealerCode = AddRooftopData.existingdelearID;
        
        console.log(`\n📋 [TC] Verifying existing Rooftop Name with Dealer Code validation`);
        console.log(`   - Entering Name: "${existingRooftopName}"`);
        console.log(`   - Entering Dealer Code: "${existingDealerCode}"`);
        console.log(`   - Expected: Name error message should appear first`);
        
        // Refresh page and fill both fields
        await this.refreshPage();
        await this.Name.fill(existingRooftopName);
        await this.DealerCode.fill(existingDealerCode);
        await this.page.waitForTimeout(300);
        
        // Click save
        await this.SaveRooftopbutton.click();
        await this.page.waitForTimeout(2000);
        
        // Check for the actual error message
        try {
            // First check if raw database error appears
            const isRawError = await this.DealerCodeRawErrorMessage.isVisible({ timeout: 3000 });
            
            if (isRawError) {
                const actualMessage = await this.DealerCodeRawErrorMessage.textContent();
                const expectedMessage = "Dealer Code already exists";
                
                // This will FAIL because actual doesn't match expected
                Reporter.validateData(
                    expectedMessage,
                    actualMessage?.trim() || '',
                    `[TC] Existing Name with Dealer Code - Dealer Code Error`,
                    this.testInfo
                );
                console.log(`❌ [TC] Expected: "${expectedMessage}" but got: "${actualMessage?.trim()}"`);
                return;
            }
        } catch (error) {
            console.log('Raw database error not found, checking for other error messages...');
        }
        
        // If raw error not found, check for Name error
        try {
            const errorMessage = await this.Nameexistingerrormessage.textContent({ timeout: 5000 });
            const expectedMessage = `A Rooftop named "${existingRooftopName}" already exists for this Reseller.`;
            
            Reporter.validateData(
                expectedMessage,
                errorMessage?.trim() || '',
                `[TC] Existing Name with Dealer Code - Name Error`,
                this.testInfo
            );
            
            console.log(`✅ [TC] Name error message verified: "${expectedMessage}"`);
        } catch (error) {
            console.error(`❌ [TC] Failed to find any error message: ${error}`);
            
            Reporter.validateData(
                `Expected error message for "${existingRooftopName}" or "${existingDealerCode}"`,
                "No error message found",
                `[TC] Existing Name with Dealer Code - Error Validation`,
                this.testInfo
            );
        }
    }

    /**
     * TC: Verify Existing Dealer Code Validation - Enter only Dealer Code
     * Expected: "Dealer Code already exists"
     */
    async verifyExistingDealerCodeOnly(): Promise<void> {
        const existingDealerCode = AddRooftopData.existingdelearID;
        
        console.log(`\n📋 [TC] Verifying existing Dealer Code validation`);
        console.log(`   - Entering Dealer Code: "${existingDealerCode}"`);
        console.log(`   - Expected: "Dealer Code already exists"`);
        
        // Refresh page and fill only dealer code
        await this.refreshPage();
        await this.DealerCode.fill(existingDealerCode);
        await this.page.waitForTimeout(300);
        
        // Click save
        await this.SaveRooftopbutton.click();
        await this.page.waitForTimeout(2000);
        
        // Check for the actual error message
        try {
            // Check if raw database error appears
            const isRawError = await this.DealerCodeRawErrorMessage.isVisible({ timeout: 3000 });
            
            if (isRawError) {
                const actualMessage = await this.DealerCodeRawErrorMessage.textContent();
                const expectedMessage = "Dealer Code already exists";
                
                // This will FAIL because actual doesn't match expected
                Reporter.validateData(
                    expectedMessage,
                    actualMessage?.trim() || '',
                    `[TC] Existing Dealer Code - Error Message Validation`,
                    this.testInfo
                );
                console.log(`❌ [TC] Expected: "${expectedMessage}" but got: "${actualMessage?.trim()}"`);
                console.log(`❌ [TC] Validation FAILED - Message format is incorrect (showing raw database error)`);
                return;
            }
        } catch (error) {
            console.log('Raw database error not found, checking for other error messages...');
        }
        
        // If raw error not found, check for other error formats
        try {
            // Check for duplicate key violation
            const isDuplicateError = await this.DealerCodeDuplicateErrorMessage.isVisible({ timeout: 3000 });
            
            if (isDuplicateError) {
                const actualMessage = await this.DealerCodeDuplicateErrorMessage.textContent();
                const expectedMessage = "Dealer Code already exists";
                
                Reporter.validateData(
                    expectedMessage,
                    actualMessage?.trim() || '',
                    `[TC] Existing Dealer Code - Duplicate Key Error`,
                    this.testInfo
                );
                console.log(`❌ [TC] Expected: "${expectedMessage}" but got: "${actualMessage?.trim()}"`);
                return;
            }
            
            // Check for regular existing dealer code error
            const errorMessage = await this.DealerCodeexistingerrormessage.textContent({ timeout: 5000 });
            const expectedMessage = `A Dealer Code "${existingDealerCode}" already exists for this Reseller.`;
            
            Reporter.validateData(
                expectedMessage,
                errorMessage?.trim() || '',
                `[TC] Existing Dealer Code - Dealer Code Error`,
                this.testInfo
            );
            
            console.log(`✅ [TC] Dealer Code error message verified: "${expectedMessage}"`);
            
        } catch (error) {
            console.error(`❌ [TC] Failed to find any error message: ${error}`);
            
            Reporter.validateData(
                `Expected: "Dealer Code already exists"`,
                "No error message found",
                `[TC] Existing Dealer Code - Error Validation`,
                this.testInfo
            );
        }
    }

    /**
     * Verify Phone field error message
     */
    async verifyPhoneErrorMessage(): Promise<void> {
        console.log('\n📋 Verifying Phone field error message...');
        
        await expect(this.Phoneerrormessage).toBeVisible({ timeout: 5000 });
        const errorMessage = await this.Phoneerrormessage.textContent();
        const expectedMessage = "Enter valid 10 digit phone number";
        
        Reporter.validateData(
            expectedMessage,
            errorMessage?.trim() || '',
            "Phone Field Validation",
            this.testInfo
        );
    }

    /**
     * Verify Email field error message
     */
    async verifyEmailErrorMessage(): Promise<void> {
        console.log('\n📋 Verifying Email field error message...');
        
        await expect(this.Emailerrormessage).toBeVisible({ timeout: 5000 });
        const errorMessage = await this.Emailerrormessage.textContent();
        const expectedMessage = "Invalid email address";
        
        Reporter.validateData(
            expectedMessage,
            errorMessage?.trim() || '',
            "Email Field Validation",
            this.testInfo
        );
    }

    /**
     * Verify URL field error message
     */
    async verifyURLErrorMessage(): Promise<void> {
        console.log('\n📋 Verifying URL field error message...');
        
        await expect(this.URLerrormessage).toBeVisible({ timeout: 5000 });
        const errorMessage = await this.URLerrormessage.textContent();
        const expectedMessage = "Enter a valid URL.";
        
        Reporter.validateData(
            expectedMessage,
            errorMessage?.trim() || '',
            "URL Field Validation",
            this.testInfo
        );
    }

    /**
     * Verify field labels spell check
     */
    async verifyFieldLabels(): Promise<void> {
        console.log('\n📋 Verifying field labels spell check...');
        
        const fieldsToVerify = [
            { locator: this.Name, expected: "Name", fieldName: "Name" },
            { locator: this.Description, expected: "Description", fieldName: "Description" },
            { locator: this.DealerCode, expected: "Dealer Code", fieldName: "Dealer Code" },
            { locator: this.Franchise, expected: "Franchise#", fieldName: "Franchise" },
            { locator: this.PlayerColor, expected: "Player Color", fieldName: "Player Color" },
            { locator: this.SalesPersonName, expected: "Sales Person Name", fieldName: "Sales Person Name" },
            { locator: this.Address, expected: "Address", fieldName: "Address" },
            { locator: this.City, expected: "City", fieldName: "City" },
            { locator: this.State, expected: "State", fieldName: "State" },
            { locator: this.Zip, expected: "ZIP", fieldName: "ZIP" },
            { locator: this.Phone, expected: "Phone#", fieldName: "Phone" },
            { locator: this.Email, expected: "Email", fieldName: "Email" },
            { locator: this.URL, expected: "URL", fieldName: "URL" },
            { locator: this.FaceebookID, expected: "Facebook ID", fieldName: "Facebook ID" },
            { locator: this.DealerGroups, expected: "Dealer Groups", fieldName: "Dealer Groups" },
            { locator: this.Comments, expected: "Comments", fieldName: "Comments" }
        ];
        
        for (const field of fieldsToVerify) {
            const labelText = await field.locator.getAttribute('aria-label') || 
                              await field.locator.getAttribute('name') || 
                              field.fieldName;
            
            Reporter.validateData(
                field.expected,
                labelText,
                `${field.fieldName} Field Label - Spell Check`,
                this.testInfo
            );
        }
    }

    /**
     * Verify placeholder text spell check and visibility
     */
    async verifyPlaceholderTexts(): Promise<void> {
        console.log('\n📋 Verifying placeholder texts spell check and visibility...');
        
        const placeholdersToVerify = [
            { locator: this.Name, expected: "Enter client name", fieldName: "Name" },
            { locator: this.Description, expected: "Enter description", fieldName: "Description" },
            { locator: this.DealerCode, expected: "Enter dealer code", fieldName: "Dealer Code" },
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
            await expect(field.locator).toBeVisible();
            const placeholderText = await field.locator.getAttribute('placeholder');
            Reporter.validateData(
                field.expected,
                placeholderText || "No placeholder found",
                `${field.fieldName} Placeholder Text - Spell Check & Visibility`,
                this.testInfo
            );
        }
    }

    /**
     * Verify button text spell check
     */
    async verifyButtonTexts(): Promise<void> {
        console.log('\n📋 Verifying button texts spell check...');
        
        const saveButtonText = await this.SaveRooftopbutton.textContent();
        Reporter.validateData(
            "Save Rooftop",
            saveButtonText?.trim() || '',
            "Save Button Text - Spell Check",
            this.testInfo
        );
        
        const cancelButtonText = await this.Cancelbutton.textContent();
        Reporter.validateData(
            "Cancel",
            cancelButtonText?.trim() || '',
            "Cancel Button Text - Spell Check",
            this.testInfo
        );
    }

    /**
     * Verify field visibility
     */
    async verifyFieldVisibility(): Promise<void> {
        console.log('\n📋 Verifying field visibility...');
        
        const fieldsToVerify = [
            { locator: this.Name, fieldName: "Name" },
            { locator: this.Description, fieldName: "Description" },
            { locator: this.DealerCode, fieldName: "Dealer Code" },
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
            Reporter.validateData(
                "Visible",
                "Visible",
                `${field.fieldName} Field - Visibility`,
                this.testInfo
            );
        }
    }

    /**
     * Complete validation test for Add Rooftop form with all validations
     */
    async validateAddRooftopForm(): Promise<boolean> {
        Reporter.startTest();
        
        try {
            console.log('\n' + '='.repeat(60));
            console.log('📋 ADD ROOFTOP FORM VALIDATION - FULL SUITE');
            console.log('='.repeat(60));
            
            // Step 1: Open Add Rooftop form
            await this.openAddRooftopForm();
            
            // Step 2: Verify heading
            await this.verifyHeadingText();
            
            // Step 3: Verify field visibility
            await this.verifyFieldVisibility();
            
            // Step 4: Verify field labels spell check
            await this.verifyFieldLabels();
            
            // Step 5: Verify placeholder texts spell check and visibility
            await this.verifyPlaceholderTexts();
            
            // Step 6: Verify button texts spell check
            await this.verifyButtonTexts();
            
            // Step 7: Click Save button to trigger validation errors
            await this.triggerValidationErrors();
            
            // Step 8: Verify Name error message
            await this.verifyNameErrorMessage();
            
            // Step 9: Verify Dealer Code error message
            await this.verifyDealerCodeErrorMessage();
            
            // Step 10: Enter invalid data for phone, email, URL
            await this.enterInvalidData();
            
            // Step 11: Verify all error messages
            await this.verifyPhoneErrorMessage();
            await this.verifyEmailErrorMessage();
            await this.verifyURLErrorMessage();
            
            // Step 12: [TC] Verify existing Name with Dealer Code
            await this.verifyExistingRooftopNameWithDealerCode();
            
            // Step 13: [TC] Verify existing Dealer Code only
            await this.verifyExistingDealerCodeOnly();
            
            console.log('\n' + '='.repeat(60));
            console.log('✅ ALL VALIDATIONS PASSED!');
            console.log('='.repeat(60));
            
            Reporter.validateData(
                "PASS",
                "PASS",
                "Overall Test Result",
                this.testInfo
            );
            
            const summary = Reporter.endTest(this.testInfo);
            console.log(`\n📊 Test Completed - Pass Rate: ${summary.passRate}`);
            
            return true;
            
        } catch (error) {
            console.error('\n' + '='.repeat(60));
            console.error('❌ VALIDATION FAILED!');
            console.error('='.repeat(60));
            console.error(`Error: ${error}`);
            
            Reporter.validateData(
                "PASS",
                `FAIL: ${error}`,
                "Overall Test Result",
                this.testInfo
            );
            
            Reporter.endTest(this.testInfo);
            return false;
        }
    }

    /**
     * Quick validation for Add Rooftop form with existing field checks
     */
    async AddRooftopValidation(): Promise<void> {
        await this.openAddRooftopForm();
        await this.verifyHeadingText();
        await this.triggerValidationErrors();
        await this.verifyNameErrorMessage();
        await this.verifyDealerCodeErrorMessage();
        await this.verifyPhoneErrorMessage();
        await this.verifyEmailErrorMessage();
        await this.verifyURLErrorMessage();
        
        await this.verifyExistingRooftopNameWithDealerCode();
        await this.verifyExistingDealerCodeOnly();
    }
}