import { Locator, Page, TestInfo, expect } from '@playwright/test';
import { BasePage } from '../../BasePage';
import { Reporter } from '../../utils/NewReport';

export class VerifyrooftopUserCancelButton extends BasePage {

  addUserButton: Locator;
  cancelButton: Locator;

  constructor(page: Page) {
    super(page);

    this.addUserButton =
      page.locator('[class="lucide lucide-plus"]');

    this.cancelButton =
      page.getByRole('button', { name: 'Cancel' });
  }

  async verifyrooftopUserCancelButton(
    testInfo: TestInfo
  ): Promise<void> {

    // Open Add User Form
    await this.addUserButton.click();

    // Wait for Cancel Button
    await this.cancelButton.waitFor({
      state: 'visible'
    });

    // Click Cancel
    await this.cancelButton.click();

    // Verify Form Closed
    await this.addUserButton.waitFor({
      state: 'visible'
    });

    const formClosed =
      await this.addUserButton.isVisible();

    Reporter.validateData(
      'Form Closed Successfully',
      formClosed
        ? 'Form Closed Successfully'
        : 'Form Still Open',
      'Cancel Button Verification',
      testInfo
    );

    expect(
      formClosed,
      'Cancel button did not close the Add User form'
    ).toBeTruthy();
  }
}