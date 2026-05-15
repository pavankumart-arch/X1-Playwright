import {
  Page,
  Locator,
  TestInfo
} from '@playwright/test';

import { BasePage }
  from '../../BasePage';
import { logAndValidate } from '../../utils/reportUtil';

export class UserColumns extends BasePage {

  page: Page;

  headers: Locator;

  table: Locator;

  constructor(page: Page) {

    super(page);

    this.page = page;

    // ============================================
    // USERS TABLE
    // ============================================

    this.table =
      this.page.locator(
        'table:has(th:has-text("Username"))'
      );

    this.headers =
      this.table.locator(
        'thead th'
      );
  }

  // ============================================
  // VERIFY USER TABLE HEADERS
  // ============================================

  async verifyUserColumnHeaders(
    testInfo: TestInfo
  ) {

    // ============================================
    // WAIT FOR TABLE
    // ============================================

    await this.table.waitFor({
      state: 'visible',
      timeout: 10000
    });

    // ============================================
    // EXPECTED HEADERS
    // ============================================

    const expectedHeaders = [
      'ID',
      'Username',
      'Email',
      'Reseller',
      'User Type',
      'Status',
      'Actions'
    ];

    // ============================================
    // GET ACTUAL HEADERS
    // ============================================

    const count =
      await this.headers.count();

    const actualHeaders:
      string[] = [];

    for (
      let i = 0;
      i < count;
      i++
    ) {

      const text =
        (
          await this.headers
            .nth(i)
            .textContent()
        )?.trim();

      if (text) {

        // EXACT TEXT
        actualHeaders.push(text);
      }
    }

    // ============================================
    // PRINT HEADERS
    // ============================================

    console.log(
      '\n========================================'
    );

    console.log(
      'USER TABLE HEADERS'
    );

    console.log(
      '========================================'
    );

    console.log(
      actualHeaders
    );

    // ============================================
    // VALIDATE EACH HEADER
    // ============================================

    for (
      let i = 0;
      i < expectedHeaders.length;
      i++
    ) {

      logAndValidate(
        {
          step:
            `Verify Header ${i + 1}`,

          expected:
            expectedHeaders[i],

          actual:
            actualHeaders[i]
        },
        testInfo
      );
    }

    // ============================================
    // VALIDATE HEADER COUNT
    // ============================================

    logAndValidate(
      {
        step:
          'Verify Total Header Count',

        expected:
          expectedHeaders.length,

        actual:
          actualHeaders.length
      },
      testInfo
    );
  }
}