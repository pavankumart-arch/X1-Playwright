import { BasePage } from "../../../BasePage";
import { Page, Locator, TestInfo, expect } from '@playwright/test';
import { logAndValidate } from '../../../utils/reportUtil';
import { Reporter } from '../../../utils/NewReport';

export class MakesColumns extends BasePage {
  page: Page;
  headers: Locator;
  table: Locator;

  constructor(page: Page) {
    super(page);
    this.page = page;
    this.table = this.page.locator('table:has(th:has-text("Make"))');
    this.headers = this.table.locator('thead th');
  }

  async verifyMakesColumnHeaders(testInfo: TestInfo) {
    await this.table.waitFor({ state: 'visible', timeout: 10000 });
    const expectedHeaders = ['ID', 'Make', 'Created', 'Updated', 'Status', 'Actions'];
    const actualHeaders = await this.headers.allInnerTexts();
    const cleanedHeaders = actualHeaders.map(h => h.trim());
    console.log('MAKES TABLE HEADERS:', cleanedHeaders);
    await Reporter.validateColumns(expectedHeaders, cleanedHeaders, testInfo, 'Makes Table Columns');
    expect(cleanedHeaders).toEqual(expectedHeaders);
  }
}