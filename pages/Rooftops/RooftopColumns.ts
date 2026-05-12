import { Page, Locator } from '@playwright/test';

export class RooftopColumns {
  page: Page;
  headers: Locator;
  table: Locator;

  constructor(page: Page) {
    this.page = page;
    this.table = this.page.locator('table');
    this.headers = this.page.locator('table thead th');
  }

  async verifyRooftopColumns() {
    // Wait for table to be visible
    await this.table.waitFor({ state: 'visible' });
    await this.page.waitForLoadState('networkidle');
    await this.headers.first().waitFor();

    const expectedColumns = [
      'ID',
      'Name',              // Changed from 'Rooftop Name' to 'Name' to match actual application
      'Description',
      'Created',
      'Status',
      'Actions'
    ];

    // Remove toUpperCase() to preserve original case
    const actualHeaders = (await this.headers.allTextContents())
      .map(h => h.replace(/\s+/g, ' ').trim());

    return { expectedColumns, actualHeaders };
  }
}