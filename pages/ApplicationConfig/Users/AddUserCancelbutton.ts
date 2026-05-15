import { Locator, Page, TestInfo } from '@playwright/test';
import { logAndValidate } from '../../utils/reportUtil';
import { BasePage } from '../../BasePage';

export class VerifyUserCancelButton extends BasePage {

  addUserButton: Locator;
  cancelButton: Locator;

  constructor(page: Page) {
    super(page);

    this.addUserButton = page.locator('[class="lucide lucide-plus"]')
    this.cancelButton = page.getByRole('button', { name: 'Cancel' });
  }

  async verifyUserCancelButton(testInfo: TestInfo) {

    // Step 1: Open the Add User form
    await this.addUserButton.click();
    await this.page.waitForTimeout(3000);

    // Step 2: Click the Cancel button
    await this.cancelButton.click();
    await this.page.waitForTimeout(3000);

    // Step 3: Wait for the Add User button to be visible again (form closed)
    await this.addUserButton.waitFor({ state: 'visible' });

    // Step 4: Capture actual visibility
    const actual = await this.addUserButton.isVisible();

    // Step 5: Prepare custom messages
    const expectedMessage = 'Cancel button functionality is working.';
    const actualMessage = actual
      ? 'Cancel button functionality is working.'
      : 'Cancel button functionality is not working.';

    // Step 6: Validate using logAndValidate
    logAndValidate(
      {
        step: 'Verify Cancel button functionality',
        expected: expectedMessage,
        actual: actualMessage,
      },
      testInfo
    );
  }
}