import { expect, Locator, Page, TestInfo } from '@playwright/test';
import { BasePage } from '../../../BasePage';
import { logAndValidate } from '../../../utils/reportUtil';
import { Reporter } from '../../../utils/NewReport';

export class Cancelbutton extends BasePage {
  addModelButton: Locator;
  cancelButton: Locator;

  constructor(page: Page) {
    super(page);

    this.addModelButton = page.locator('[class="flex items-center gap-2"]');
    this.cancelButton = page.getByRole('button', { name: 'Cancel' });
  }

  async VerifyMakeCancelbutton(testInfo: TestInfo) {
    // Step 1: Open form
    await this.addModelButton.click();
    await this.page.waitForTimeout(2000)

    // Step 2: Click Cancel
    await this.cancelButton.click();

    // Step 3: Wait for the Add Make button to be visible again (form closed)
    await this.addModelButton.waitFor({ state: 'visible' });

    // Step 4: Capture actual visibility
    const actual = await this.addModelButton.isVisible();

    // Step 5: Add Reporter validation
    Reporter.validateData(
      true,
      actual,
      'Cancel button closes the form',
      testInfo
    );

    // Optional Playwright assertion
    expect(actual).toBe(true);

    // Step 6: Validate using logAndValidate
    logAndValidate(
      {
        step: 'Verify Cancel button closes the form and shows Add Make button',
        expected: true,
        actual,
      },
      testInfo
    );
  }
}