import { expect, Locator, Page, TestInfo } from '@playwright/test';
import { BasePage } from '../../BasePage';
import { Reporter } from '../../utils/NewReport';

export class rooftopUserValidation extends BasePage {

  // Buttons
  addUserButton: Locator;
  saveUserButton: Locator;
  cancelButton: Locator;

  // Labels
  usernameLabel: Locator;
  passwordLabel: Locator;
  userTypeLabel: Locator;
  emailLabel: Locator;
  activeLabel: Locator;
  availableRooftopsLabel: Locator;
  assignedRooftopsLabel: Locator;

  // Placeholders
  usernamePlaceholder: Locator;
  passwordPlaceholder: Locator;
  emailPlaceholder: Locator;
  userTypeDropdown: Locator;
  userTypeDisplay: Locator;
  availableRooftopsSearch: Locator;
  assignedRooftopsSearch: Locator;

  // Error Messages
  usernameErrorMessage: Locator;
  passwordErrorMessage: Locator;
  userTypeErrorMessage: Locator;
  emailErrorMessage: Locator;
  rooftopsErrorMessage: Locator;

  // Character Count/Validation Messages
  usernameCharCountMessage: Locator;
  passwordCharCountMessage: Locator;
  emailValidationMessage: Locator;

  // Checkbox
  activeCheckbox: Locator;
  activeCheckboxInput: Locator;

  constructor(page: Page) {
    super(page);

    // Buttons
    this.addUserButton = page.locator('[class="lucide lucide-plus"]');
    this.saveUserButton = page.getByRole('button', { name: 'Save User' });
    this.cancelButton = page.getByRole('button', { name: 'Cancel' });

    // Labels
    this.usernameLabel = page.locator('label:has-text("Username")');
    this.passwordLabel = page.locator('label:has-text("Password")');
    this.userTypeLabel = page.locator('label:has-text("User Type")');
    this.emailLabel = page.locator('label:has-text("Email")');
    this.activeLabel = page.locator('label:has-text("Active")');
    this.availableRooftopsLabel = page.locator('text=AVAILABLE ROOFTOPS');
    this.assignedRooftopsLabel = page.locator('text=ASSIGNED ROOFTOPS');

    // Placeholders
    this.usernamePlaceholder = page.getByPlaceholder('Enter username');
    this.passwordPlaceholder = page.getByPlaceholder('Enter password');
    this.emailPlaceholder = page.getByPlaceholder('Enter email address');
    this.userTypeDropdown = page.locator('[data-form-field="userTypeId"]');
    this.userTypeDisplay = page.locator('[data-form-field="userTypeId"] .selected-value, [data-form-field="userTypeId"] .single-value, [data-form-field="userTypeId"] .value');
    this.availableRooftopsSearch = page.locator('input[placeholder="Search..."]').first();
    this.assignedRooftopsSearch = page.locator('input[placeholder="Search..."]').last();

    // Error Messages
    this.usernameErrorMessage = page.getByText('Username is required');
    this.passwordErrorMessage = page.getByText('Password is required');
    this.userTypeErrorMessage = page.getByText('User Type is required');
    this.emailErrorMessage = page.getByText('Email is required');
    this.rooftopsErrorMessage = page.getByText('Select at least 1 item');

    // Character Count/Validation Messages
    this.usernameCharCountMessage = page.getByText('Must be at least 3 characters long.');
    this.passwordCharCountMessage = page.getByText('Must be at least 6 characters long.');
    this.emailValidationMessage = page.getByText('Invalid email address');

    // Checkbox - Using multiple selectors for reliability
    this.activeCheckbox = page.locator('svg.lucide-check');
    this.activeCheckboxInput = page.locator('input[type="checkbox"]');
  }

  // =========================================================
  // Click On Add User Button - Using reliable method
  // =========================================================

  async clickOnAddUserButton() {
    await this.clickButtonReliably(this.addUserButton);
    await this.page.waitForTimeout(2000);
  }

  // =========================================================
  // Reliable Button Click - Same as AddUser
  // =========================================================

  private async clickButtonReliably(button: Locator): Promise<void> {
    try {
      await button.click({ timeout: 5000 });
      return;
    } catch (error) {
      console.log('Normal click failed, trying force click...');
    }

    try {
      await button.click({ force: true, timeout: 5000 });
      return;
    } catch (error) {
      console.log('Force click failed, trying JavaScript...');
    }

    try {
      const buttonText = await button.textContent() || 'button';
      await this.page.evaluate((text) => {
        const buttons = document.querySelectorAll('button, [role="button"], .lucide-plus');
        for (const btn of buttons) {
          if (btn.textContent?.includes(text) || 
              btn.getAttribute('class')?.includes('lucide-plus')) {
            (btn as HTMLElement).click();
            return;
          }
        }
      }, buttonText);
      return;
    } catch (error) {
      console.log('JavaScript click failed, trying coordinates...');
    }

    try {
      const box = await button.boundingBox();
      if (box) {
        await this.page.mouse.click(
          box.x + box.width / 2,
          box.y + box.height / 2
        );
        return;
      }
    } catch (error) {
      console.log('Coordinates click failed');
    }

    throw new Error('All click methods failed');
  }

  // =========================================================
  // Helper method for text validation
  // =========================================================

  private async validateText(
    actual: string | null | undefined,
    expected: string,
    fieldName: string,
    testInfo: TestInfo
  ) {
    const actualText = actual?.trim() || '';
    Reporter.validateData(expected, actualText, fieldName, testInfo);
  }

  // =========================================================
  // Helper method to check if User Type has a value selected
  // =========================================================

  private async isUserTypeSelected(): Promise<boolean> {
    try {
      // Check if the dropdown shows "Select an option" or has a selected value
      const userTypeText = await this.userTypeDropdown.textContent();
      if (userTypeText) {
        // If it contains "Select an option", no value is selected
        return !userTypeText.includes('Select an option');
      }
      return false;
    } catch (error) {
      return false;
    }
  }

  // =========================================================
  // Verify Labels Text
  // =========================================================

  async verifyLabelsText(testInfo: TestInfo) {
    // Validate Username label
    const usernameText = await this.usernameLabel.textContent();
    await this.validateText(usernameText, 'Username*', 'Username label', testInfo);

    // Validate Password label
    const passwordText = await this.passwordLabel.textContent();
    await this.validateText(passwordText, 'Password*', 'Password label', testInfo);

    // Validate User Type label
    const userTypeText = await this.userTypeLabel.textContent();
    await this.validateText(userTypeText, 'User Type*', 'User Type label', testInfo);

    // Validate Email label
    const emailText = await this.emailLabel.textContent();
    await this.validateText(emailText, 'Email*', 'Email label', testInfo);

    // Validate Active label
    const activeText = await this.activeLabel.textContent();
    await this.validateText(activeText, 'Active', 'Active label', testInfo);

    // Validate Available Rooftops label
    const availableRooftopsText = await this.availableRooftopsLabel.textContent();
    await this.validateText(availableRooftopsText, 'AVAILABLE ROOFTOPS', 'Available Rooftops label', testInfo);

    // Validate Assigned Rooftops label
    const assignedRooftopsText = await this.assignedRooftopsLabel.textContent();
    await this.validateText(assignedRooftopsText, 'ASSIGNED ROOFTOPS', 'Assigned Rooftops label', testInfo);

    // Validate Cancel button text
    const cancelButtonText = await this.cancelButton.textContent();
    await this.validateText(cancelButtonText, 'Cancel', 'Cancel button text', testInfo);

    // Validate Save User button text
    const saveUserButtonText = await this.saveUserButton.textContent();
    await this.validateText(saveUserButtonText, 'Save User', 'Save User button text', testInfo);
  }

  // =========================================================
  // Verify Placeholder Text
  // =========================================================

  async verifyPlaceholderText(testInfo: TestInfo) {
    // Validate Username placeholder
    const usernamePlaceholderText = await this.usernamePlaceholder.getAttribute('placeholder');
    Reporter.validateData('Enter username', usernamePlaceholderText, 'Username placeholder', testInfo);

    // Validate Password placeholder
    const passwordPlaceholderText = await this.passwordPlaceholder.getAttribute('placeholder');
    Reporter.validateData('Enter password', passwordPlaceholderText, 'Password placeholder', testInfo);

    // Validate User Type placeholder - Check if "Select an option" is present
    const userTypeText = await this.userTypeDropdown.textContent();
    const hasSelectOption = userTypeText?.includes('Select an option') || false;
    Reporter.validateData(true, hasSelectOption, 'User Type placeholder', testInfo);

    // Validate Email placeholder
    const emailPlaceholderText = await this.emailPlaceholder.getAttribute('placeholder');
    Reporter.validateData('Enter email address', emailPlaceholderText, 'Email placeholder', testInfo);

    // Validate Available Rooftops search placeholder
    const availableRooftopsPlaceholder = await this.availableRooftopsSearch.getAttribute('placeholder');
    Reporter.validateData('Search...', availableRooftopsPlaceholder, 'Available Rooftops search placeholder', testInfo);

    // Validate Assigned Rooftops search placeholder
    const assignedRooftopsPlaceholder = await this.assignedRooftopsSearch.getAttribute('placeholder');
    Reporter.validateData('Search...', assignedRooftopsPlaceholder, 'Assigned Rooftops search placeholder', testInfo);
  }

  // =========================================================
  // Verify Required Field Validations
  // =========================================================

  async verifyRequiredFieldValidations(testInfo: TestInfo) {
    // Click Save without filling any fields
    await this.clickButtonReliably(this.saveUserButton);
    await this.page.waitForTimeout(2000);

    // Validate Username required message
    const usernameError = await this.usernameErrorMessage.textContent();
    Reporter.validateData('Username is required', usernameError?.trim(), 'Username required validation', testInfo);

    // Validate Password required message
    const passwordError = await this.passwordErrorMessage.textContent();
    Reporter.validateData('Password is required', passwordError?.trim(), 'Password required validation', testInfo);

    // Validate User Type required message
    const userTypeError = await this.userTypeErrorMessage.textContent();
    Reporter.validateData('User Type is required', userTypeError?.trim(), 'User Type required validation', testInfo);

    // Validate Email required message
    const emailError = await this.emailErrorMessage.textContent();
    Reporter.validateData('Email is required', emailError?.trim(), 'Email required validation', testInfo);

    // Validate Rooftops required message
    const rooftopsError = await this.rooftopsErrorMessage.textContent();
    Reporter.validateData('Select at least 1 item', rooftopsError?.trim(), 'Rooftops required validation', testInfo);

    // Validate checkbox is unchecked by default - Using input element for reliability
    try {
      // Try to find the checkbox input
      const checkboxInput = this.page.locator('input[type="checkbox"]');
      const isChecked = await checkboxInput.isChecked().catch(() => false);
      Reporter.validateData(false, isChecked, 'Active checkbox default state', testInfo);
    } catch (error) {
      // If checkbox input not found, check if the svg has the check class
      const svgCheck = this.activeCheckbox;
      const isVisible = await svgCheck.isVisible().catch(() => false);
      // If svg.lucide-check is visible, it means the checkbox is checked
      // But by default it should be unchecked (svg should be hidden or have different class)
      Reporter.validateData(false, isVisible, 'Active checkbox default state', testInfo);
    }
  }

  // =========================================================
  // Verify Invalid Field Validations
  // =========================================================

  async verifyInvalidFieldValidations(testInfo: TestInfo) {
    // Enter invalid data
    await this.usernamePlaceholder.fill('ab');
    await this.passwordPlaceholder.fill('123');
    await this.emailPlaceholder.fill('TPK');

    await this.clickButtonReliably(this.saveUserButton);
    await this.page.waitForTimeout(2000);

    // Validate Username character count message
    const usernameError = await this.usernameCharCountMessage.textContent();
    Reporter.validateData(
      'Must be at least 3 characters long.',
      usernameError?.trim(),
      'Username character count validation',
      testInfo
    );

    // Validate Password character count message
    const passwordError = await this.passwordCharCountMessage.textContent();
    Reporter.validateData(
      'Must be at least 6 characters long.',
      passwordError?.trim(),
      'Password character count validation',
      testInfo
    );

    // Validate Email validation message
    const emailError = await this.emailValidationMessage.textContent();
    Reporter.validateData(
      'Invalid email address',
      emailError?.trim(),
      'Email format validation',
      testInfo
    );
  }

  // =========================================================
  // Verify Rooftop Selection Validation
  // =========================================================

  async verifyRooftopValidation(testInfo: TestInfo) {
    // Fill other required fields
    await this.usernamePlaceholder.fill('testuser');
    await this.passwordPlaceholder.fill('Test@123');
    await this.emailPlaceholder.fill('test@example.com');
    
    // Select User Type using JavaScript
    await this.selectUserType(2); // Select "Load Test" or any other option
    
    // Click Save without selecting rooftop
    await this.clickButtonReliably(this.saveUserButton);
    await this.page.waitForTimeout(2000);

    // Validate Rooftops required message
    const rooftopsError = await this.rooftopsErrorMessage.textContent();
    Reporter.validateData(
      'Select at least 1 item',
      rooftopsError?.trim(),
      'Rooftops required validation',
      testInfo
    );
  }

  // =========================================================
  // Select User Type using JavaScript (reliable method)
  // =========================================================

  private async selectUserType(index: number): Promise<void> {
    await this.page.evaluate((idx) => {
      try {
        document.querySelectorAll('[inert]').forEach(el => {
          el.removeAttribute('inert');
        });

        const container = document.querySelector('[data-form-field="userTypeId"]');
        if (container) {
          container.removeAttribute('inert');
          const select = container.querySelector('select');
          if (select && select.options.length > idx) {
            select.selectedIndex = idx;
            select.dispatchEvent(new Event('change', { bubbles: true }));
            select.dispatchEvent(new Event('input', { bubbles: true }));
            return;
          }
        }

        // Fallback: Click the dropdown and select option
        const trigger = document.querySelector('[data-form-field="userTypeId"] div[role="button"]');
        if (trigger) {
          (trigger as HTMLElement).click();
          setTimeout(() => {
            const options = document.querySelectorAll('[role="option"]');
            if (options.length > idx) {
              (options[idx] as HTMLElement).click();
            }
          }, 300);
        }
      } catch (e) {
        console.log('Error selecting user type:', e);
      }
    }, index);

    await this.page.waitForTimeout(500);
  }

  // =========================================================
  // Clear All Form Fields
  // =========================================================

  async clearAllFields() {
    await this.usernamePlaceholder.clear();
    await this.passwordPlaceholder.clear();
    await this.emailPlaceholder.clear();
    // User Type and Rooftops will be handled separately
  }

  // =========================================================
  // Complete User Form Validation
  // =========================================================

  async verifyCompleteFormValidation(testInfo: TestInfo) {
    Reporter.startTest();

    try {
      await this.clickOnAddUserButton();
      await this.verifyLabelsText(testInfo);
      await this.verifyPlaceholderText(testInfo);
      await this.verifyRequiredFieldValidations(testInfo);
      await this.verifyInvalidFieldValidations(testInfo);
      await this.verifyRooftopValidation(testInfo);
    } finally {
      Reporter.endTest(testInfo);
    }
  }

  // =========================================================
  // Debug method
  // =========================================================

  async debugFormState() {
    console.log('=== DEBUG: Form State ===');
    
    const usernameVisible = await this.usernamePlaceholder.isVisible().catch(() => false);
    console.log('Username field visible:', usernameVisible);
    
    const passwordVisible = await this.passwordPlaceholder.isVisible().catch(() => false);
    console.log('Password field visible:', passwordVisible);
    
    const emailVisible = await this.emailPlaceholder.isVisible().catch(() => false);
    console.log('Email field visible:', emailVisible);
    
    const userTypeText = await this.userTypeDropdown.textContent().catch(() => 'No text');
    console.log('User Type text:', userTypeText);
    
    const saveButtonEnabled = await this.saveUserButton.isEnabled().catch(() => false);
    console.log('Save button enabled:', saveButtonEnabled);
    
    // Check checkbox state
    const checkboxChecked = await this.activeCheckboxInput.isChecked().catch(() => false);
    console.log('Checkbox checked:', checkboxChecked);
    
    await this.page.screenshot({ path: `debug-form-state-${Date.now()}.png` }).catch(() => {});
  }
}