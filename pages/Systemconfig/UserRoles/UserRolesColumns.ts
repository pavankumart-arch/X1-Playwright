import { Page, Locator } from '@playwright/test';

export class UserRoleColumns {

  page: Page;
  headers: Locator;
  table: Locator;

  constructor(page: Page) {
    this.page = page;

    // Default table locator
    this.table = this.page.locator('table').first();

    // Headers from selected table
    this.headers = this.table.locator('thead th');
  }

  // =========================================
  // VERIFY USER ROLE COLUMNS
  // =========================================
  async verifyUserRoleColumns() {

    await this.page.waitForLoadState('networkidle');

    console.log('\n========== DEBUG INFO ==========');

    console.log('Current URL:', this.page.url());

    const tableCount = await this.page.locator('table').count();

    console.log('Total Tables Found:', tableCount);

    // Print headers from every table
    for (let i = 0; i < tableCount; i++) {
      const headers = await this.page
        .locator('table')
        .nth(i)
        .locator('thead th')
        .allTextContents();

      console.log(`Table ${i} Headers:`, headers);
    }

    console.log('================================\n');

    // Wait for first table
    await this.table.waitFor({ state: 'visible' });

    const expectedColumns = [
      'ID',
      'Role Name',
      'Created',
      'Updated',
      'Status',
      'Actions'
    ];

    const actualHeaders = (
      await this.headers.allTextContents()
    )
      .map(header => header.replace(/\s+/g, ' ').trim())
      .filter(header => header !== '');

    return {
      expectedColumns,
      actualHeaders
    };
  }
}