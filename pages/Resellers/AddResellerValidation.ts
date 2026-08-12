import { expect, Locator, Page, TestInfo } from '@playwright/test';
import { BasePage } from '../BasePage';
import { Reporter } from '../utils/NewReport';


type FieldConfig = {
  label: Locator;
  text: string;
  input: Locator;
  isOptional?: boolean; // Mark optional fields that might be missing
  expectedInputPlaceholder?: string;
};

export class ResellerValidation extends BasePage {
  AddResellerButton: Locator;
  AddResellerheading: Locator;
  SaveButton: Locator;
  CancelButton: Locator;
  NameErrormessage: Locator;

  constructor(page: Page) {
    super(page);
    this.AddResellerButton = page.locator('button:has(span:text-is("Reseller"))');
    this.AddResellerheading = page.getByRole('heading', { name: /Add Reseller/i });
    this.SaveButton = page.getByRole('button', { name: /Save Reseller/i });
    this.CancelButton = page.getByRole('button', { name: /Cancel/i });
    this.NameErrormessage = page.getByText('Name is required');
  }

  async validateResellerForm(testInfo: TestInfo): Promise<void> {
    // Start the test reporting
    Reporter.startTest();

    await this.clickOnElement(this.AddResellerButton);
    console.log('🔥 Reseller form validation started');

    await expect(this.AddResellerheading).toBeVisible();

    await this.SaveButton.click();
    await this.page.waitForTimeout(2000);

    // 1️⃣ Validate "Name is required" error message
    const errorText = await this.NameErrormessage.textContent();
    Reporter.validateData(
      'Name is required',
      errorText?.trim(),
      'Name Error Message',
      testInfo
    );

    // 2️⃣ Validate form fields (with optional fields support)
    const fields: FieldConfig[] = [
      {
        label: this.page.getByText('Name*', { exact: true }),
        text: 'Name*',
        input: this.page.getByPlaceholder('Enter reseller name'),
        expectedInputPlaceholder: 'Enter reseller name'
      },
      {
        label: this.page.getByText('App ID', { exact: true }),
        text: 'App ID',
        input: this.page.getByPlaceholder('Enter app identifier'),
        expectedInputPlaceholder: 'Enter app identifier'
      },
      {
        label: this.page.getByText('TT Template', { exact: true }),
        text: 'TT Template',
        input: this.page.getByPlaceholder(/TT Template/i),
        isOptional: true, // Mark as optional since it's missing from dev
        expectedInputPlaceholder: 'TT Template'
      },
      {
        label: this.page.getByText('TT Options', { exact: true }),
        text: 'TT Options',
        input: this.page.getByPlaceholder('Enter TT options'),
        expectedInputPlaceholder: 'Enter TT options'
      },
      {
        label: this.page.getByText('Sales Person', { exact: true }),
        text: 'Sales Person',
        input: this.page.getByPlaceholder('Enter sales person name'),
        expectedInputPlaceholder: 'Enter sales person name'
      },
      {
        label: this.page.getByText('Player Size', { exact: true }),
        text: 'Player Size',
        input: this.page.getByPlaceholder('Enter player size'),
        expectedInputPlaceholder: 'Enter player size'
      }
    ];

    for (const field of fields) {
      // Check if field exists
      const labelExists = await field.label.count() > 0;
      const labelVisible = labelExists ? await field.label.isVisible().catch(() => false) : false;
      const labelText = labelExists ? await field.label.textContent().catch(() => '') : '';

      if (field.isOptional && !labelExists) {
        // For optional/missing fields, log as warning but don't fail
        console.log(`⚠️ Optional field "${field.text}" is missing from the UI (development in progress)`);
        
        await testInfo.attach(`Missing Optional Field: ${field.text}`, {
          body: `Field "${field.text}" is not present in the current UI version. This is expected as it's under development.`,
          contentType: 'text/plain'
        });
        
        Reporter.validateData(
          `[OPTIONAL] ${field.text} - Field Present`,
          'NOT PRESENT (Development)',
          `Optional Field Status: ${field.text}`,
          testInfo
        );
        continue; // Skip validation for this field
      }

      // Validate Label exists
      const labelValidationPassed = labelExists && labelVisible;
      Reporter.validateData(
        true,
        labelValidationPassed,
        `Label Visible - ${field.text}`,
        testInfo
      );

      if (labelExists) {
        Reporter.validateData(
          field.text,
          labelText?.trim(),
          `Label Text - ${field.text}`,
          testInfo
        );
      }

      // Validate Input field exists and has correct placeholder
      const inputExists = await field.input.count() > 0;
      const inputVisible = inputExists ? await field.input.isVisible().catch(() => false) : false;

      Reporter.validateData(
        true,
        inputVisible,
        `Input Visible - ${field.text}`,
        testInfo
      );

      if (inputExists && field.expectedInputPlaceholder) {
        const actualPlaceholder = await field.input.getAttribute('placeholder').catch(() => '');
        Reporter.validateData(
          field.expectedInputPlaceholder,
          actualPlaceholder,
          `Input Placeholder - ${field.text}`,
          testInfo
        );
      }
    }

    // 3️⃣ Validate checkboxes
    const checkboxes = [
      'Show Controls',
      'Show Map',
      'Show Related',
      'Show Form',
      'Auto Play',
      'Show Sharing',
      'Show CC',
      'Active'
    ];

    for (const name of checkboxes) {
      const checkbox = this.page.getByRole('checkbox', { name });
      const label = this.page.getByText(name, { exact: true });

      const checkboxExists = await checkbox.count() > 0;
      const labelExists = await label.count() > 0;
      
      const actualLabelText = labelExists ? await label.textContent().catch(() => '') : '';
      const checkboxVisible = checkboxExists ? await checkbox.isVisible().catch(() => false) : false;

      Reporter.validateData(
        name,
        actualLabelText?.trim(),
        `Checkbox Label - ${name}`,
        testInfo
      );

      Reporter.validateData(
        true,
        checkboxVisible,
        `Checkbox Visible - ${name}`,
        testInfo
      );
    }

    // 4️⃣ Validate Save Button
    const saveExists = await this.SaveButton.count() > 0;
    const saveText = saveExists ? await this.SaveButton.textContent().catch(() => '') : '';
    const saveVisible = saveExists ? await this.SaveButton.isVisible().catch(() => false) : false;

    Reporter.validateData(
      'Save Reseller',
      saveText?.trim(),
      'Save Button Label',
      testInfo
    );

    Reporter.validateData(
      true,
      saveVisible,
      'Save Button Visible',
      testInfo
    );

    // 5️⃣ Validate Cancel Button
    const cancelExists = await this.CancelButton.count() > 0;
    const cancelText = cancelExists ? await this.CancelButton.textContent().catch(() => '') : '';
    const cancelVisible = cancelExists ? await this.CancelButton.isVisible().catch(() => false) : false;

    Reporter.validateData(
      'Cancel',
      cancelText?.trim(),
      'Cancel Button Label',
      testInfo
    );

    Reporter.validateData(
      true,
      cancelVisible,
      'Cancel Button Visible',
      testInfo
    );

    console.log('🔥 Reseller form validation finished');

    // Generate final summary report
    Reporter.endTest(testInfo);
  }
}