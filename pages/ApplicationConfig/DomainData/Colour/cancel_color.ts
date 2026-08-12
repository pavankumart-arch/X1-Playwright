import { expect, Locator, Page, TestInfo } from '@playwright/test';
import { BasePage } from '../../../BasePage';
import { Reporter } from '../../../utils/NewReport';

export class cancelColor extends BasePage {
  addColorButton: Locator;
  cancelButton: Locator;

  constructor(page: Page) {
    super(page);

    // Add Color button
    this.addColorButton = page.locator('[class="flex items-center gap-2"]');

    // Cancel button
    this.cancelButton = page.getByRole('button', {
      name: 'Cancel'
    });
  }

  async VerifyColorCancelButton(testInfo: TestInfo) {
    // Open Add Color form
    await this.addColorButton.click();

    // Click Cancel
    await this.cancelButton.click();

    // Verify Add Color button is visible again
    await this.addColorButton.waitFor({ state: 'visible' });

    const actual = await this.addColorButton.isVisible();

    expect(actual).toBe(true);

    Reporter.validateData(
      true,
      actual,
      'Verify Cancel button closes the form and shows Add Color button',
      testInfo
    );
  }
}