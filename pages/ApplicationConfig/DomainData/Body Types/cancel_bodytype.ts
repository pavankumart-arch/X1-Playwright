import { expect, Locator, Page, TestInfo } from '@playwright/test';
import { BasePage } from '../../../BasePage';
import { Reporter } from '../../../utils/NewReport';

export class CancelBodyType extends BasePage {

  addBodyTypeButton: Locator;
  cancelButton: Locator;

  constructor(page: Page) {
    super(page);

    this.addBodyTypeButton = page.getByRole('button', {
      name: /Body Type/i
    });

    this.cancelButton = page.getByRole('button', {
      name: 'Cancel'
    });
  }

  async VerifyBodyTypeCancelbutton(
    testInfo: TestInfo
  ) {

    await this.addBodyTypeButton.click();

    await this.cancelButton.click();

    await this.addBodyTypeButton.waitFor({
      state: 'visible'
    });

    const actual =
      await this.addBodyTypeButton.isVisible();

    expect(actual).toBe(true);

    Reporter.validateData(
      true,
      actual,
      'Verify Cancel button closes the form and shows Add Body Type button',
      testInfo
    );
  }
}