import {
  expect,
  Locator,
  Page,
  TestInfo
} from '@playwright/test';

import { BasePage } from '../../BasePage';

import { Reporter }
from '../../../pages/utils/NewReport';

export class VerifyAppTypeValidation extends BasePage {

  AddAppTypeButton: Locator;
  SaveButton: Locator;

  TitleValidation: Locator;
  TypeValidation: Locator;

  private testInfo: TestInfo;

  constructor(
    page: Page,
    testInfo: TestInfo
  ) {

    super(page);

    this.testInfo = testInfo;

    this.AddAppTypeButton =
  page.locator('text=Add AppType');;

    this.SaveButton =
      page.getByRole('button')
        .filter({
          hasText: /save/i
        })
        .first();

    this.TitleValidation =
      page.getByText(
        'Title is required'
      );

    this.TypeValidation =
      page.getByText(
        'Type (Identifier) is required'
      );
  }

  // =====================================
  // OPEN FORM
  // =====================================

  async openAddAppTypeForm(): Promise<void> {

    console.log(
      '\n📋 Opening Add AppType Form'
    );

    await this.AddAppTypeButton.click();

    await this.page.waitForLoadState(
      'networkidle'
    );

    Reporter.validateData(
      'Form opened successfully',
      'Form opened successfully',
      'Open Add AppType Form',
      this.testInfo
    );
  }

  // =====================================
  // CLICK SAVE
  // =====================================

  async triggerValidation(): Promise<void> {

    console.log(
      '\n📋 Triggering Validation'
    );

    await this.SaveButton.waitFor({
      state: 'visible',
      timeout: 10000
    });

    await this.SaveButton
      .scrollIntoViewIfNeeded();

    await expect(
      this.SaveButton
    ).toBeEnabled();

    console.log(
      'Save Visible:',
      await this.SaveButton.isVisible()
    );

    console.log(
      'Save Enabled:',
      await this.SaveButton.isEnabled()
    );

    await this.SaveButton.click({
      force: true
    });

    await this.page.waitForTimeout(
      2000
    );
  }

  // =====================================
  // VERIFY TITLE ERROR
  // =====================================

  async verifyTitleValidation(): Promise<void> {

    await expect(
      this.TitleValidation
    ).toBeVisible({
      timeout: 10000
    });

    const titleError =
      (
        await this.TitleValidation
          .textContent()
      )?.trim();

    Reporter.validateData(
      'Title is required',
      titleError,
      'Title Validation',
      this.testInfo
    );
  }

  // =====================================
  // VERIFY TYPE ERROR
  // =====================================

  async verifyTypeValidation(): Promise<void> {

    await expect(
      this.TypeValidation
    ).toBeVisible({
      timeout: 10000
    });

    const typeError =
      (
        await this.TypeValidation
          .textContent()
      )?.trim();

    Reporter.validateData(
      'Type (Identifier) is required',
      typeError,
      'Type Validation',
      this.testInfo
    );
  }

  // =====================================
  // COMPLETE FLOW
  // =====================================

  async VerifyRequiredFieldValidation(): Promise<boolean> {

    try {

      console.log(
        '\n' + '='.repeat(60)
      );

      console.log(
        'ADD APPTYPE VALIDATION'
      );

      console.log(
        '='.repeat(60)
      );

      await this.openAddAppTypeForm();

      await this.triggerValidation();

      await this.verifyTitleValidation();

      await this.verifyTypeValidation();

      console.log(
        '\n✅ ALL VALIDATIONS PASSED'
      );

      Reporter.validateData(
        'PASS',
        'PASS',
        'Final Result',
        this.testInfo
      );

      return true;

    } catch (error) {

      console.log(
        `❌ Validation Failed: ${error}`
      );

      Reporter.validateData(
        'PASS',
        'FAIL',
        'Final Result',
        this.testInfo
      );

      return false;
    }
  }
}