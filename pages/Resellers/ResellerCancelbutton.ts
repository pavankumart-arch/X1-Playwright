import { expect, Locator, Page, TestInfo } from '@playwright/test';
import { BasePage } from '../BasePage';
import { logAndValidate } from '../../utils/reportUtil';
export class VerifyCancelbutton extends BasePage {

  AddResellerButton: Locator;
  CancelButton: Locator;

  constructor(page: Page) {
    super(page);

    this.AddResellerButton = page.locator('button:has(span:text-is("Reseller"))');
    this.CancelButton = page.getByRole('button', { name: 'Cancel' });
  }

  async VerifyResellerCancelbutton(testInfo: TestInfo) {

    // 🔹 Step 1: Open form
    await this.AddResellerButton.click();
    await this.page.waitForTimeout(3000);

    // 🔹 Step 2: Click Cancel
    await this.CancelButton.click();
    await this.page.waitForTimeout(3000);

    // 🔹 Step 3: Wait for the Add Reseller button to be visible again (form closed)
    await this.AddResellerButton.waitFor({ state: 'visible' });

    // 🔍 Step 4: Capture actual visibility
    const actual = await this.AddResellerButton.isVisible();

    // 📝 Step 5: Validate using logAndValidate
    logAndValidate(
      {
        step: 'Verify Cancel button closes the form and shows Add Reseller button',
        expected: true,
        actual: actual,
        isSummary: false,
      },
      testInfo
    );
  }
}