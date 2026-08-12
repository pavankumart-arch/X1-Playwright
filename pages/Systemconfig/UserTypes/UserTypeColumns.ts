
import { Page, Locator } from '@playwright/test';

export class UserTypeColumns {

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
  // ✅ VERIFY USER TYPE COLUMNS
  // =========================================
  async verifyUserTypeColumns() {

    // Wait for table visibility
    await this.table.waitFor({ state: 'visible' });

    await this.page.waitForLoadState('networkidle');

    await this.headers.first().waitFor();

    // Expected Columns
    const expectedColumns = [
      'ID',
      'Name',
      'Created',
      'Last Updated',
      'Status',
      'Actions'
    ];

    // Get Actual Headers
    const actualHeaders = (
      await this.headers.allTextContents()
    ).map(header =>
      header.replace(/\s+/g, ' ').trim()
    );

    return {
      expectedColumns,
      actualHeaders
    };
  }
}

