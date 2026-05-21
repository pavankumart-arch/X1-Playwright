import { expect, Locator, Page, TestInfo } from '@playwright/test';
import { logAndValidate } from '../../utils/reportUtil';
import { BasePage } from '../../BasePage';

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
  // Verify Labels And Button Text
  // =========================================================

  async verifyLabelsAndButtonText(testInfo: TestInfo) {

    try {

      const usernameText = await this.username.textContent();

      expect.soft(usernameText?.trim()).toBe('User Name*');

      logAndValidate(
        {
          step: 'Verify User Name label',
          expected: 'User Name*',
          actual: usernameText?.trim() || '',
        },
        testInfo
      );

    } catch (error) {

      console.log('Verify User Name Label Failed');
      console.log(error);

    }

    try {

      const passwordText = await this.password.textContent();

      expect.soft(passwordText?.trim()).toBe('Password*');

      logAndValidate(
        {
          step: 'Verify Password label',
          expected: 'Password*',
          actual: passwordText?.trim() || '',
        },
        testInfo
      );

    } catch (error) {

      console.log('Verify Password Label Failed');
      console.log(error);

    }

    try {

      const userTypeText = await this.userType.textContent();

      expect.soft(userTypeText?.trim()).toBe('User Type*');

      logAndValidate(
        {
          step: 'Verify User Type label',
          expected: 'User Type*',
          actual: userTypeText?.trim() || '',
        },
        testInfo
      );

    } catch (error) {

      console.log('Verify User Type Label Failed');
      console.log(error);

    }

    try {

      const resellerText = await this.reseller.textContent();

      expect.soft(resellerText?.trim()).toBe('Reseller*');

      logAndValidate(
        {
          step: 'Verify Reseller label',
          expected: 'Reseller*',
          actual: resellerText?.trim() || '',
        },
        testInfo
      );

    } catch (error) {

      console.log('Verify Reseller Label Failed');
      console.log(error);

    }

    try {

      const emailText = await this.email.textContent();

      expect.soft(emailText?.trim()).toBe('Email*');

      logAndValidate(
        {
          step: 'Verify Email label',
          expected: 'Email*',
          actual: emailText?.trim() || '',
        },
        testInfo
      );

    } catch (error) {

      console.log('Verify Email Label Failed');
      console.log(error);

    }

    try {

      const activeText = await this.active.textContent();

      expect.soft(activeText?.trim()).toBe('Active');

      logAndValidate(
        {
          step: 'Verify Active label',
          expected: 'Active',
          actual: activeText?.trim() || '',
        },
        testInfo
      );

    } catch (error) {

      console.log('Verify Active Label Failed');
      console.log(error);

    }

    try {

      const cancelButtonText = await this.cancelButton.textContent();

      expect.soft(cancelButtonText?.trim()).toBe('Cancel');

      logAndValidate(
        {
          step: 'Verify Cancel button text',
          expected: 'Cancel',
          actual: cancelButtonText?.trim() || '',
        },
        testInfo
      );

    } catch (error) {

      console.log('Verify Cancel Button Failed');
      console.log(error);

    }

    try {

      const saveUserButtonText = await this.saveUserButton.textContent();

      expect.soft(saveUserButtonText?.trim()).toBe('Save User');

      logAndValidate(
        {
          step: 'Verify Save User button text',
          expected: 'Save User',
          actual: saveUserButtonText?.trim() || '',
        },
        testInfo
      );

    } catch (error) {

      console.log('Verify Save User Button Failed');
      console.log(error);

    }

    try {

      logAndValidate(
        {
          step: 'Verify labels and button spellings',
          expected: 'All labels and buttons have correct spelling',
          actual: 'All labels and buttons have correct spelling',
        },
        testInfo
      );

    } catch (error) {

      console.log('Verify Labels And Buttons Summary Failed');
      console.log(error);

    }

  }

  // =========================================================
  // Verify Placeholder Text
  // =========================================================

  async verifyPlaceholderText(testInfo: TestInfo) {

    try {

      const usernamePlaceholderText = await this.usernamePlaceholder.getAttribute('placeholder');

      expect.soft(usernamePlaceholderText).toBe('User Name');

      logAndValidate(
        {
          step: 'Verify Username placeholder text',
          expected: 'User Name',
          actual: `${usernamePlaceholderText}`,
        },
        testInfo
      );

    } catch (error) {

      console.log('Verify Username Placeholder Failed');
      console.log(error);

    }

    try {

      const passwordPlaceholderText = await this.passwordPlaceholder.getAttribute('placeholder');

      expect.soft(passwordPlaceholderText).toBe('Password');

      logAndValidate(
        {
          step: 'Verify Password placeholder text',
          expected: 'Password',
          actual: `${passwordPlaceholderText}`,
        },
        testInfo
      );

    } catch (error) {

      console.log('Verify Password Placeholder Failed');
      console.log(error);

    }

    try {

      const userTypeText = await this.userTypePlaceholder.textContent();

      expect.soft(userTypeText?.trim()).toBe('Select an option');

      logAndValidate(
        {
          step: 'Verify User Type placeholder text',
          expected: 'Select an option',
          actual: `${userTypeText}`,
        },
        testInfo
      );

    } catch (error) {

      console.log('Verify User Type Placeholder Failed');
      console.log(error);

    }

    try {

      const resellerPlaceholderText = await this.resellerPlaceholder.textContent();

      expect.soft(resellerPlaceholderText).toBe('Select an option');

      logAndValidate(
        {
          step: 'Verify Reseller placeholder text',
          expected: 'Select an option',
          actual: `${resellerPlaceholderText}`,
        },
        testInfo
      );

    } catch (error) {

      console.log('Verify Reseller Placeholder Failed');
      console.log(error);

    }

    try {

      const emailPlaceholderText = await this.emailPlaceholder.getAttribute('placeholder');

      expect.soft(emailPlaceholderText).toBe('Email');

      logAndValidate(
        {
          step: 'Verify Email placeholder text',
          expected: 'Email',
          actual: `${emailPlaceholderText}`,
        },
        testInfo
      );

    } catch (error) {

      console.log('Verify Email Placeholder Failed');
      console.log(error);

    }

  }

  // =========================================================
  // Verify Required Field Validations
  // =========================================================

  async verifyRequiredFieldValidations(testInfo: TestInfo) {

    await this.clickOnElement(this.saveUserButton);
    await this.page.waitForTimeout(2000);

    try {

      const usernameError = await this.usernameErrorMessage.textContent();

      expect.soft(usernameError?.trim()).toBe('User Name is required');

      logAndValidate(
        {
          step: 'Verify Username required validation message',
          expected: 'User Name is required',
          actual: `${usernameError}`,
        },
        testInfo
      );

    } catch (error) {

      console.log('Username Required Validation Failed');
      console.log(error);

    }

    try {

      const passwordError = await this.passwordErrorMessage.textContent();

      expect.soft(passwordError?.trim()).toBe('Password is required');

      logAndValidate(
        {
          step: 'Verify Password required validation message',
          expected: 'Password is required',
          actual: `${passwordError}`,
        },
        testInfo
      );

    } catch (error) {

      console.log('Password Required Validation Failed');
      console.log(error);

    }

    try {

      const userTypeError = await this.userTypeErrorMessage.textContent();

      expect.soft(userTypeError?.trim()).toBe('User Type is required');

      logAndValidate(
        {
          step: 'Verify User Type required validation message',
          expected: 'User Type is required',
          actual: `${userTypeError}`,
        },
        testInfo
      );

    } catch (error) {

      console.log('User Type Required Validation Failed');
      console.log(error);

    }

    try {

      const resellerError = await this.resellerErrorMessage.textContent();

      expect.soft(resellerError?.trim()).toBe('Reseller is required');

      logAndValidate(
        {
          step: 'Verify Reseller required validation message',
          expected: 'Reseller is required',
          actual: `${resellerError}`,
        },
        testInfo
      );

    } catch (error) {

      console.log('Reseller Required Validation Failed');
      console.log(error);

    }

    try {

      const emailError = await this.emailErrorMessage.textContent();

      expect.soft(emailError?.trim()).toBe('Email is required');

      logAndValidate(
        {
          step: 'Verify Email required validation message',
          expected: 'Email is required',
          actual: `${emailError}`,
        },
        testInfo
      );

    } catch (error) {

      console.log('Email Required Validation Failed');
      console.log(error);

    }

    try {

      await expect.soft(this.checkbox).toBeChecked();

      logAndValidate(
        {
          step: 'Verify all required field validation messages',
          expected: 'All validation messages are correct.',
          actual: 'All validation messages are correct.',
        },
        testInfo
      );

    } catch (error) {

      console.log('Checkbox Validation Failed');
      console.log(error);

    }

  }

  // =========================================================
  // Verify Invalid Field Validations
  // =========================================================

  async verifyInvalidFieldValidations(testInfo: TestInfo) {

    try {

      await this.fillElement(this.username, 'ab');
      await this.fillElement(this.password, '123');
      await this.email.fill('TPK');

      await this.clickOnElement(this.saveUserButton);
      await this.page.waitForTimeout(2000);

    } catch (error) {

      console.log('Entering Invalid Data Failed');
      console.log(error);

    }

    try {

      const usernameError = await this.usernameCharCountMessage.textContent();

      expect.soft(usernameError?.trim()).toBe('Must be at least 3 characters long.');

      logAndValidate(
        {
          step: 'Verify Username invalid validation message',
          expected: 'Must be at least 3 characters long.',
          actual: `${usernameError}`,
        },
        testInfo
      );

    } catch (error) {

      console.log('Username Invalid Validation Failed');
      console.log(error);

    }

    try {

      const passwordError = await this.passwordCharCountMessage.textContent();

      expect.soft(passwordError?.trim()).toBe('Must be at least 6 characters long.');

      logAndValidate(
        {
          step: 'Verify Password invalid validation message',
          expected: 'Must be at least 6 characters long.',
          actual: `${passwordError}`,
        },
        testInfo
      );

    } catch (error) {

      console.log('Password Invalid Validation Failed');
      console.log(error);

    }

    try {

      const emailError = await this.emailValidationMessage.textContent();

      expect.soft(emailError?.trim()).toBe('Invalid email address');

      logAndValidate(
        {
          step: 'Verify Email invalid validation message',
          expected: 'Invalid email address',
          actual: `${emailError}`,
        },
        testInfo
      );

    } catch (error) {

      console.log('Email Invalid Validation Failed');
      console.log(error);

    }

  }

}