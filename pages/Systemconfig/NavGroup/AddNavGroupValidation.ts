
import { expect, Locator, Page, TestInfo } from '@playwright/test';
import { BasePage } from '../../BasePage';
import { Reporter } from '../../../pages/utils/NewReport';

export class ValidateAddNavGroupForm extends BasePage {

  AddNavGroupButton: Locator;
  Heading: Locator;

  Label: Locator;
  ParentGroupDropdown: Locator;
  Icon: Locator;

  Level: Locator;
  OrderIndex: Locator;
  Depth: Locator;

  SaveButton: Locator;
  CancelButton: Locator;

  LabelError: Locator;

  private testInfo: TestInfo;

  constructor(page: Page, testInfo: TestInfo) {

    super(page);

    this.testInfo = testInfo;

    this.AddNavGroupButton = page
      .locator('button')
      .filter({ hasText: 'Nav Group' })
      .last();

    this.SaveButton = page.getByRole('button', {
      name: /Save Nav Group/i
    });

    this.CancelButton = page.getByRole('button', {
      name: /Cancel/i
    });

    this.Heading = page.getByRole('heading', {
      name: /add nav group/i
    });

    const visibleInputs =
      page.locator('input:visible');

    this.Label = visibleInputs.nth(0);

    this.Icon = visibleInputs.nth(1);

    this.Level = visibleInputs.nth(2);

    this.OrderIndex = visibleInputs.nth(3);

    this.Depth = visibleInputs.nth(4);

    this.ParentGroupDropdown = page
      .locator('button')
      .filter({ hasText: /select/i })
      .first();

    this.LabelError =
      page.locator('text=Label is required');
  }

  // =====================================
  // OPEN FORM
  // =====================================

  async openAddNavGroupForm(): Promise<void> {

    console.log('\n📋 Opening Add Nav Group Form');

    await this.AddNavGroupButton.click();

    await expect(this.Heading)
      .toBeVisible({
        timeout: 10000
      });

    Reporter.validateData(
      'Form opened successfully',
      'Form opened successfully',
      'Open Add Nav Group Form',
      this.testInfo
    );
  }

  // =====================================
  // VERIFY HEADING
  // =====================================

  async verifyHeading(): Promise<void> {

    const heading =
      (await this.Heading.textContent())
        ?.trim();

    Reporter.validateData(
      'Add Nav Group',
      heading,
      'Heading Validation',
      this.testInfo
    );
  }

  // =====================================
  // VERIFY FIELD VISIBILITY
  // =====================================

  async verifyFieldVisibility(): Promise<void> {

    const fields = [
      { locator: this.Label, name: 'Label' },
      { locator: this.ParentGroupDropdown, name: 'Parent Group' },
      { locator: this.Icon, name: 'Icon' },
      { locator: this.Level, name: 'Level' },
      { locator: this.OrderIndex, name: 'Order Index' },
      { locator: this.Depth, name: 'Depth' }
    ];

    for (const field of fields) {

      await expect(field.locator)
        .toBeVisible();

      Reporter.validateData(
        true,
        true,
        `${field.name} Visibility`,
        this.testInfo
      );
    }
  }

  // =====================================
  // VERIFY BUTTONS
  // =====================================

  async verifyButtonTexts(): Promise<void> {

    const saveText =
      (await this.SaveButton.textContent())
        ?.trim();

    Reporter.validateData(
      'Save Nav Group',
      saveText,
      'Save Button Text',
      this.testInfo
    );

    const cancelText =
      (await this.CancelButton.textContent())
        ?.trim();

    Reporter.validateData(
      'Cancel',
      cancelText,
      'Cancel Button Text',
      this.testInfo
    );
  }

  // =====================================
  // VERIFY PLACEHOLDER
  // =====================================

  async verifyPlaceholderTexts(): Promise<void> {

  const labelPlaceholder =
    await this.Label.getAttribute('placeholder');

  Reporter.validateData(
    true,
    labelPlaceholder?.includes('Vehicles, Dashboard'),
    'Label Placeholder',
    this.testInfo
  );
}

  // =====================================
  // CLICK SAVE
  // =====================================

  async triggerValidation(): Promise<void> {

    console.log('\n📋 Triggering Validation');

    await this.SaveButton.waitFor({
      state: 'visible',
      timeout: 10000
    });

    await this.SaveButton
      .scrollIntoViewIfNeeded();

    await expect(this.SaveButton)
      .toBeEnabled();

    console.log(
      'Save Visible:',
      await this.SaveButton.isVisible()
    );

    console.log(
      'Save Enabled:',
      await this.SaveButton.isEnabled()
    );

    await this.page.waitForTimeout(1000);

    await this.SaveButton.click({
      force: true
    });

    await this.page.waitForTimeout(2000);
  }

  // =====================================
  // VERIFY ERROR
  // =====================================

  async verifyLabelError(): Promise<void> {

    await expect(this.LabelError)
      .toBeVisible({
        timeout: 10000
      });

    const errorText =
      (await this.LabelError.textContent())
        ?.trim();

    Reporter.validateData(
      'Label is required',
      errorText,
      'Label Field Validation',
      this.testInfo
    );
  }

  // =====================================
  // COMPLETE FLOW
  // =====================================

  async validateAddNavGroupForm(): Promise<boolean> {

    try {

      console.log(
        '\n' + '='.repeat(60)
      );

      console.log(
        'ADD NAV GROUP VALIDATION'
      );

      console.log(
        '='.repeat(60)
      );

      await this.openAddNavGroupForm();

      await this.verifyHeading();

      await this.verifyFieldVisibility();

      await this.verifyButtonTexts();

      await this.verifyPlaceholderTexts();

      await this.triggerValidation();

      await this.verifyLabelError();

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
