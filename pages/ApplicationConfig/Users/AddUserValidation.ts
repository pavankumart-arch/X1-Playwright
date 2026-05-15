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

    //error messages
    usernameErrorMessage: Locator;
    passwordErrorMessage: Locator;
    userTypeErrorMessage: Locator;
    resellerErrorMessage: Locator;
    emailErrorMessage: Locator;
    checkbox:Locator;

    //

    constructor(page: Page) {
      super(page);

      // Buttons
      this.saveUserButton = page.getByRole('button', { name: 'Save User' });
      this.cancelButton = page.getByRole('button', { name: 'Cancel' });
      this.addUserButton = page.locator('[class="lucide lucide-plus"]')

      // Labels;
      this.username = page.locator('[for="admin-User-create-username"]');
      this.password = page.locator('[for="admin-User-create-password"]');
      this.userType = page.locator('[for="admin-User-create-userTypeId"]');
      this.reseller = page.locator('[for="admin-User-create-resellerId"]');
      this.email = page.locator('[for="admin-User-create-email"]');
      this.active = page.locator('label:has-text("Active")');

      // Placeholders
      this.usernamePlaceholder = page.locator('input[placeholder="User Name"]');
      this.passwordPlaceholder = page.locator('input[placeholder="Password"]');
      this.userTypePlaceholder = page.locator('[id="react-aria-_R_575ej5H7_"]');
      this.resellerPlaceholder = page.locator('[id="admin-User-create-resellerId"]');
      this.emailPlaceholder = page.locator('input[placeholder="Email"]');

      // Error Messages
      this.usernameErrorMessage = page.locator('[id="react-aria-_R_135ej5H4_"]');
      this.passwordErrorMessage = page.locator('[id="react-aria-_R_155ej5H4_"]');
      this.userTypeErrorMessage = page.locator('[id="react-aria-_R_575ej5H6_"]');
      this.resellerErrorMessage = page.locator('[id="react-aria-_R_595ej5H6_"]');
      this.emailErrorMessage = page.locator('[id="react-aria-_R_1b5ej5H4_"]');
      this.checkbox = page.locator('svg.lucide-check');
    }

    // click on AddUserbutton
    async clickOnAddUserButton() {
      await this.addUserButton.click();
      await this.page.waitForTimeout(2000);
    }

    // =========================================================
    // Verify Labels & Button Text
    // =========================================================
    async verifyspellcheckfortheinputfields(testInfo: TestInfo) {
      const usernameText=await this.username.textContent();

      expect.soft(usernameText?.trim()).toBe('User Name*');

      logAndValidate(
    {
      step: 'Verify User Name label',
      expected: 'User Name*',
      actual: usernameText?.trim() || '',
    },
    testInfo
  );
      const passwordText=await this.password.textContent();
      expect.soft(passwordText?.trim()).toBe('Password*');
        logAndValidate(
    {
      step: 'Verify passwordText label',
      expected: 'Password*',
      actual: passwordText?.trim() || '',
    },
    testInfo
  );
      const userTypeText=await this.userType.textContent();
      expect.soft(userTypeText?.trim()).toBe('User Type*');
      logAndValidate(
    {
      step: 'Verify User Type label',
      expected: 'User Type*',
      actual: userTypeText?.trim() || '',
    },
    testInfo
  );
      const resellerText=await this.reseller.textContent();
      expect.soft(resellerText?.trim()).toBe('Reseller*');
      logAndValidate(
    {
      step: 'Verify Reseller label',
      expected: 'Reseller*',
      actual: resellerText?.trim() || '',
    },
    testInfo
  );
      const emailText=await this.email.textContent();
      expect.soft(emailText?.trim()).toBe('Email*');
       logAndValidate(
     {
      step: 'Verify Email label',
      expected: 'Email*',
      actual: emailText?.trim() || '',
    },
    testInfo
  );
  
      const activeText=await this.active.textContent();
      expect.soft(activeText?.trim()).toBe('Active');
      logAndValidate(
     {
      step: 'Verify Active label',
      expected: 'Active',
      actual: activeText?.trim() || '',
    },
    testInfo
  );
const cancelButtonText=await this.cancelButton.textContent();
      expect.soft(cancelButtonText?.trim()).toBe('Cancel');
logAndValidate(
     {
      step: 'Verify Cancel button text',
      expected: 'Cancel',
      actual: cancelButtonText?.trim() || '',
    },
    testInfo
  );

      const saveUserButtonText=await this.saveUserButton.textContent();
     expect.soft(saveUserButtonText?.trim()).toBe('Save User');
logAndValidate(
     {
      step: 'Verify Save button text',
      expected: 'Save User',
      actual: saveUserButtonText?.trim() || '',
    },
    testInfo
  );
      logAndValidate(
  {
    step: 'Verify labels and button spellings',
    expected: 'All labels and buttons have correct spelling',
    actual: 'All labels and buttons have correct spelling',
  },
  testInfo
);
    }

    // =========================================================
    // Verify Placeholder Text
    // =========================================================
    async verifyplaceholdertextfortheinputfields(testInfo: TestInfo) {

      // Username Placeholder
      const usernamePlaceholderText =
        await this.usernamePlaceholder.getAttribute('placeholder');

      expect.soft(usernamePlaceholderText).toBe('User Name');

      logAndValidate(
        {
          step: 'Verify Username placeholder text',
          expected: 'Username placeholder text is correct.',
          actual: `Actual placeholder: ${usernamePlaceholderText}`,
        },
        testInfo
      );

      // Password Placeholder
      const passwordPlaceholderText =
        await this.passwordPlaceholder.getAttribute('placeholder');

      expect.soft(passwordPlaceholderText).toBe('Password');

      logAndValidate(
        {
          step: 'Verify Password placeholder text',
          expected: 'Password placeholder text is correct.',
          actual: `Actual placeholder: ${passwordPlaceholderText}`,
        },
        testInfo
      );

      // User Type Placeholder
      const userTypeText =
        await this.userTypePlaceholder.textContent();

      expect.soft(userTypeText?.trim()).toBe('Select User Type');

      logAndValidate(
        {
          step: 'Verify User Type placeholder text',
          expected: 'User Type placeholder text is correct.',
          actual: `Actual text: ${userTypeText}`,
        },
        testInfo
      );

      // Reseller Placeholder
      const resellerPlaceholderText =
        await this.resellerPlaceholder.getAttribute('placeholder');

      expect.soft(resellerPlaceholderText).toBe('Select Reseller');

      logAndValidate(
        {
          step: 'Verify Reseller placeholder text',
          expected: 'Reseller placeholder text is correct.',
          actual: `Actual placeholder: ${resellerPlaceholderText}`,
        },
        testInfo
      );

      // Email Placeholder
      const emailPlaceholderText =
        await this.emailPlaceholder.getAttribute('placeholder');

      expect.soft(emailPlaceholderText).toBe('Email');

      logAndValidate(
        {
          step: 'Verify Email placeholder text',
          expected: 'Email placeholder text is correct.',
          actual: `Actual placeholder: ${emailPlaceholderText}`,
        },
        testInfo
      );
    }
    //Verify the form requied messages and validation messages for the input fields
    async verifythevalidationmessagesfortheinputfields(testInfo: TestInfo) {
      await this.clickOnElement(this.cancelButton);
      await this.page.waitForTimeout(2000);

      const usernameError = await this.usernameErrorMessage.textContent();
      const passwordError = await this.passwordErrorMessage.textContent();
      const userTypeError = await this.userTypeErrorMessage.textContent();
      const resellerError = await this.resellerErrorMessage.textContent();
      const emailError = await this.emailErrorMessage.textContent();

      expect.soft(usernameError?.trim()).toBe('User Name is required');
      logAndValidate(
        {
          step: 'Verify Username error message for required validation',
          expected: 'User Name is required',
          actual: `Actual message: Username: ${usernameError}`,
        },
        testInfo
      );
      expect.soft(passwordError?.trim()).toBe('Password is required');
      logAndValidate(
        {
          step: 'Verify Password error message for required validation',
          expected: 'Password is required',
          actual: `Actual message: Password: ${passwordError}`,
        },
        testInfo
      );
      expect.soft(userTypeError?.trim()).toBe('User Type is required');
      logAndValidate(
        {
          step: 'Verify User Type error message for required validation',
          expected: 'User Type is required',
          actual: `Actual message: User Type: ${userTypeError}`,
        },
        testInfo
      );
      expect.soft(resellerError?.trim()).toBe('Reseller is required');
      logAndValidate(
        {
          step: 'Verify Reseller error message for required validation',
          expected: 'Reseller is required',
          actual: `Actual message: Reseller: ${resellerError}`,
        },
        testInfo
      );
      expect.soft(emailError?.trim()).toBe('Email is required');
      logAndValidate(
        {
          step: 'Verify Email error message for required validation',
          expected: 'Email is required',
          actual: `Actual message: Email: ${emailError}`,
        },
        testInfo
      );
      await expect.soft(this.checkbox).toBeChecked();
      logAndValidate(
        {
          step: 'Verify validation messages for input fields',
          expected: 'All validation messages are correct.',
          actual: `Actual messages: Username: ${usernameError}, Password: ${passwordError}, User Type: ${userTypeError}, Reseller: ${resellerError}, Email: ${emailError}`,
        },
        testInfo
      );
  }
  async verifythevalidationmessagesfortheinputfieldswithinvaliddata(testInfo: TestInfo) {
    await this.fillElement(this.username, 'ab');
    await this.fillElement(this.password, '123');
    await this.email.fill('TPK');
    await this.clickOnElement(this.saveUserButton);
    await this.page.waitForTimeout(2000);
    const usernameError = await this.usernameErrorMessage.textContent();
    const passwordError = await this.passwordErrorMessage.textContent();
    const emailError = await this.emailErrorMessage.textContent();
  expect.soft(usernameError?.trim()).toBe('User Name must be at least 3 characters.');
  logAndValidate(
        {
          step: 'Verify Username error message',
          expected: 'User Name must be at least 3 characters.',
          actual: `Actual message: Username: ${usernameError}`,
        },
        testInfo
      );
 
  expect.soft(passwordError?.trim()).toBe('Must be at least 6 characters long.');
  logAndValidate(
        {
          step: 'Verify Password error message',
          expected: 'Must be at least 6 characters long.',
          actual: `Actual message: Password: ${passwordError}`,
        },
        testInfo
      );
  expect.soft(emailError?.trim()).toBe('Invalid email address');
  
  logAndValidate(
    {
      step: 'Verify validation Email error messsage',
      expected: 'Invalid email address',
       actual: `Actual message: emailError: ${emailError}`,
    },
    testInfo
  );
    }
    async verifyAllUserValidations(testInfo: TestInfo) {
  await this.clickOnAddUserButton();
  await this.verifyspellcheckfortheinputfields(testInfo);
  await this.verifyplaceholdertextfortheinputfields(testInfo);
  await this.verifythevalidationmessagesfortheinputfields(testInfo);
  await this.verifythevalidationmessagesfortheinputfieldswithinvaliddata(testInfo);
}
  }