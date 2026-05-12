import {
  Page,
  Locator
} from '@playwright/test';

export class ResellerColumns {

  page: Page;

  headers: Locator;

  table: Locator;

  constructor(page: Page) {

    this.page = page;

    this.table =
      this.page.locator(
        'table'
      );

    this.headers =
      this.page.locator(
        'table thead th'
      );
  }

  // ============================================
  // GET ACTUAL TABLE HEADERS
  // ============================================

  async getActualHeaders(): Promise<string[]> {

    await this.table.waitFor({
      state: 'visible',
      timeout: 10000
    });

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

        actualHeaders.push(
          text.toUpperCase()
        );
      }
    }

    console.log(
      '\n========================================'
    );

    console.log(
      'ACTUAL TABLE HEADERS'
    );

    console.log(
      '========================================'
    );

    console.log(
      actualHeaders
    );

    return actualHeaders;
  }
}