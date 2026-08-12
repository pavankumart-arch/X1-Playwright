import { expect, Locator, Page, TestInfo, test } from '@playwright/test';
import { BasePage } from '../../../BasePage';
import MakeData from '../../../../testdata/DomainData.json';
import { Reporter } from '../../../utils/NewReport';


export class modelvalidation extends BasePage {
  addModelButton: Locator;
  modelNameInput: Locator;
  modelplaceholder: Locator;
  modelnamefiledname: Locator;
  activeCheckbox: Locator;
  activecheckboxtext: Locator;
  cancelButton: Locator;
  saveModelButton: Locator;
  addModleHeading: Locator;
  searchInput: Locator;
  makeerrormessage: Locator;
  alreadyexistmessage: Locator;
  private expectedModelName: string = '';

  constructor(page: Page) {
  super(page);

  this.addModelButton = page.locator('[class="flex items-center gap-2"]');

  // Correct locator
  this.modelNameInput = page.locator('#admin-model-create-modelName');
  this.modelplaceholder = page.locator('#admin-model-create-model');

  this.modelnamefiledname = page.locator('[class="text-sm font-medium text-default"]');
  this.activeCheckbox = page.locator('svg.lucide-check');
  this.activecheckboxtext = page.locator('[class="text-sm text-default"]');
  this.cancelButton = page.getByRole('button', { name: 'Cancel' });
  this.saveModelButton = page.getByRole('button', { name: 'Save Model' });
  this.addModleHeading = page.getByRole('heading', { name: 'Add Model' });
  this.searchInput = page.getByPlaceholder('Search');
  this.makeerrormessage = page.locator('[class="mt-1 text-xs text-destructive"]');
  this.alreadyexistmessage = page.locator('div.mx-8.mt-6.flex.items-center.gap-2.rounded-lg.border.border-red-200.bg-red-50.px-4.py-3.text-sm.text-red-600');
}
async modelvalidation(testInfo: TestInfo): Promise<string> {
  await test.step('Add New Model', async () => {

    await this.addModelButton.click();

    // Required field validation
    await this.saveModelButton.click();

    const errormessage = await this.makeerrormessage.innerText();

    Reporter.validateData(
      'Model Name is required',
      errormessage,
      'Verify required field error message',
      testInfo
    );

    expect.soft(errormessage).toBe('Model Name is required');

    // ==========================
    // UI Validations
    // ==========================

    try {
      const modelNameFieldText =
        await this.modelnamefiledname.innerText();

      Reporter.validateData(
        'Model Name*',
        modelNameFieldText,
        'Verify Model Name field label',
        testInfo
      );

      expect.soft(modelNameFieldText).toBe('Model Name*');
    } catch (error) {
      console.log('Model Name label validation failed:', error);
    }

    try {
      const placeholderLocator =
        this.page.locator('input[placeholder]').first();

      await expect.soft(placeholderLocator).toBeVisible();

      const placeholderText =
        await placeholderLocator.getAttribute('placeholder');

      Reporter.validateData(
        'e.g. Toyota',
        placeholderText,
        'Verify placeholder text',
        testInfo
      );

      expect.soft(placeholderText).toBe('e.g. Corolla, Civic, Model Y');
    } catch (error) {
      console.log('Placeholder validation failed:', error);
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

      expect.soft(activeCheckboxText)
        .toBe('Active (Uncheck to make inactive)');
    } catch (error) {
      console.log('Checkbox validation failed:', error);
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

      expect.soft(cancelButtonText).toBe('Cancel');
    } catch (error) {
      console.log('Cancel button validation failed:', error);
    }

    try {
      const saveModelButtonText =
        await this.saveModelButton.innerText();

      Reporter.validateData(
        'Save Model',
        saveModelButtonText,
        'Verify Save Model button text',
        testInfo
      );

      expect.soft(saveModelButtonText).toBe('Save Model');
    } catch (error) {
      console.log('Save button validation failed:', error);
    }

    // ==========================
    // Duplicate Validation
    // ==========================

    try {
      const modelInput =
        this.page.locator('input').first();

      await modelInput.fill(MakeData.ExistModelname);

      await this.saveModelButton.click();

      const existmessage =
        await this.alreadyexistmessage.innerText();

      Reporter.validateData(
        `A Model with modelname '${MakeData.ExistModelname}' already exists.`,
        existmessage,
        'Verify duplicate model error message',
        testInfo
      );

      expect.soft(existmessage)
        .toBe(
          `A Model with modelname '${MakeData.ExistModelname}' already exists.`
        );
    } catch (error) {
      console.log('Duplicate validation failed:', error);
    }

    // ==========================
    // Create New Model
    // ==========================

    try {
      const uniqueModelName =
        `${MakeData.Make}_${Date.now()}`;

      this.expectedModelName = uniqueModelName;

      const modelInput =
        this.page.locator('input').first();

      await modelInput.fill(uniqueModelName);

      await this.saveModelButton.click();

      console.log(`Created Model: ${uniqueModelName}`);
    } catch (error) {
      console.log('Model creation failed:', error);
    }
  });

  return this.expectedModelName;
}
}