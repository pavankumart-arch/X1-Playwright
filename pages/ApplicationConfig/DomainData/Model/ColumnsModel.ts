import { BasePage } from "../../../BasePage";
import { Page, Locator, TestInfo, expect } from '@playwright/test';
import { Reporter } from '../../../utils/NewReport';

export class ModelColumns extends BasePage {
  page: Page;
  headers: Locator;
  table: Locator;

 constructor(page: Page) {
  super(page);
  this.page = page;
  this.table = this.page.locator('table:has(th:has-text("Model"))');
  this.headers = this.table.locator('thead th');
}
async verifyModleColumnHeaders(testInfo: TestInfo) {
  await this.table.waitFor({ state: 'visible', timeout: 10000 });

  const expectedHeaders = ['ID', 'Model', 'Created', 'Status', 'Actions'];

  const actualHeaders = await this.headers.evaluateAll(headers =>
    headers.map(h => h.textContent?.trim() || '')
  );

  console.log('MODEL TABLE HEADERS:', actualHeaders);

  await Reporter.validateColumns(
    expectedHeaders,
    actualHeaders,
    testInfo,
    'Model Table Columns'
  );

  expect(actualHeaders).toEqual(expectedHeaders);
}
}