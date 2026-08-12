import { expect, Locator, Page, TestInfo } from '@playwright/test';
import { BasePage } from '../../../BasePage';
import { Reporter } from '../../../utils/NewReport';

export class Cancelbutton extends BasePage {
  addModelButton: Locator;
  cancelButton: Locator;

  constructor(page: Page) {
    super(page);
    this.addModelButton = page.locator('[class="flex items-center gap-2"]');
    this.cancelButton = page.getByRole('button', { name: 'Cancel' });
  }

  async VerifyModelCancelbutton(testInfo: TestInfo) {
    await this.addModelButton.click();
    await this.cancelButton.click();
    await this.addModelButton.waitFor({ state: 'visible' });
    const actual = await this.addModelButton.isVisible();
    expect(actual).toBe(true);
    Reporter.validateData(true, actual, 'Verify Cancel button closes the form and shows Add Model button', testInfo);
  }
}