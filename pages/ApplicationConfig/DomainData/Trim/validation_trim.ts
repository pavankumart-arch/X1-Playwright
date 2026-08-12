import { expect, Locator, Page, TestInfo, test } from '@playwright/test';
import { BasePage } from '../../../BasePage';
import TrimData from '../../../../testdata/DomainData.json';
import { Reporter } from '../../../utils/NewReport';

export class trimvalidation extends BasePage {
  addTrimButton: Locator;
  trimNameInput: Locator;
  trimplaceholder: Locator;
  trimnamefieldname: Locator;
  activeCheckbox: Locator;
  activecheckboxtext: Locator;
  cancelButton: Locator;
  saveTrimButton: Locator;
  addTrimHeading: Locator;
  searchInput: Locator;
  trimerrormessage: Locator;
  alreadyexistmessage: Locator;

  private expectedTrimName: string = '';

  constructor(page: Page) {
    super(page);

     this.addTrimButton = page.locator('button').filter({ hasText: 'Trim' });

    // Update locator if different
    this.trimNameInput = page.locator('#admin-trim-create-trimName');
    this.trimplaceholder = page.locator('#admin-trim-create-trim');

    this.trimnamefieldname = page.locator(
      '[class="text-sm font-medium text-default"]'
    );

    this.activeCheckbox = page.locator('svg.lucide-check');
    this.activecheckboxtext = page.locator(
      '[class="text-sm text-default"]'
    );

    this.cancelButton = page.getByRole('button', {
      name: 'Cancel',
    });

    this.saveTrimButton = page.getByRole('button', {
      name: 'Save Trim',
    });

    this.addTrimHeading = page.getByRole('heading', {
      name: 'Add Trim',
    });

    this.searchInput = page.getByPlaceholder('Search');

    this.trimerrormessage = page.locator(
      '[class="mt-1 text-xs text-destructive"]'
    );

    this.alreadyexistmessage = page.locator(
      'div.mx-8.mt-6.flex.items-center.gap-2.rounded-lg.border.border-red-200.bg-red-50.px-4.py-3.text-sm.text-red-600'
    );
  }

  async trimvalidation(testInfo: TestInfo): Promise<string> {
    await test.step('Add New Trim', async () => {

      await this.addTrimButton.click();

      // ==========================
      // Required Field Validation
      // ==========================

      await this.saveTrimButton.click();

      const errormessage =
        await this.trimerrormessage.innerText();

      Reporter.validateData(
        'Trim Name is required',
        errormessage,
        'Verify required field error message',
        testInfo
      );

      expect.soft(errormessage).toBe(
        'Trim Name is required'
      );

      // ==========================
      // UI Validations
      // ==========================

      try {
        const trimNameFieldText =
          await this.trimnamefieldname.innerText();

        Reporter.validateData(
          'Trim Name*',
          trimNameFieldText,
          'Verify Trim Name field label',
          testInfo
        );

        expect.soft(trimNameFieldText).toBe(
          'Trim Name*'
        );
      } catch (error) {
        console.log(
          'Trim Name label validation failed:',
          error
        );
      }

      try {
        const placeholderLocator =
          this.page.locator('input[placeholder]').first();

        await expect.soft(
          placeholderLocator
        ).toBeVisible();

        const placeholderText =
          await placeholderLocator.getAttribute(
            'placeholder'
          );

        Reporter.validateData(
          'e.g. LE, SE Nightshade, Performance',
          placeholderText,
          'Verify placeholder text',
          testInfo
        );

        expect.soft(placeholderText).toBe(
          'e.g. LE, SE Nightshade, Performance, SE Nightshade, Performance'
        );
      } catch (error) {
        console.log(
          'Placeholder validation failed:',
          error
        );
      }

      try {
        const activeCheckboxText =
          await this.activecheckboxtext.innerText();

        Reporter.validateData(
          'Active (Uncheck to make inactive)',
          activeCheckboxText,
          'Verify active checkbox label',
          testInfo
        );

        expect.soft(activeCheckboxText).toBe(
          'Active (Uncheck to make inactive)'
        );
      } catch (error) {
        console.log(
          'Checkbox validation failed:',
          error
        );
      }

      try {
        const cancelButtonText =
          await this.cancelButton.innerText();

        Reporter.validateData(
          'Cancel',
          cancelButtonText,
          'Verify Cancel button text',
          testInfo
        );

        expect.soft(cancelButtonText).toBe(
          'Cancel'
        );
      } catch (error) {
        console.log(
          'Cancel button validation failed:',
          error
        );
      }

      try {
        const saveTrimButtonText =
          await this.saveTrimButton.innerText();

        Reporter.validateData(
          'Save Trim',
          saveTrimButtonText,
          'Verify Save Trim button text',
          testInfo
        );

        expect.soft(saveTrimButtonText).toBe(
          'Save Trim'
        );
      } catch (error) {
        console.log(
          'Save button validation failed:',
          error
        );
      }

      // ==========================
      // Duplicate Validation
      // ==========================

      try {
        const trimInput =
          this.page.locator('input').first();

        await trimInput.fill(
          TrimData.ExistTrimname
        );

        await this.saveTrimButton.click();

        const existmessage =
          await this.alreadyexistmessage.innerText();

        Reporter.validateData(
          `A Trim with trimname '${TrimData.ExistTrimname}' already exists.`,
          existmessage,
          'Verify duplicate trim error message',
          testInfo
        );

        expect.soft(existmessage).toBe(
          `A Trim with trimname '${TrimData.ExistTrimname}' already exists.`
        );
      } catch (error) {
        console.log(
          'Duplicate validation failed:',
          error
        );
      }

      // ==========================
      // Create New Trim
      // ==========================

      try {
        const uniqueTrimName =
          `${TrimData.Trimname}_${Date.now()}`;

        this.expectedTrimName =
          uniqueTrimName;

        const trimInput =
          this.page.locator('input').first();

        await trimInput.fill(
          uniqueTrimName
        );

        await this.saveTrimButton.click();

        console.log(
          `Created Trim: ${uniqueTrimName}`
        );
      } catch (error) {
        console.log(
          'Trim creation failed:',
          error
        );
      }
    });

    return this.expectedTrimName;
  }
}