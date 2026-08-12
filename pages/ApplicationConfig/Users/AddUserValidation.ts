import { expect, Locator, Page, TestInfo } from '@playwright/test';
import { BasePage } from '../../BasePage';
import { Reporter } from '../../utils/NewReport';


export class UserValidation extends BasePage {

  // Buttons
  addUserButton: Locator;
  saveUserButton: Locator;
  cancelButton: Locator;

  // Labels
  username: Locator;
  password: Locator;
  userType: Locator;
  reseller: Locator;
  email: Locator;
  active: Locator;

  // Placeholders
  usernamePlaceholder: Locator;
  passwordPlaceholder: Locator;
  userTypePlaceholder: Locator;
  resellerPlaceholder: Locator;
  emailPlaceholder: Locator;

  // Error Messages
  usernameErrorMessage: Locator;
  passwordErrorMessage: Locator;
  userTypeErrorMessage: Locator;
  resellerErrorMessage: Locator;
  emailErrorMessage: Locator;
  checkbox: Locator;

  // Character Count Messages
  usernameCharCountMessage: Locator;
  passwordCharCountMessage: Locator;
  emailValidationMessage: Locator;

  constructor(page: Page) {
    super(page);

    // Buttons
    this.saveUserButton = page.getByRole('button', { name: 'Save User' });
    this.cancelButton = page.getByRole('button', { name: 'Cancel' });
    this.addUserButton = page.locator('[class="lucide lucide-plus"]');

    // Labels
    this.username = page.locator('[for="admin-user-create-username"]');
    this.password = page.locator('[for="admin-user-create-password"]');
    this.userType = page.locator('[for="admin-user-create-userTypeId"]');
    this.reseller = page.locator('[for="admin-user-create-resellerId"]');
    this.email = page.locator('[for="admin-user-create-email"]');
    this.active = page.locator('label:has-text("Active")');

    // Placeholders
    this.usernamePlaceholder = page.locator('input[placeholder="User Name"]');
    this.passwordPlaceholder = page.locator('input[placeholder="Password"]');
    this.userTypePlaceholder = page.locator('[id="admin-user-create-userTypeId"]');
    this.resellerPlaceholder = page.locator('[id="admin-user-create-resellerId"]');
    this.emailPlaceholder = page.locator('input[placeholder="Email"]');

    // Error Messages
    this.usernameErrorMessage = page.getByText('User Name is required');
    this.passwordErrorMessage = page.getByText('Password is required');
    this.userTypeErrorMessage = page.getByText('User Type is required');
    this.resellerErrorMessage = page.getByText('Reseller is required');
    this.emailErrorMessage = page.getByText('Email is required');
    this.checkbox = page.locator('svg.lucide-check');

    // Character Count Messages
    this.usernameCharCountMessage = page.getByText('Must be at least 3 characters long.');
    this.passwordCharCountMessage = page.getByText('Must be at least 6 characters long.');
    this.emailValidationMessage = page.getByText('Invalid email address');
  }

  // =========================================================
  // Click On Add User Button
  // =========================================================

  async clickOnAddUserButton() {
    await this.addUserButton.click();
    await this.page.waitForTimeout(2000);
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
  // Verify Labels And Button Text
  // =========================================================

  async verifyLabelsAndButtonText(testInfo: TestInfo) {
    // Validate User Name label
    const usernameText = await this.username.textContent();
    await this.validateText(usernameText, 'User Name*', 'User Name label', testInfo);

    // Validate Password label
    const passwordText = await this.password.textContent();
    await this.validateText(passwordText, 'Password*', 'Password label', testInfo);

    // Validate User Type label
    const userTypeText = await this.userType.textContent();
    await this.validateText(userTypeText, 'User Type*', 'User Type label', testInfo);

    // Validate Reseller label
    const resellerText = await this.reseller.textContent();
    await this.validateText(resellerText, 'Reseller*', 'Reseller label', testInfo);

    // Validate Email label
    const emailText = await this.email.textContent();
    await this.validateText(emailText, 'Email*', 'Email label', testInfo);

    // Validate Active label
    const activeText = await this.active.textContent();
    await this.validateText(activeText, 'Active', 'Active label', testInfo);

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
    Reporter.validateData('User Name', usernamePlaceholderText, 'Username placeholder', testInfo);

    // Validate Password placeholder
    const passwordPlaceholderText = await this.passwordPlaceholder.getAttribute('placeholder');
    Reporter.validateData('Password', passwordPlaceholderText, 'Password placeholder', testInfo);

    // Validate User Type placeholder
    const userTypeText = await this.userTypePlaceholder.textContent();
    Reporter.validateData('Select an option', userTypeText?.trim(), 'User Type placeholder', testInfo);

    // Validate Reseller placeholder
    const resellerPlaceholderText = await this.resellerPlaceholder.textContent();
    Reporter.validateData('Select an option', resellerPlaceholderText?.trim(), 'Reseller placeholder', testInfo);

    // Validate Email placeholder
    const emailPlaceholderText = await this.emailPlaceholder.getAttribute('placeholder');
    Reporter.validateData('Email', emailPlaceholderText, 'Email placeholder', testInfo);
  }

  // =========================================================
  // Verify Required Field Validations
  // =========================================================

  async verifyRequiredFieldValidations(testInfo: TestInfo) {
    await this.clickOnElement(this.saveUserButton);
    await this.page.waitForTimeout(2000);

    // Validate Username required message
    const usernameError = await this.usernameErrorMessage.textContent();
    Reporter.validateData('User Name is required', usernameError?.trim(), 'Username required validation', testInfo);

    // Validate Password required message
    const passwordError = await this.passwordErrorMessage.textContent();
    Reporter.validateData('Password is required', passwordError?.trim(), 'Password required validation', testInfo);

    // Validate User Type required message
    const userTypeError = await this.userTypeErrorMessage.textContent();
    Reporter.validateData('User Type is required', userTypeError?.trim(), 'User Type required validation', testInfo);

    // Validate Reseller required message
    const resellerError = await this.resellerErrorMessage.textContent();
    Reporter.validateData('Reseller is required', resellerError?.trim(), 'Reseller required validation', testInfo);

    // Validate Email required message
    const emailError = await this.emailErrorMessage.textContent();
    Reporter.validateData('Email is required', emailError?.trim(), 'Email required validation', testInfo);

    // Validate checkbox is checked by default
    const isChecked = await this.checkbox.isChecked();
    Reporter.validateData(true, isChecked, 'Active checkbox default state', testInfo);
  }

  // =========================================================
  // Verify Invalid Field Validations
  // =========================================================

  async verifyInvalidFieldValidations(testInfo: TestInfo) {
    // Enter invalid data - Fixed: Use placeholder locators instead of label locators
    await this.usernamePlaceholder.fill('ab');
    await this.passwordPlaceholder.fill('123');
    await this.emailPlaceholder.fill('TPK');

    await this.clickOnElement(this.saveUserButton);
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
  // Complete User Form Validation (Bonus)
  // =========================================================

  async verifyCompleteFormValidation(testInfo: TestInfo) {
    // Start test reporting
    Reporter.startTest();

    try {
      await this.clickOnAddUserButton();
      await this.verifyLabelsAndButtonText(testInfo);
      await this.verifyPlaceholderText(testInfo);
      await this.verifyRequiredFieldValidations(testInfo);
      await this.verifyInvalidFieldValidations(testInfo);
    } finally {
      // End test and generate summary
      Reporter.endTest(testInfo);
    }
  }
}