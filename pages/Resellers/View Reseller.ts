import { Locator, Page, TestInfo } from '@playwright/test';
import { BasePage } from '../BasePage';
import { logAndValidate } from '../../utils/reportUtil';

export class ViewReseller extends BasePage {
  private searchInput: Locator;
  private modal: Locator;
  private testInfo: TestInfo;

  constructor(page: Page, testInfo: TestInfo) {
    super(page);
    this.testInfo = testInfo;
    this.searchInput = page.locator('input[placeholder*="Search"]').first();
    this.modal = page.locator('[role="dialog"], .modal, .MuiDialog-root, .ant-modal, .drawer, .side-drawer').first();
  }

  private async getContainer(): Promise<Locator> {
    const isModalVisible = await this.modal.isVisible().catch(() => false);
    return isModalVisible ? this.modal : this.page.locator('body');
  }

  private async getCheckboxLocator(name: string): Promise<Locator> {
    const container = await this.getContainer();
    return container.getByRole('checkbox', { name });
  }

  async openResellerDetails(resellerName: string): Promise<void> {
    console.log(`🔍 Opening details for: ${resellerName}`);

    await this.searchInput.fill(resellerName);
    await this.searchInput.press('Enter');
    await this.page.waitForLoadState('networkidle');
    await this.page.waitForTimeout(1000);

    const row = this.page.locator(`table tbody tr:has-text("${resellerName}")`).first();
    await row.waitFor({ state: 'visible', timeout: 10000 });

    const editBtn = row.locator('td:last-child button').first();
    if (await editBtn.isVisible()) {
      await editBtn.click();
    } else {
      await row.locator('td:first-child button, td:nth-child(2) button').first().click();
    }

    try {
      await this.modal.waitFor({ state: 'visible', timeout: 5000 });
    } catch {
      await this.page.waitForLoadState('networkidle');
    }
  }

  private async getFieldValue(fieldName: string): Promise<string> {
    try {
      const container = await this.getContainer();

      // ----- TT Options: multiple fallbacks -----
      if (fieldName === 'TT Options') {
        // 1. by placeholder
        let input = container.getByPlaceholder('Enter TT options');
        if (await input.count() > 0) return (await input.first().inputValue()).trim();
        
        // 2. by label text + nearby input
        input = container.locator('text=TT Options').locator('..').locator('input').first();
        if (await input.count() > 0) return (await input.inputValue()).trim();
        
        // 3. by id or name attribute (common patterns)
        input = container.locator('#admin-reseller-create-ttOptions, input[name="ttOptions"]').first();
        if (await input.count() > 0) return (await input.inputValue()).trim();
        
        return 'Not Found';
      }

      // ----- Player Size: avoid hidden input -----
      if (fieldName === 'Player Size') {
        const visibleInput = container.getByRole('textbox', { name: 'Player Size' });
        if (await visibleInput.count() > 0) return (await visibleInput.inputValue()).trim();
        // fallback to placeholder
        const placeholderInput = container.getByPlaceholder('Enter player size');
        if (await placeholderInput.count() > 0) return (await placeholderInput.inputValue()).trim();
        return 'Not Found';
      }

      // ----- App ID: placeholder fallback -----
      if (fieldName === 'App ID') {
        let input = container.locator(`text=${fieldName}`).locator('..').locator('input').first();
        if (await input.count() === 0) input = container.getByPlaceholder('Enter app identifier');
        if (await input.count() > 0) return (await input.inputValue()).trim();
        return 'Not Found';
      }

      // ----- Generic for other text fields -----
      let locator = container.locator(`text=${fieldName}`).locator('..').locator('input, .value, p, div').first();
      const input = locator.locator('input');
      if (await input.count() > 0) {
        return (await input.first().inputValue()).trim();
      }
      const text = await locator.textContent();
      return text?.trim() || '';
    } catch {
      return 'Not Found';
    }
  }

  async verifyResellerFromJson(expectedData: any, testInfo: TestInfo): Promise<boolean> {
    let allPassed = true;

    try {
      await this.modal.waitFor({ state: 'visible', timeout: 3000 });
    } catch {
      await this.page.waitForLoadState('networkidle');
    }

    const fields = [
      { name: 'Name', expected: expectedData.Name },
      { name: 'Description', expected: expectedData.Description },
      { name: 'Billing Name', expected: expectedData.BillingName },
      { name: 'Sales Person', expected: expectedData.SalesPerson },
      { name: 'TT Options', expected: expectedData.TTOptions },
      { name: 'App ID', expected: expectedData.AppID },
      { name: 'Player Size', expected: expectedData.PlayerSize?.toString() ?? '' },
    ];

    for (const field of fields) {
      let actual = await this.getFieldValue(field.name);
      if (actual === '') actual = 'No Data Found';
      logAndValidate({ step: field.name, expected: field.expected, actual }, testInfo);
      if (actual !== field.expected) allPassed = false;
    }

    const checkboxNames = [
      'Show Controls', 'Show Map', 'Show Related', 'Show Form',
      'Auto Play', 'Show Sharing', 'Show CC', 'Active'
    ];

    for (const name of checkboxNames) {
      const checkbox = await this.getCheckboxLocator(name);
      const isChecked = await checkbox.isChecked().catch(() => false);
      const expected = expectedData[name.replace(' ', '')] ?? false;
      logAndValidate({ step: name, expected, actual: isChecked }, testInfo);
      if (isChecked !== expected) allPassed = false;
    }

    if (await this.modal.isVisible()) {
      const closeBtn = this.modal.locator('button[aria-label="Close"], .close, .modal-close').first();
      if (await closeBtn.isVisible()) await closeBtn.click();
    }

    return allPassed;
  }
}