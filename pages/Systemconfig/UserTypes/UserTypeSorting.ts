import { Page, Locator, TestInfo } from '@playwright/test';
import { BasePage } from '../../BasePage';

export class UserTypeSorting extends BasePage {

  TableRows: Locator;
  ColumnHeaders: Locator;

  constructor(page: Page) {

    super(page);

    this.TableRows = page.locator('table tbody tr');

    this.ColumnHeaders = page.locator(
      'table thead th, [role="columnheader"]'
    );

    console.log('✅ UserTypeSorting Loaded');
  }

  // ---------------- WAIT FOR TABLE ----------------

  async waitForTable(): Promise<void> {

    await this.TableRows.first().waitFor({
      state: 'visible',
      timeout: 30000
    });
  }

  // ---------------- HEADERS DEBUG ----------------

  async printHeaders(): Promise<void> {

    const count = await this.ColumnHeaders.count();

    console.log(`\n📋 AVAILABLE HEADERS`);
    console.log(`${'='.repeat(50)}`);

    for (let i = 0; i < count; i++) {

      const text = (await this.ColumnHeaders.nth(i).textContent())?.trim();

      console.log(`Header ${i}: ${text}`);
    }

    console.log(`${'='.repeat(50)}`);
  }

  // ---------------- GET HEADER ----------------

  async getHeader(columnName: string): Promise<Locator> {

    const count = await this.ColumnHeaders.count();

    for (let i = 0; i < count; i++) {

      const header = this.ColumnHeaders.nth(i);

      const text = (await header.textContent())?.trim();

      if (
        text &&
        text.toLowerCase().includes(columnName.toLowerCase())
      ) {
        return header;
      }
    }

    throw new Error(`Column header not found: ${columnName}`);
  }

  // ---------------- GET COLUMN INDEX ----------------

  async getColumnIndex(columnName: string): Promise<number> {

    const count = await this.ColumnHeaders.count();

    for (let i = 0; i < count; i++) {

      const text = (await this.ColumnHeaders.nth(i).textContent())?.trim();

      if (
        text &&
        text.toLowerCase().includes(columnName.toLowerCase())
      ) {
        return i;
      }
    }

    throw new Error(`Column index not found: ${columnName}`);
  }

  // ---------------- GET VALUES ----------------

  async getColumnValues(columnName: string): Promise<string[]> {

    const values: string[] = [];

    const columnIndex = await this.getColumnIndex(columnName);

    const rowCount = await this.TableRows.count();

    for (let i = 0; i < rowCount; i++) {

      const value = await this.TableRows
        .nth(i)
        .locator('td')
        .nth(columnIndex)
        .textContent();

      values.push((value ?? '').trim());
    }

    return values;
  }

  // ---------------- SMART SORT CHECK ----------------

  private normalize(values: string[]): string[] {
    return values.filter(v => v !== '');
  }

  isSortedAscending(values: string[]): boolean {

    const data = this.normalize(values);

    const isNumeric = data.every(v => !isNaN(Number(v)));

    const sorted = [...data].sort((a, b) => {

      if (isNumeric) {
        return Number(a) - Number(b);
      }

      return a.localeCompare(b);
    });

    return JSON.stringify(data) === JSON.stringify(sorted);
  }

  isSortedDescending(values: string[]): boolean {

    const data = this.normalize(values);

    const isNumeric = data.every(v => !isNaN(Number(v)));

    const sorted = [...data].sort((a, b) => {

      if (isNumeric) {
        return Number(b) - Number(a);
      }

      return b.localeCompare(a);
    });

    return JSON.stringify(data) === JSON.stringify(sorted);
  }

  // ---------------- VALIDATE SORTING (FIXED FLOW) ----------------

  async validateColumnSorting(
    columnName: string,
    testInfo: TestInfo
  ): Promise<{ passed: boolean; error?: string }> {

    try {

      console.log(`\n============================================================`);
      console.log(`Testing Column: ${columnName}`);
      console.log(`============================================================`);

      await this.waitForTable();

      await this.printHeaders();

      const header = await this.getHeader(columnName);

      await header.scrollIntoViewIfNeeded();

      // =========================
      // CLICK 1 (UI MAY START DESC)
      // =========================
      console.log(`🔼 First Click`);

      await header.click();
      await this.page.waitForTimeout(2000);

      const firstValues = await this.getColumnValues(columnName);

      console.log(`First Click Values:`, firstValues);

      const firstAsc = this.isSortedAscending(firstValues);
      const firstDesc = this.isSortedDescending(firstValues);

      // =========================
      // CLICK 2 (TOGGLE)
      // =========================
      console.log(`🔽 Second Click`);

      await header.click();
      await this.page.waitForTimeout(2000);

      const secondValues = await this.getColumnValues(columnName);

      console.log(`Second Click Values:`, secondValues);

      const secondAsc = this.isSortedAscending(secondValues);
      const secondDesc = this.isSortedDescending(secondValues);

      // =========================
      // FINAL DECISION (NO ASSUMPTION)
      // =========================

      const passed =
        (firstAsc || firstDesc) &&
        (secondAsc || secondDesc);

      return {
        passed,
        error: passed
          ? undefined
          : `${columnName} sorting failed`
      };

    } catch (error) {

      console.log(`❌ Sorting Error:`, error);

      return {
        passed: false,
        error: error instanceof Error
          ? error.message
          : String(error)
      };
    }
  }
}