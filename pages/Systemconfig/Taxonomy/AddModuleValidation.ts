import {
  expect,
  Locator,
  Page,
  TestInfo
} from '@playwright/test';

import { BasePage } from '../../BasePage';

import { Reporter }
from '../../../pages/utils/NewReport';

export class VerifyModuleValidation extends BasePage {

  SearchBox: Locator;
  AddModuleButton: Locator;
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

    this.SearchBox =
      page.getByPlaceholder('Search...')
        .first();

    this.AddModuleButton =
      page.getByRole('button', {
        name: 'Module',
        exact: true
      });

    this.SaveButton =
      page.getByRole('button', {
        name: /Save Module/i
      });

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
  // OPEN ADMIN MODULE PAGE
  // =====================================

  async openModuleForm(): Promise<void> {

    console.log('\n📋 Opening Admin Modules');

    await this.SearchBox.fill('Admin');

    await this.page.waitForTimeout(2000);

    await this.page
      .getByRole('link', {
        name: 'Admin',
        exact: true
      })
      .click();

    await expect(
      this.page.locator('table thead th')
        .filter({ hasText: 'Module Name' })
    ).toBeVisible({
      timeout: 15000
    });

    console.log('✅ Modules page opened');

    await this.AddModuleButton.click();

    await this.page.waitForLoadState(
      'networkidle'
    );

    Reporter.validateData(
      'Form opened successfully',
      'Form opened successfully',
      'Open Add Module Form',
      this.testInfo
    );
  }

  // =====================================
  // CLICK SAVE
  // =====================================

  async triggerValidation(): Promise<void> {

    await this.SaveButton.waitFor({
      state: 'visible'
    });

    await this.SaveButton.click();

    await this.page.waitForTimeout(2000);
  }

  // =====================================
  // VERIFY TITLE ERROR
  // =====================================

  async verifyTitleValidation(): Promise<void> {

    await expect(
      this.TitleValidation
    ).toBeVisible();

    const error =
      (
        await this.TitleValidation
          .textContent()
      )?.trim();

    Reporter.validateData(
      'Title is required',
      error,
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
    ).toBeVisible();

    const error =
      (
        await this.TypeValidation
          .textContent()
      )?.trim();

    Reporter.validateData(
      'Type (Identifier) is required',
      error,
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
        'ADD MODULE VALIDATION'
      );

      console.log(
        '='.repeat(60)
      );

      await this.openModuleForm();

      await this.triggerValidation();

      await this.verifyTitleValidation();

      await this.verifyTypeValidation();

      Reporter.validateData(
        'PASS',
        'PASS',
        'Final Result',
        this.testInfo
      );

      return true;

    } catch (error) {

      console.log(error);

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