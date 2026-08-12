import { Page, Locator, TestInfo } from '@playwright/test';
import { BasePage } from '../BasePage';
import { Reporter } from '../utils/NewReport';

export class InventoryColumns extends BasePage {
  page: Page;
  headers: Locator;
  table: Locator;
  testInfo: TestInfo;
  
  constructor(page: Page, testInfo: TestInfo) {
    super(page);
    this.page = page;
    this.table = this.page.locator('table');
    this.headers = this.page.locator('table thead th');
    this.testInfo = testInfo;
  }

  async verifyinventoryColumns() {
    await this.table.waitFor({ state: 'visible' });
    await this.page.waitForLoadState('networkidle');
    await this.headers.first().waitFor();
    const expectedColumns = ['Photos', 'Added', 'Updated', 'In Stock', 'VIN', 'Year', 'Make/Model', 'Trim', 'Stock ID', 'Status', 'Type', 'Unpublished'];
    const actualHeaders = await this.headers.allTextContents();
    const normalizedHeaders = actualHeaders.filter(header => header.trim());
    Reporter.validateColumns(expectedColumns, normalizedHeaders, this.testInfo, 'Inventory Table Columns');
    return { expectedColumns, actualHeaders: normalizedHeaders };
  }
}