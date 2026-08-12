import { Page, Locator, TestInfo } from '@playwright/test';
import { BasePage } from '../../BasePage';
import { Reporter } from '../../utils/NewReport';


export class rooftopUserColumns extends BasePage {
  page: Page;
  headers: Locator;
  table: Locator;

  constructor(page: Page) {
    super(page);
    this.page = page;
    this.table = this.page.locator('table:has(th:has-text("Username"))');
    this.headers = this.table.locator('thead th');
  }

  async verifyRooftopUserColumnHeaders(testInfo: TestInfo) {
    await this.table.waitFor({ state: 'visible', timeout: 10000 });
    
    const expectedHeaders = ['ID', 'Username', 'Email', 'User Type', 'Status', 'Actions'];
    const count = await this.headers.count();
    const actualHeaders: string[] = [];
    
    for (let i = 0; i < count; i++) {
      const text = (await this.headers.nth(i).textContent())?.trim();
      if (text) actualHeaders.push(text);
    }
    
    const validationResult = Reporter.validateColumns(expectedHeaders, actualHeaders, testInfo, 'User Table Columns');
    
    testInfo.annotations.push({
      type: 'User Table Details',
      description: `Total headers found: ${actualHeaders.length}\nExpected headers: ${expectedHeaders.length}\nMatched: ${validationResult.summary.passed}\nMissing: ${validationResult.summary.failed}`
    });
    
    return validationResult;
  }
}