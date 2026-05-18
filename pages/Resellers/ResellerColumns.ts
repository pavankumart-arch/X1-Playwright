import { Page, Locator, expect, TestInfo } from '@playwright/test';

export class ResellerColumns {

  page: Page;
  table: Locator;
  headers: Locator;

  constructor(page: Page) {

    this.page = page;

    this.table = this.page.locator('table');

    this.headers = this.page.locator('table thead th');
  }

  // ============================================
  // VERIFY EXACT TABLE HEADERS
  // ============================================

  async verifyHeaders(
    expectedHeaders: string[],
    testInfo: TestInfo
  ): Promise<void> {

    await this.table.waitFor({
      state: 'visible',
      timeout: 10000
    });

    const count = await this.headers.count();

    const actualHeaders: string[] = [];

    for (let i = 0; i < count; i++) {

      const headerText =
        (await this.headers.nth(i).innerText())?.trim();

      if (headerText) {

        actualHeaders.push(headerText);
      }
    }

    // ============================================
    // COLUMN VALIDATION REPORT
    // ============================================

    for (let i = 0; i < expectedHeaders.length; i++) {

      const expected = expectedHeaders[i];

      const actual = actualHeaders[i] || 'MISSING';

      const status =
        expected === actual
          ? 'PASSED'
          : 'FAILED';

      testInfo.annotations.push({
        type: `COLUMN ${i + 1}`,

        description:
`
========================================
STEP     : Verify Column "${expected}"

EXPECTED : ${expected}

ACTUAL   : ${actual}

STATUS   : ${status}
========================================
`
      });

      console.log(`
========================================
STEP     : Verify Column "${expected}"

EXPECTED : ${expected}

ACTUAL   : ${actual}

STATUS   : ${status}
========================================
`);

      expect.soft(actual).toBe(expected);
    }
  }
}