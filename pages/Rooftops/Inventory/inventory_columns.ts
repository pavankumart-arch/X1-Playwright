import {
  Page,
  Locator,
  TestInfo,
  expect
} from '@playwright/test';

import { logAndValidate } from '../../../utils/reportUtil';

export class InventoryColumns {

  page: Page;
  table: Locator;
  headers: Locator;
  paginationSelect: Locator;

  constructor(page: Page) {

    this.page = page;

    this.table =
      this.page.locator('table');

    this.headers =
      this.page.locator('table thead th');

    this.paginationSelect =
      this.page.locator('select');
  }

  // =====================================
  // VERIFY INVENTORY COLUMN HEADERS
  // =====================================

  async verifyRooftopColumns(
    testInfo: TestInfo
  ): Promise<void> {

    // =====================================
    // WAIT FOR TABLE
    // =====================================

    await this.table.waitFor({
      state: 'visible'
    });

    await this.page.waitForLoadState(
      'networkidle'
    );

    await this.headers.first().waitFor({
      state: 'visible'
    });

    // =====================================
    // EXPECTED COLUMNS
    // =====================================

    const expectedColumns = [
      'Photos',
      'Added',
      'Updated',
      'In Stock',
      'VIN',
      'Year',
      'Make',
      'Model',
      'Trim',
      'Stock ID',
      'Status',
      'Type',
      'Unpublished'
    ];

    // =====================================
    // ACTUAL COLUMNS
    // =====================================

    const actualHeaders =
      (await this.headers.allTextContents())
        .map(header =>
          header
            .replace(/\s+/g, ' ')
            .trim()
        )
        .filter(header =>
          header.length > 0
        );

    // =====================================
    // COLUMN VALIDATION
    // =====================================

    for (
      let i = 0;
      i < expectedColumns.length;
      i++
    ) {

      const expected =
        expectedColumns[i];

      const actual =
        actualHeaders[i] ?? 'MISSING';

      // =====================================
      // PLAYWRIGHT REPORT
      // =====================================

      logAndValidate(
        {
          step: `Column ${i + 1}: ${expected}`,
          expected: expected,
          actual: actual
        },
        testInfo
      );
    }

    // =====================================
    // SUMMARY
    // =====================================

    logAndValidate(
      {
        step:
          'SUMMARY - Inventory Column Headings',
        expected:
          expectedColumns.join(', '),
        actual:
          actualHeaders.join(', ')
      },
      testInfo
    );

    // =====================================
    // CONSOLE SUMMARY
    // =====================================

    const allMatch =
      JSON.stringify(expectedColumns) ===
      JSON.stringify(actualHeaders);

    console.log('\n');
    console.log(
      '================================================================================'
    );

    console.log(
      'SUMMARY - Inventory Column Headings'
    );

    console.log(
      '================================================================================'
    );

    console.log(
      `EXPECTED: ${expectedColumns.join(', ')}`
    );

    console.log(
      `ACTUAL  : ${actualHeaders.join(', ')}`
    );

    console.log(
      `STATUS  : ${
        allMatch
          ? 'PASS ✅'
          : 'FAIL ❌'
      }`
    );

    console.log(
      '================================================================================'
    );

    // =====================================
    // ASSERTION
    // =====================================

    expect(
      actualHeaders,
      'Column headers do not match expected'
    ).toEqual(
      expectedColumns
    );
  }
}