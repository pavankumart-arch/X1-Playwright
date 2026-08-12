import { expect, Locator, Page, TestInfo } from '@playwright/test';
import { BasePage } from '../../../BasePage';
import { Reporter } from '../../../utils/NewReport';

export class cancelTrim extends BasePage {
  addTrimButton: Locator;
  cancelButton: Locator;

  constructor(page: Page) {
    super(page);
    this.addTrimButton = page.locator('button').filter({ hasText: 'Trim' });
    this.cancelButton = page.getByRole('button', { name: 'Cancel' });
  }

  async VerifyTrimCancelbutton(testInfo: TestInfo) {
    await this.addTrimButton.click();
    await this.cancelButton.click();
    await this.addTrimButton.waitFor({ state: 'visible' });
    const actual = await this.addTrimButton.isVisible();
    expect(actual).toBe(true);
    Reporter.validateData(true, actual, 'Verify Cancel button closes the form and shows Add Model button', testInfo);
  }
}