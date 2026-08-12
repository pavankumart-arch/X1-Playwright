import { Page, Locator, expect } from '@playwright/test';

export class ResellerCount {
  readonly page: Page;
  readonly totalCountLabel: Locator;
  readonly tableRows: Locator;

  constructor(page: Page) {
    this.page = page;

    // 🔹 " Records"
    this.totalCountLabel = page.locator('text=/\\d+ records/');

    // 🔹 Table rows
    this.tableRows = page.locator('tbody tr');
  }

  // 🔹 Get total count from UI
  async getTotalCountFromUI(): Promise<number> {
    const text = await this.totalCountLabel.textContent();
    return Number(text?.match(/\d+/)?.[0]);
  }

  // 🔹 Count rows (handles both single & multiple pages)
  async getTotalTableCount(): Promise<number> {
    let total = 0;

    // 🔹 Pagination buttons (1,2,3...)
    const pageButtons = this.page.locator('button').filter({
      hasText: /^[0-9]+$/,
    });

    const pageCount = await pageButtons.count();

    // ✅ CASE 1: No pagination → Single page
    if (pageCount === 0) {
      await this.tableRows.first().waitFor();
      total = await this.tableRows.count();
      console.log('Single page rows:', total);
      return total;
    }

    // ✅ CASE 2: Multiple pages
    for (let i = 1; i <= pageCount; i++) {
      const currentPageBtn = this.page.locator('button').filter({
        hasText: new RegExp(`^${i}$`)
      });

      await currentPageBtn.click();

      await this.tableRows.first().waitFor();

      const rows = await this.tableRows.count();
      console.log(`Page ${i} rows:`, rows);

      total += rows;
    }

    return total;
  }

  // 🔹 Final validation
  async verifyRecordCount() {
    const uiCount = await this.getTotalCountFromUI();
    const tableCount = await this.getTotalTableCount();

    console.log('UI Count:', uiCount);
    console.log('Table Count:', tableCount);

    expect(tableCount).toBe(uiCount);
  }
}