import { Page, Locator } from '@playwright/test';

export class NavItemColumns {

  page: Page;
  table: Locator;
  headers: Locator;
  navGroupLink: Locator;

  constructor(page: Page) {

    this.page = page;

    // Nav Group link (opens Nav Item list)
    this.navGroupLink = this.page.locator('table tbody tr:first-child td:first-child a');

    // Nav Item Table
    this.table = this.page.locator('table');

    // Table Headers
    this.headers = this.page.locator('table thead th');
  }

  // =========================================
  // OPEN NAV ITEM LIST
  // =========================================

  async openNavItems() {

    await this.navGroupLink.waitFor({
      state: 'visible'
    });

    await this.navGroupLink.click();

    await this.page.locator('th', {
    hasText: 'RunType'
  }).waitFor({
    state: 'visible',
    timeout: 30000
  });

}

  // =========================================
  // VERIFY NAV ITEM COLUMNS
  // =========================================

  async verifyNavItemColumns() {

    await this.table.waitFor({
      state: 'visible'
    });

    await this.headers.first().waitFor();

    const expectedColumns = [
      'Label',
      'RunType (art_id)',
      'Level',
      'Order',
      'Active',
      'Actions'
    ];

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