import { BasePage } from "../../../BasePage";
import {
  Page,
  Locator,
  TestInfo
} from '@playwright/test';
import { logAndValidate } from '../../../utils/reportUtil';

export class MakesColumns extends BasePage {

  page: Page;
  headers: Locator;
  table: Locator;

  constructor(page: Page) {
    super(page);
    this.page = page;

    // ============================================
    // MAKES TABLE – uses "Make" as unique column text
    // ============================================
    this.table = this.page.locator(
      'table:has(th:has-text("Make"))'
    );

    this.headers = this.table.locator('thead th');
  }

  // ============================================
  // VERIFY MAKES TABLE HEADERS
  // ============================================
  async verifyMakesColumnHeaders(testInfo: TestInfo) {

    // Wait for table to be visible
    await this.table.waitFor({
      state: 'visible',
      timeout: 10000
    });

    // Expected headers based on screenshot
    const expectedHeaders = [
      'ID',
      'Make',
      'Created',
      'Updated',
      'Status',
      'Actions'
    ];

    // Get actual headers
    const count = await this.headers.count();
    const actualHeaders: string[] = [];

    for (let i = 0; i < count; i++) {
      const text = (await this.headers.nth(i).textContent())?.trim();
      if (text) {
        actualHeaders.push(text);
      }
    }

    // Print headers
    console.log('\n========================================');
    console.log('MAKES TABLE HEADERS');
    console.log('========================================');
    console.log(actualHeaders);

    // Validate each header
    for (let i = 0; i < expectedHeaders.length; i++) {
      logAndValidate(
        {
          step: `Verify Header ${i + 1}`,
          expected: expectedHeaders[i],
          actual: actualHeaders[i]
        },
        testInfo
      );
    }

    // Validate total header count
    logAndValidate(
      {
        step: 'Verify Total Header Count',
        expected: expectedHeaders.length,
        actual: actualHeaders.length
      },
      testInfo
    );
  }
}