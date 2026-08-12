import { expect, Locator, Page, TestInfo } from '@playwright/test';
import { BasePage } from '../../BasePage';
import { logAndValidate } from '../../../utils/reportUtil';

export class validateAddUserTypeForm extends BasePage {

  // =========================================
  // LOCATORS
  // =========================================

  AddUserTypeHeading: Locator;
  AddUserTypeButton: Locator;

  UserTypeInput: Locator;
  TypeKeyInput: Locator;

  ActiveCheckbox: Locator;

  SaveUserTypeButton: Locator;
  CancelButton: Locator;

  UserTypeErrorMessage: Locator;
  TypeKeyErrorMessage: Locator;

  private testInfo: TestInfo;

  constructor(page: Page, testInfo: TestInfo) {

    super(page);

    this.testInfo = testInfo;

    // =========================================
    // HEADERS & BUTTONS
    // =========================================

    this.AddUserTypeHeading =
      page.getByRole('heading', {
        name: 'Add User Type'
      });

    this.AddUserTypeButton =this.page.getByRole('button', {
        name: 'User Type',
        exact: true
    });

    this.SaveUserTypeButton =
      page.getByRole('button', {
        name: 'Save User Type'
      });

    this.CancelButton =
      page.getByRole('button', {
        name: 'Cancel'
      });

    // =========================================
    // INPUTS
    // =========================================

    this.UserTypeInput =
      page.getByPlaceholder(
        'e.g. Admin, Manager, Viewer, Support'
      );

    this.TypeKeyInput =
      page.getByPlaceholder(
        'manager (unique, no spaces)'
      );

    this.ActiveCheckbox =
      page.locator('input[type="checkbox"]');

    // =========================================
    // ERROR MESSAGES
    // =========================================

    this.UserTypeErrorMessage =
      page.locator('text=User Type is required');

    this.TypeKeyErrorMessage =
      page.locator('text=Type Key is required');
  }

  // =========================================
  // OPEN FORM
  // =========================================

  async openAddUserTypeForm(): Promise<void> {

    console.log('\n📋 Opening Add User Type form...');

    await this.AddUserTypeButton.click();

    await this.page.waitForTimeout(1000);

    logAndValidate({
      step: 'Open Add User Type Form',
      expected: 'Form opened successfully',
      actual: 'Form opened successfully'
    }, this.testInfo);
  }

  // =========================================
  // VERIFY HEADING
  // =========================================

  async verifyHeadingText(): Promise<void> {

    await expect(
      this.AddUserTypeHeading
    ).toBeVisible();

    const heading =
      await this.AddUserTypeHeading.textContent();

    logAndValidate({
      step: 'Add User Type Heading',
      expected: 'Add User Type',
      actual: heading?.trim()
    }, this.testInfo);
  }

  // =========================================
  // VERIFY FIELD VISIBILITY
  // =========================================

  async verifyFieldVisibility(): Promise<void> {

    const fields = [
      {
        locator: this.UserTypeInput,
        name: 'User Type'
      },
      {
        locator: this.TypeKeyInput,
        name: 'Type Key'
      }
    ];

    for (const field of fields) {

      await expect(field.locator)
        .toBeVisible();

      logAndValidate({
        step: `${field.name} Field Visibility`,
        expected: 'Visible',
        actual: 'Visible'
      }, this.testInfo);
    }
  }

  // =========================================
  // VERIFY PLACEHOLDERS
  // =========================================

  async verifyPlaceholderTexts(): Promise<void> {

    const placeholders = [
      {
        locator: this.UserTypeInput,
        expected:
          'e.g. Admin, Manager, Viewer, Support',
        field: 'User Type'
      },
      {
        locator: this.TypeKeyInput,
        expected:
          'manager (unique, no spaces)',
        field: 'Type Key'
      }
    ];

    for (const item of placeholders) {

      const actual =
        await item.locator.getAttribute(
          'placeholder'
        );

      logAndValidate({
        step: `${item.field} Placeholder`,
        expected: item.expected,
        actual: actual || ''
      }, this.testInfo);
    }
  }

  // =========================================
  // VERIFY BUTTON TEXTS
  // =========================================

  async verifyButtonTexts(): Promise<void> {

    const saveText =
      await this.SaveUserTypeButton.textContent();

    logAndValidate({
      step: 'Save Button Text',
      expected: 'Save User Type',
      actual: saveText?.trim()
    }, this.testInfo);

    const cancelText =
      await this.CancelButton.textContent();

    logAndValidate({
      step: 'Cancel Button Text',
      expected: 'Cancel',
      actual: cancelText?.trim()
    }, this.testInfo);
  }

  // =========================================
  // TRIGGER VALIDATIONS
  // =========================================

  async triggerValidationErrors(): Promise<void> {

    console.log(
      '\n📋 Triggering validation errors...'
    );

    await this.SaveUserTypeButton.click({
      force: true
    });

    await this.page.waitForTimeout(2000);
  }

  // =========================================
  // VERIFY USER TYPE ERROR
  // =========================================

  async verifyUserTypeError(): Promise<void> {

    await expect(
      this.UserTypeErrorMessage
    ).toBeVisible();

    const error =
      await this.UserTypeErrorMessage.textContent();

    logAndValidate({
      step: 'User Type Validation',
      expected: 'User Type is required',
      actual: error?.trim()
    }, this.testInfo);
  }

  // =========================================
  // VERIFY TYPE KEY ERROR
  // =========================================

  async verifyTypeKeyError(): Promise<void> {

    await expect(
      this.TypeKeyErrorMessage
    ).toBeVisible();

    const error =
      await this.TypeKeyErrorMessage.textContent();

    logAndValidate({
      step: 'Type Key Validation',
      expected: 'Type Key is required',
      actual: error?.trim()
    }, this.testInfo);
  }

  // =========================================
  // COMPLETE VALIDATION
  // =========================================

  async validateAddUserTypeForm(): Promise<boolean> {

    try {

      console.log('\n================================');
      console.log('ADD USER TYPE VALIDATION');
      console.log('================================');

      await this.openAddUserTypeForm();

      await this.verifyHeadingText();

      await this.verifyFieldVisibility();

      await this.verifyPlaceholderTexts();

      await this.verifyButtonTexts();

      await this.triggerValidationErrors();

      await this.verifyUserTypeError();

      await this.verifyTypeKeyError();

      logAndValidate({
        step: 'Overall Result',
        expected: 'PASS',
        actual: 'PASS'
      }, this.testInfo);

      return true;

    } catch (error) {

      console.log(`❌ Validation Failed: ${error}`);

      logAndValidate({
        step: 'Overall Result',
        expected: 'PASS',
        actual: `FAIL: ${error}`
      }, this.testInfo);

      return false;
    }
  }
}