import { Page, Locator, TestInfo } from '@playwright/test';
import { BasePage } from '../../BasePage';

export class NavItemSorting extends BasePage {

  TableRows: Locator;
  ColumnHeaders: Locator;
  NavGroupLink: Locator;

  constructor(page: Page) {

    super(page);

    // Click first Nav Group to open Nav Items
    this.NavGroupLink =this.page.locator('table tbody tr:first-child td:first-child a');
      

    this.TableRows =
      page.locator('table tbody tr');

    // Ignore Actions column
    this.ColumnHeaders =
      page.locator(
        'table thead th:not(:last-child), [role="columnheader"]:not(:last-child)'
      );

    console.log('✅ NavItemSorting Loaded');
  }

  // ---------------- OPEN NAV ITEMS ----------------

  async openNavItems(): Promise<void> {

    await this.NavGroupLink.waitFor({
    state: 'visible'
  });

  await this.NavGroupLink.click();

  await this.page.waitForTimeout(3000);

  console.log("Current URL:", await this.page.url());

  const headers = await this.page.locator("table thead th").allTextContents();

  console.log("Headers:", headers);

  await this.page.locator("th", {
    hasText: "RunType"
  }).waitFor({
    state: "visible",
    timeout: 30000
  });

  }

  // ---------------- WAIT FOR TABLE ----------------

  async waitForTable(): Promise<void> {

    await this.TableRows.first().waitFor({
      state: 'visible',
      timeout: 30000
    });
  }

  // ---------------- PRINT HEADERS ----------------

  async printHeaders(): Promise<void> {

    const count =
      await this.ColumnHeaders.count();

    console.log('\n📋 AVAILABLE HEADERS');
    console.log('='.repeat(50));

    for (let i = 0; i < count; i++) {

      console.log(
        `Header ${i}: ${
          (await this.ColumnHeaders.nth(i).textContent())?.trim()
        }`
      );
    }

    console.log('='.repeat(50));
  }

  async getHeader(columnName: string): Promise<Locator> {

    const count =
      await this.ColumnHeaders.count();

    for (let i = 0; i < count; i++) {

      const header =
        this.ColumnHeaders.nth(i);

      const text =
        (await header.textContent())?.trim();

      if (
        text &&
        text.toLowerCase().includes(columnName.toLowerCase())
      ) {
        return header;
      }
    }

    throw new Error(`Column not found : ${columnName}`);
  }

  async getColumnIndex(columnName: string): Promise<number> {

    const count =
      await this.ColumnHeaders.count();

    for (let i = 0; i < count; i++) {

      const text =
        (await this.ColumnHeaders.nth(i).textContent())?.trim();

      if (
        text &&
        text.toLowerCase().includes(columnName.toLowerCase())
      ) {
        return i;
      }
    }

    throw new Error(`Column index not found : ${columnName}`);
  }

  async getColumnValues(columnName: string): Promise<string[]> {

    const values: string[] = [];

    const columnIndex =
      await this.getColumnIndex(columnName);

    const rowCount =
      await this.TableRows.count();

    for (let i = 0; i < rowCount; i++) {

      const value =
        await this.TableRows
          .nth(i)
          .locator('td')
          .nth(columnIndex)
          .textContent();

      values.push((value ?? '').trim());
    }

    return values;
  }

  private normalize(values: string[]): string[] {

    return values.filter(v =>
      v !== '' &&
      v !== '-' &&
      v !== '—'
    );
  }

  isSortedAscending(values: string[]): boolean {

    const data =
      this.normalize(values);

    const numeric =
      data.every(v => !isNaN(Number(v)));

    const sorted =
      [...data].sort((a, b) =>
        numeric
          ? Number(a) - Number(b)
          : a.localeCompare(b)
      );

    return JSON.stringify(data) === JSON.stringify(sorted);
  }

  isSortedDescending(values: string[]): boolean {

    const data =
      this.normalize(values);

    const numeric =
      data.every(v => !isNaN(Number(v)));

    const sorted =
      [...data].sort((a, b) =>
        numeric
          ? Number(b) - Number(a)
          : b.localeCompare(a)
      );

    return JSON.stringify(data) === JSON.stringify(sorted);
  }

  async validateColumnSorting(
    columnName: string,
    testInfo: TestInfo
  ) {

    try {

      await this.waitForTable();

      const header =
        await this.getHeader(columnName);

      await header.scrollIntoViewIfNeeded();

      // Ascending
      await header.click();

      await this.page.waitForTimeout(1500);

      const first =
        await this.getColumnValues(columnName);

      const firstResult =
        this.isSortedAscending(first) ||
        this.isSortedDescending(first);

      // Descending
      await header.click();

      await this.page.waitForTimeout(1500);

      const second =
        await this.getColumnValues(columnName);

      const secondResult =
        this.isSortedAscending(second) ||
        this.isSortedDescending(second);

      return {
        passed: firstResult && secondResult
      };

    } catch (error) {

      return {
        passed: false,
        error: String(error)
      };
    }
  }

}