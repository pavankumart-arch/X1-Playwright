import { Page, Locator, TestInfo } from '@playwright/test';
import { Reporter } from '../../../utils/NewReport';
import { ModelSearch } from './SearchModel';

export class UserSortingWithPagination {
  readonly page: Page;
  readonly rows: Locator;
  readonly headers: Locator;
  readonly nextButton: Locator;
  readonly prevButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.rows = page.locator('table tbody tr');
    this.headers = page.locator('table thead th');
    this.nextButton = page.getByRole('button', { name: 'Next' });
    this.prevButton = page.getByRole('button', { name: 'Prev' });
  }

  async waitForTableLoad() {
    await this.page.waitForLoadState('networkidle');
    await this.rows.first().waitFor({ state: 'visible' });
  }

  async goToFirstPage() {
    while (await this.prevButton.isVisible() && await this.prevButton.isEnabled()) {
      const before = await this.rows.first().textContent();
      await this.prevButton.click();
      await this.page.waitForFunction((oldVal) => { const el = document.querySelector('table tbody tr:first-child'); return (el && el.textContent !== oldVal); }, before);
    }
  }

  async getColumnIndex(columnName: string): Promise<number> {
    const count = await this.headers.count();
    for (let i = 0; i < count; i++) {
      const text = (await this.headers.nth(i).innerText()).trim();
      if (text.toLowerCase().includes(columnName.toLowerCase())) {
        return i;
      }
    }
    throw new Error(`Column "${columnName}" not found`);
  }

  async getColumnValues(columnIndex: number): Promise<any[]> {
    const values: any[] = [];
    const count = await this.rows.count();
    for (let i = 0; i < count; i++) {
      const value = (await this.rows.nth(i).locator('td').nth(columnIndex).textContent())?.trim();
      if (value) {
        values.push(this.parseValue(value));
      }
    }
    return values;
  }

  parseValue(value: string): any {
    const clean = value.trim();
    if (/^-?\d+(\.\d+)?$/.test(clean)) {
      return Number(clean);
    }
    if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(clean)) {
      return new Date(clean);
    }
    return clean.toLowerCase();
  }

  detectOrder(values: any[]): 'ASC' | 'DESC' {
    if (values.length <= 1) return 'ASC';
    let ascCount = 0;
    let descCount = 0;
    for (let i = 0; i < values.length - 1; i++) {
      const current = values[i];
      const next = values[i + 1];
      if (current === next) continue;
      if (typeof current === 'number' && typeof next === 'number') {
        if (current < next) {
          ascCount++;
        } else if (current > next) {
          descCount++;
        }
      } else {
        const comparison = String(current).localeCompare(String(next), undefined, { numeric: true, sensitivity: 'base' });
        if (comparison < 0) {
          ascCount++;
        } else if (comparison > 0) {
          descCount++;
        }
      }
    }
    if (descCount > ascCount) return 'DESC';
    return 'ASC';
  }

  validateValues(values: any[], order: 'ASC' | 'DESC') {
    for (let i = 0; i < values.length - 1; i++) {
      const current = values[i];
      const next = values[i + 1];
      if (current === next) continue;
      let valid = false;
      if (typeof current === 'number' && typeof next === 'number') {
        valid = order === 'ASC' ? current < next : current > next;
      } else {
        const comparison = String(current).localeCompare(String(next), undefined, { numeric: true, sensitivity: 'base' });
        valid = order === 'ASC' ? comparison < 0 : comparison > 0;
      }
      if (!valid) {
        return { pass: false, expected: `${current} ${order === 'ASC' ? '<' : '>'} ${next}`, actual: `${current} ${order === 'ASC' ? '>=' : '<='} ${next}` };
      }
    }
    return { pass: true, expected: 'Sorted Correctly', actual: 'Sorted Correctly' };
  }

  async validateAllPages(columnIndex: number, columnName: string, order: 'ASC' | 'DESC', testInfo: TestInfo) {
    let pageNo = 1;
    while (true) {
      const values = await this.getColumnValues(columnIndex);
      const result = this.validateValues(values, order);
      if (result.pass) {
        console.log(`✅ ${columnName} column sorting validated successfully on Page ${pageNo} (${order})`);
      } else {
        console.log(`❌ Sorting issue in ${columnName} column on Page ${pageNo} (${order}) | Expected: ${result.expected} | Actual: ${result.actual}`);
      }
      Reporter.validateData(result.expected, result.actual, `Sorting Validation | Column: ${columnName} | Page: ${pageNo} | Order: ${order}`, testInfo);
      if (await this.nextButton.isVisible() && await this.nextButton.isEnabled()) {
        const before = await this.rows.first().textContent();
        await this.nextButton.click();
        await this.page.waitForFunction((oldVal) => { const el = document.querySelector('table tbody tr:first-child'); return (el && el.textContent !== oldVal); }, before);
        pageNo++;
      } else {
        break;
      }
    }
  }

  async verifyColumnSorting(columnName: string, testInfo: TestInfo) {
    console.log(`🔍 Verifying sorting for ${columnName} column`);
    const columnIndex = await this.getColumnIndex(columnName);
    const header = this.headers.nth(columnIndex);
    await this.goToFirstPage();
    await header.click();
    await this.waitForTableLoad();
    const firstPageValues = await this.getColumnValues(columnIndex);
    const firstOrder = this.detectOrder(firstPageValues);
    console.log(`📊 First click order detected: ${firstOrder}`);
    await this.validateAllPages(columnIndex, columnName, firstOrder, testInfo);
    await this.goToFirstPage();
    await header.click();
    await this.waitForTableLoad();
    const secondPageValues = await this.getColumnValues(columnIndex);
    const secondOrder = this.detectOrder(secondPageValues);
    console.log(`📊 Second click order detected: ${secondOrder}`);
    if (firstOrder === secondOrder && firstPageValues.length > 1) {
      console.warn(`⚠️ Warning: Second click didn't change sort order for ${columnName}`);
    }
    await this.validateAllPages(columnIndex, columnName, secondOrder, testInfo);
  }

  async verifyAllColumnsSorting(testInfo: TestInfo) {

    const columns = ['ID', 'Model', 'Created', 'Status'];
    for (const column of columns) {
      await this.verifyColumnSorting(column, testInfo);
    }
  }
}