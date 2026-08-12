import { BasePage } from "../../../BasePage";
import {
  Page,
  Locator,
  TestInfo,
  expect
} from '@playwright/test';
import { logAndValidate } from '../../../utils/reportUtil';

export class YearColumns extends BasePage {

  page: Page;
  headers: Locator;
  table: Locator;

  constructor(page: Page) {
    super(page);
    this.page = page;

    // ============================================
    // TRIMS TABLE – uses "Trim Name" as unique column text
    // ============================================
    this.table = this.page.locator(
      'table:has(th:has-text("Year"))'
    );

    this.headers = this.table.locator('thead th');
  }

  // ============================================
  // VERIFY TRIMS TABLE HEADERS
  // ============================================
  async verifyTrimColumnHeaders(testInfo: TestInfo) {

    await this.table.waitFor({
      state: 'visible',
      timeout: 10000
    });

    const expectedHeaders = [
      'ID',
      'Year',
      'Created',
      'Updated',
      'Status',
      'Actions'
    ];

    const actualHeaders = await this.headers.allInnerTexts();

    const cleanedHeaders = actualHeaders.map(header =>
      header.replace(/\s+/g, ' ').trim()
    );

    console.log('TRIMS TABLE HEADERS:', cleanedHeaders);

    // ============================================
    // VERIFY HEADER COUNT
    // ============================================
    logAndValidate(
      {
        step: 'Verify Total Header Count',
        expected: expectedHeaders.length,
        actual: cleanedHeaders.length
      },
      testInfo
    );

    // ============================================
    // VERIFY EACH HEADER
    // ============================================
    for (let i = 0; i < expectedHeaders.length; i++) {

      logAndValidate(
        {
          step: `Verify Header: ${expectedHeaders[i]}`,
          expected: expectedHeaders[i],
          actual: cleanedHeaders[i]
        },
        testInfo
      );
    }

    expect(cleanedHeaders).toEqual(expectedHeaders);
  }
}