import { expect, Locator, Page, TestInfo, test } from '@playwright/test';
import { BasePage } from '../../../BasePage';
import MakeData from '../../../../testdata/DomainData.json';
import { Reporter } from '../../../utils/NewReport';

export class makevalidation extends BasePage {

  addMakeButton: Locator;
  makeNameInput: Locator;
  makeplaceholder: Locator;
  makenamefiledname: Locator;
  activeCheckbox: Locator;
  activecheckboxtext: Locator;
  cancelButton: Locator;
  saveMakeButton: Locator;
  addMakeHeading: Locator;
  searchInput: Locator;
  makeerrormessage: Locator;
  alreadyexistmessage: Locator;

  private expectedMakeName: string = '';

  constructor(page: Page) {
    super(page);

    this.addMakeButton = page.locator('[class="flex items-center gap-2"]');
    this.makeplaceholder = page.locator('input[placeholder="e.g. Toyota"]');
    this.makeNameInput = page.locator('#admin-make-create-makeName');
    this.makenamefiledname = page.locator('[class="text-sm font-medium text-default"]');
    this.activeCheckbox = page.locator('svg.lucide-check');
    this.activecheckboxtext = page.locator('[class="text-sm text-default"]');
    this.cancelButton = page.getByRole('button', { name: 'Cancel' });
    this.saveMakeButton = page.getByRole('button', { name: 'Save Make' });
    this.addMakeHeading = page.getByRole('heading', { name: 'Add Make' });
    this.searchInput = page.getByPlaceholder('Search');
    this.makeerrormessage = page.locator('[class="mt-1 text-xs text-destructive"]');
    this.alreadyexistmessage = page.locator('div.mx-8.mt-6.flex.items-center.gap-2.rounded-lg.border.border-red-200.bg-red-50.px-4.py-3.text-sm.text-red-600');
  }

  async makevalidation(testInfo: TestInfo): Promise<string> {
    await test.step('Add New Make', async () => {
      await this.addMakeButton.click();
      await this.saveMakeButton.click();
      const errormessage = await this.makeerrormessage.innerText();
      Reporter.validateData('Make Name is required', errormessage, 'Verify required field error message', testInfo);
      await expect.soft(errormessage).toBe("Make Name is required");
      await this.makeNameInput.fill(MakeData.ExistMake);
      await this.saveMakeButton.click();
      const existmessage = await this.alreadyexistmessage.innerText();
      Reporter.validateData(`A Make with makename '${MakeData.ExistMake}' already exists.`, existmessage, 'Verify duplicate make error message', testInfo);
      await expect.soft(existmessage).toBe(`A Make with makename '${MakeData.ExistMake}' already exists.`);
      await this.makeNameInput.waitFor({ state: 'visible' });
      await expect.soft(this.addMakeHeading).toHaveText('Add Make');
      const uniqueMakeName = `${MakeData.Make}_${Date.now()}`;
      this.expectedMakeName = uniqueMakeName;
      const makeNameFieldText = await this.makenamefiledname.innerText();
      Reporter.validateData('Make Name*', makeNameFieldText, 'Verify Make Name field label', testInfo);
      expect.soft(makeNameFieldText).toBe('Make Name*');
      const placeholderText = await this.makeplaceholder.getAttribute('placeholder');
      Reporter.validateData('e.g. Toyota', placeholderText, 'Verify placeholder text', testInfo);
      expect.soft(placeholderText).toBe('e.g. Toyota');
      const activeCheckboxText = await this.activecheckboxtext.innerText();
      Reporter.validateData('Active (Uncheck to make inactive)', activeCheckboxText, 'Verify active checkbox label', testInfo);
      expect.soft(activeCheckboxText).toBe('Active (Uncheck to make inactive)');
      const cancelButtonText = await this.cancelButton.innerText();
      Reporter.validateData('Cancel', cancelButtonText, 'Verify Cancel button text', testInfo);
      expect.soft(cancelButtonText).toBe('Cancel');
      const saveMakeButtonText = await this.saveMakeButton.innerText();
      Reporter.validateData('Save Make', saveMakeButtonText, 'Verify Save Make button text', testInfo);
      expect.soft(saveMakeButtonText).toBe('Save Make');
      await this.makeNameInput.fill(uniqueMakeName);
      await this.saveMakeButton.click();
    });
    return this.expectedMakeName;
  }
}