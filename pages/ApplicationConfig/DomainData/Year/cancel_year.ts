import { expect, Locator, Page, TestInfo } from '@playwright/test';
import { BasePage } from '../../../BasePage';
import { Reporter } from '../../../utils/NewReport';

export class cancelYear extends BasePage {
  addTrimButton: Locator;
  cancelButton: Locator;

  constructor(page: Page) {
    super(page);

    
    this.addTrimButton = page.locator('[class="flex items-center gap-2"]');

    this.cancelButton = page.getByRole('button', {
      name: 'Cancel'
    });
  }

  async VerifyYearCancelButton(testInfo: TestInfo) {
    // Open Add Trim form
    await this.addTrimButton.click();

    // Click Cancel
    await this.cancelButton.click();

    // Verify Add Trim button is visible again
    await this.addTrimButton.waitFor({ state: 'visible' });

    const actual = await this.addTrimButton.isVisible();

    expect(actual).toBe(true);

    Reporter.validateData(
      true,
      actual,
      'Verify Cancel button closes the form and shows Add Trim button',
      testInfo
    );
  }
}