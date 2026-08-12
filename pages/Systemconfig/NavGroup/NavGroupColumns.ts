
import { Page, Locator } from '@playwright/test';

export class NavGroupColumns {

  page: Page;
  headers: Locator;
  table: Locator;

  constructor(page: Page) {

    this.page = page;

    // Table Locator
    this.table = this.page.locator('table');

    // Table Headers
    this.headers = this.page.locator('table thead th');
  }

  // =========================================
  // ✅ VERIFY NAV GROUP COLUMNS
  // =========================================

  async verifyNavGroupColumns() {

    // Wait for table visibility
    await this.table.waitFor({
      state: 'visible'
    });

    await this.page.waitForLoadState(
      'networkidle'
    );

    await this.headers.first().waitFor();

    // Expected Columns
    const expectedColumns = [
      'Label',
      'Icon',
      'Level',
      'Order',
      'Depth',
      'Sticky',
      'Context Only',
      'Active',
      'Actions'
    ];

    // Actual Headers
    const actualHeaders = (
      await this.headers.allTextContents()
    ).map(header =>
      header
        .replace(/\s+/g, ' ')
        .trim()
    );

    return {
      expectedColumns,
      actualHeaders
    };
  }
}

