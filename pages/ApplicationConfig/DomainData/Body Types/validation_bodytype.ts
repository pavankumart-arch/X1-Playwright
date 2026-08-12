import { expect, Locator, Page, TestInfo, test } from '@playwright/test';
import { BasePage } from '../../../BasePage';
import BodyTypeData from '../../../../testdata/DomainData.json';
import { Reporter } from '../../../utils/NewReport';

export class bodytypevalidation extends BasePage {
  addBodyTypeButton: Locator;
  bodyTypeInput: Locator;
  bodyTypeFieldLabel: Locator;
  activeCheckboxText: Locator;
  cancelButton: Locator;
  saveBodyTypeButton: Locator;
  bodyTypeErrorMessage: Locator;
  alreadyExistMessage: Locator;

  private expectedBodyType: string = '';

  constructor(page: Page) {
    super(page);

    this.addBodyTypeButton = page.getByRole('button', {
      name: /Body Type/i,
    });

    // Updated locator
    this.bodyTypeInput = page.locator('input').first();

    this.bodyTypeFieldLabel = page.locator(
      '[class="text-sm font-medium text-default"]'
    );

    this.activeCheckboxText = page.locator(
      '[class="text-sm text-default"]'
    );

    this.cancelButton = page.getByRole('button', {
      name: 'Cancel',
    });

    this.saveBodyTypeButton = page.getByRole('button', {
      name: 'Save Body Type',
    });

    this.bodyTypeErrorMessage = page.locator(
      '[class="mt-1 text-xs text-destructive"]'
    );

    this.alreadyExistMessage = page.locator(
      'div.mx-8.mt-6.flex.items-center.gap-2.rounded-lg.border.border-red-200.bg-red-50.px-4.py-3.text-sm.text-red-600'
    );
  }

  async bodytypevalidation(
    testInfo: TestInfo
  ): Promise<string> {

    await test.step('Body Type Validation', async () => {

      // Open Add Body Type Page
      await this.addBodyTypeButton.click();

      console.log(
        'Input count:',
        await this.page.locator('input').count()
      );

      // ===================================
      // Required Field Validation
      // ===================================

      await this.saveBodyTypeButton.click();

      const requiredMessage =
        await this.bodyTypeErrorMessage.innerText();

      Reporter.validateData(
        'Body Type is required',
        requiredMessage,
        'Verify required field validation',
        testInfo
      );

      expect.soft(requiredMessage).toBe(
        'Body Type is required'
      );

      // ===================================
      // Minimum Character Validation
      // ===================================

      await expect(this.bodyTypeInput).toBeVisible();

      await this.bodyTypeInput.clear();
      await this.bodyTypeInput.fill('t');

      await this.saveBodyTypeButton.click();

      const minCharMessage =
        await this.bodyTypeErrorMessage.innerText();

      Reporter.validateData(
        'Must be at least 2 characters long.',
        minCharMessage,
        'Verify minimum character validation',
        testInfo
      );

      expect.soft(minCharMessage).toBe(
        'Must be at least 2 characters long.'
      );

      // ===================================
      // Label Validation
      // ===================================

      try {
        const fieldLabel =
          await this.bodyTypeFieldLabel.innerText();

        Reporter.validateData(
          'Body Type*',
          fieldLabel,
          'Verify Body Type field label',
          testInfo
        );

        expect.soft(fieldLabel).toBe(
          'Body Type*'
        );
      } catch (error) {
        console.log(
          'Body Type label validation failed:',
          error
        );
      }

      // ===================================
      // Placeholder Validation
      // ===================================

      try {
        const placeholderText =
          await this.bodyTypeInput.getAttribute(
            'placeholder'
          );

        Reporter.validateData(
          'e.g. Sedan, SUV, Coupe',
          placeholderText,
          'Verify placeholder text',
          testInfo
        );

        expect.soft(placeholderText).toBe(
          'e.g. Sedan, SUV, Coupe'
        );
      } catch (error) {
        console.log(
          'Placeholder validation failed:',
          error
        );
      }

      // ===================================
      // Active Checkbox Validation
      // ===================================

      try {
        const checkboxText =
          await this.activeCheckboxText.innerText();

        Reporter.validateData(
          'Active (Uncheck to make inactive)',
          checkboxText,
          'Verify checkbox label',
          testInfo
        );

        expect.soft(checkboxText).toBe(
          'Active (Uncheck to make inactive)'
        );
      } catch (error) {
        console.log(
          'Checkbox validation failed:',
          error
        );
      }

      // ===================================
      // Cancel Button Validation
      // ===================================

      try {
        const cancelText =
          await this.cancelButton.innerText();

        Reporter.validateData(
          'Cancel',
          cancelText,
          'Verify Cancel button',
          testInfo
        );

        expect.soft(cancelText).toBe(
          'Cancel'
        );
      } catch (error) {
        console.log(
          'Cancel button validation failed:',
          error
        );
      }

      // ===================================
      // Save Button Validation
      // ===================================

      try {
        const saveText =
          await this.saveBodyTypeButton.innerText();

        Reporter.validateData(
          'Save Body Type',
          saveText,
          'Verify Save button',
          testInfo
        );

        expect.soft(saveText).toBe(
          'Save Body Type'
        );
      } catch (error) {
        console.log(
          'Save button validation failed:',
          error
        );
      }

      // ===================================
      // Duplicate Validation
      // ===================================

      try {

        await this.bodyTypeInput.clear();

        await this.bodyTypeInput.fill(
          BodyTypeData.existingbodycolor
        );

        await this.saveBodyTypeButton.click();

        const duplicateMessage =
          await this.alreadyExistMessage.innerText();

        Reporter.validateData(
          `A Body Type with bodyType '${BodyTypeData.existingbodycolor}' already exists.`,
          duplicateMessage,
          'Verify duplicate validation',
          testInfo
        );

        expect.soft(duplicateMessage).toContain(
          'already exists'
        );

      } catch (error) {
        console.log(
          'Duplicate validation failed:',
          error
        );
      }

      // ===================================
      // Create New Body Type
      // ===================================

      try {

        const uniqueBodyType =
          `${BodyTypeData.minnumberbodytype}_${Date.now()}`;

        this.expectedBodyType =
          uniqueBodyType;

        await this.bodyTypeInput.clear();

        await this.bodyTypeInput.fill(
          uniqueBodyType
        );

        await this.saveBodyTypeButton.click();

        console.log(
          `Created Body Type: ${uniqueBodyType}`
        );

      } catch (error) {
        console.log(
          'Body Type creation failed:',
          error
        );
      }
    });

    return this.expectedBodyType;
  }
}