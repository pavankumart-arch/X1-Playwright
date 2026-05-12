import { expect, Locator, Page, TestInfo } from '@playwright/test';
import { BasePage } from '../BasePage';
import { logAndValidate } from '../../utils/reportUtil';

type FieldConfig = {
  label: Locator;
  text: string;
  input: Locator; // make required
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

  private async logAndCapture(step: string, expected: any, actual: any, testInfo?: TestInfo) {
    const isPass = expected === actual || String(actual).includes(String(expected));
    if (!isPass && testInfo) {
      const screenshot = await this.page.screenshot();
      await testInfo.attach(`${step} - FAILED`, { body: screenshot, contentType: 'image/png' });
    }
    logAndValidate({ step, expected, actual }, testInfo);
  }

  async validateResellerForm(testInfo?: TestInfo): Promise<void> {
    await this.clickOnElement(this.AddResellerButton);
    console.log('🔥 Reseller form validation started');
    await expect(this.AddResellerheading).toBeVisible();

    await this.SaveButton.click();
    await this.page.waitForTimeout(2000);

    // 1️⃣ Validate "Name is required" error message
    const errorText = await this.NameErrormessage.textContent();
    await this.logAndCapture('Validate Name Error Message', 'Name is required', errorText?.trim(), testInfo);

    // 2️⃣ Validate fields that exist on the page - using reliable locators
    const fields: FieldConfig[] = [
      {
        label: this.page.getByText('Name*', { exact: true }),
        text: 'Name*',
        input: this.page.getByPlaceholder('Enter reseller name')
      },
      {
        label: this.page.getByText('App ID', { exact: true }),
        text: 'App ID',
        input: this.page.getByPlaceholder('Enter app identifier') // from screenshot placeholder
      },
      {
        label: this.page.getByText('TT Options', { exact: true }),
        text: 'TT Options',
        input: this.page.getByPlaceholder('Enter TT options')
      },
      {
        label: this.page.getByText('Sales Person', { exact: true }),
        text: 'Sales Person',
        input: this.page.getByPlaceholder('Enter sales person name')
      },
      {
        label: this.page.getByText('Player Size', { exact: true }),
        text: 'Player Size',
        input: this.page.getByPlaceholder('Enter player size')
      }
    ];

    for (const field of fields) {
      // Check label visibility and text
      const labelVisible = await field.label.isVisible().catch(() => false);
      const labelText = await field.label.textContent().catch(() => '');
      await this.logAndCapture(`Label Visible - ${field.text}`, true, labelVisible, testInfo);
      await this.logAndCapture(`Label Text - ${field.text}`, field.text, labelText?.trim(), testInfo);

      // Check input visibility
      const inputVisible = await field.input.isVisible().catch(() => false);
      await this.logAndCapture(`Input Visible - ${field.text}`, true, inputVisible, testInfo);
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
      const actualLabelText = await label.textContent();
      await this.logAndCapture(`Checkbox Label Check - ${name}`, name, actualLabelText?.trim(), testInfo);
      await this.logAndCapture(`Checkbox Visible - ${name}`, true, await checkbox.isVisible(), testInfo);
    }

    // 4️⃣ Buttons
    const saveText = await this.SaveButton.textContent();
    await this.logAndCapture('Save Button Label Check', 'Save Reseller', saveText?.trim(), testInfo);
    await this.logAndCapture('Save Button Visible', true, await this.SaveButton.isVisible(), testInfo);

    const cancelText = await this.CancelButton.textContent();
    await this.logAndCapture('Cancel Button Label Check', 'Cancel', cancelText?.trim(), testInfo);
    await this.logAndCapture('Cancel Button Visible', true, await this.CancelButton.isVisible(), testInfo);

    console.log('🔥 Reseller form validation finished');
  }
}