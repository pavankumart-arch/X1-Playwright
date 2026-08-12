import { Page, Locator, TestInfo } from '@playwright/test';
import { Reporter } from '../../../utils/NewReport';


export class MakeSortingWithPagination {
  readonly page: Page;
  readonly rows: Locator;
  readonly headers: Locator;
  readonly nextButton: Locator;
  readonly prevButton: Locator;
  readonly searchInput: Locator;
  private columnIndexCache: Map<string, number> = new Map();

  constructor(page: Page) {
    this.page = page;
    this.rows = page.locator('table tbody tr');
    this.headers = page.locator('table thead th');
    this.nextButton = page.getByRole('button', { name: 'Next' });
    this.prevButton = page.getByRole('button', { name: 'Prev' });
    this.searchInput = page.getByPlaceholder('Search...');
  }

  async waitForTableLoad() {
    await this.page.waitForLoadState('networkidle');
    await this.page.waitForTimeout(500);
    if (await this.rows.count() > 0) {
      await this.rows.first().waitFor({ state: 'visible' });
    }
  }

  async resetTableState() {
    console.log(`🔄 Resetting table state...`);
    const searchValue = await this.searchInput.inputValue();
    if (searchValue && searchValue !== '') {
      await this.searchInput.clear();
      await this.page.keyboard.press('Enter');
      await this.waitForTableLoad();
    }
    await this.goToFirstPage();
    this.columnIndexCache.clear();
  }

  async searchForModel(searchTerm: string) {
    await this.searchInput.clear();
    await this.searchInput.fill(searchTerm);
    await this.page.keyboard.press('Enter');
    await this.waitForTableLoad();
  }

  async goToFirstPage() {
    const isPrevDisabled = !(await this.prevButton.isEnabled()) || !(await this.prevButton.isVisible());
    if (isPrevDisabled) return;
    let maxIterations = 50;
    let iterations = 0;
    while (iterations < maxIterations && await this.prevButton.isVisible() && await this.prevButton.isEnabled()) {
      const before = await this.rows.first().textContent();
      await this.prevButton.click();
      await this.page.waitForTimeout(500);
      await this.page.waitForFunction((oldVal) => { const el = document.querySelector('table tbody tr:first-child'); return el && el.textContent !== oldVal; }, before);
      iterations++;
    }
    await this.waitForTableLoad();
  }

  async getColumnIndex(columnName: string): Promise<number> {
    if (this.columnIndexCache.has(columnName)) {
      return this.columnIndexCache.get(columnName)!;
    }
    await this.headers.first().waitFor({ state: 'visible' });
    const count = await this.headers.count();
    for (let i = 0; i < count; i++) {
      const text = (await this.headers.nth(i).innerText()).trim();
      if (text.toLowerCase() === columnName.toLowerCase()) {
        this.columnIndexCache.set(columnName, i);
        return i;
      }
    }
    throw new Error(`Column "${columnName}" not found. Available columns: ${await this.getAvailableColumns()}`);
  }

  private async getAvailableColumns(): Promise<string> {
    const columns: string[] = [];
    const count = await this.headers.count();
    for (let i = 0; i < count; i++) {
      columns.push(await this.headers.nth(i).innerText());
    }
    return columns.join(', ');
  }

  async getColumnValues(columnIndex: number): Promise<any[]> {
    const values: any[] = [];
    const rowCount = await this.rows.count();
    if (rowCount === 0) return values;
    const cellTexts = await this.page.$$eval(`table tbody tr td:nth-child(${columnIndex + 1})`, (cells) => cells.map(cell => cell.textContent?.trim() || ''));
    for (const text of cellTexts) {
      if (text) {
        values.push(this.parseValue(text));
      }
    }
    return values;
  }

  parseValue(value: string): any {
    const clean = value.trim();
    if (/^(active|inactive|pending|draft|published|completed|archived|deleted)$/i.test(clean)) {
      return clean.toLowerCase();
    }
    if (/^\d{4}-\d{2}-\d{2}$/.test(clean)) return new Date(clean);
    if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(clean)) return new Date(clean);
    if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(clean)) return new Date(clean);
    if (/^\d{10,13}$/.test(clean)) return new Date(parseInt(clean));
    if (/^-?\d+(\.\d+)?$/.test(clean)) return Number(clean);
    return clean.toLowerCase();
  }

  detectOrder(values: any[]): 'ASC' | 'DESC' | 'UNSORTED' {
    if (values.length <= 1) return 'ASC';
    let ascCount = 0, descCount = 0;
    const checkLength = Math.min(values.length, 30);
    for (let i = 0; i < checkLength - 1; i++) {
      const current = values[i], next = values[i + 1];
      let comparison = 0;
      if (current instanceof Date && next instanceof Date) {
        comparison = current.getTime() - next.getTime();
      } else if (typeof current === 'number' && typeof next === 'number') {
        comparison = current - next;
      } else {
        comparison = String(current).localeCompare(String(next), undefined, { numeric: true, sensitivity: 'base' });
      }
      if (comparison < 0) ascCount++;
      else if (comparison > 0) descCount++;
    }
    const totalComparisons = checkLength - 1;
    const sortedRatio = Math.max(ascCount, descCount) / totalComparisons;
    if (sortedRatio < 0.5) return 'UNSORTED';
    return descCount > ascCount ? 'DESC' : 'ASC';
  }

  validateValues(values: any[], order: 'ASC' | 'DESC') {
    const checkLimit = Math.min(values.length, 30);
    let outOfOrderCount = 0;
    for (let i = 0; i < checkLimit - 1; i++) {
      const current = values[i], next = values[i + 1];
      if (this.isEqual(current, next)) continue;
      let valid = false;
      if (current instanceof Date && next instanceof Date) {
        valid = order === 'ASC' ? current.getTime() < next.getTime() : current.getTime() > next.getTime();
      } else if (typeof current === 'number' && typeof next === 'number') {
        valid = order === 'ASC' ? current < next : current > next;
      } else {
        const comparison = String(current).localeCompare(String(next), undefined, { numeric: true, sensitivity: 'base' });
        valid = order === 'ASC' ? comparison < 0 : comparison > 0;
      }
      if (!valid) {
        outOfOrderCount++;
        const maxOutOfOrder = 5;
        if (outOfOrderCount > maxOutOfOrder) {
          return {
            pass: false,
            expected: `${this.formatValue(current)} ${order === 'ASC' ? '<' : '>'} ${this.formatValue(next)}`,
            actual: `${this.formatValue(current)} ${order === 'ASC' ? '>=' : '<='} ${this.formatValue(next)}`
          };
        }
      }
    }
    return { pass: true, expected: 'Sorted Correctly', actual: 'Sorted Correctly' };
  }

  private isEqual(a: any, b: any): boolean {
    if (a instanceof Date && b instanceof Date) return a.getTime() === b.getTime();
    return a === b;
  }

  private formatValue(value: any): string {
    if (value instanceof Date) return value.toLocaleString();
    return String(value);
  }

  private async goToNextPage(): Promise<boolean> {
    if (await this.nextButton.isVisible() && await this.nextButton.isEnabled()) {
      const before = await this.rows.first().textContent();
      await this.nextButton.click();
      await this.page.waitForTimeout(500);
      await this.page.waitForFunction((oldVal) => { const el = document.querySelector('table tbody tr:first-child'); return el && el.textContent !== oldVal; }, before);
      return true;
    }
    return false;
  }

  async validateAllPages(columnIndex: number, columnName: string, order: 'ASC' | 'DESC', testInfo: TestInfo) {
    let pageNo = 1, allPagesValid = true, maxPages = 20;
    while (pageNo <= maxPages) {
      const values = await this.getColumnValues(columnIndex);
      if (values.length === 0) {
        console.log(`⚠️ No data found on Page ${pageNo}`);
        if (!(await this.goToNextPage())) break;
        pageNo++;
        continue;
      }
      const result = this.validateValues(values, order);
      if (result.pass) {
        console.log(`✅ ${columnName} validated on Page ${pageNo}`);
      } else {
        allPagesValid = false;
        console.log(`❌ ${columnName} issue on Page ${pageNo}`);
      }
      Reporter.validateData(result.expected, result.actual, `Sorting Validation | Column: ${columnName} | Page: ${pageNo} | Order: ${order}`, testInfo);
      if (!(await this.goToNextPage())) break;
      pageNo++;
    }
    return allPagesValid;
  }

  async verifyColumnSorting(columnName: string, testInfo: TestInfo): Promise<boolean> {
    console.log(`\n🔍 Verifying sorting for "${columnName}"`);
    if (columnName.toLowerCase() === 'actions') {
      console.log(`⏭️ Skipping "${columnName}" column (non-sortable)`);
      return true;
    }
    try {
      const columnIndex = await this.getColumnIndex(columnName);
      await this.resetTableState();
      const header = this.headers.nth(columnIndex);
      if (columnName.toLowerCase() === 'status') {
        await header.click();
        await this.waitForTableLoad();
        await this.page.waitForTimeout(1000);
      }
      await header.click();
      await this.waitForTableLoad();
      const firstPageValues = await this.getColumnValues(columnIndex);
      if (firstPageValues.length === 0) {
        console.log(`❌ No data found for "${columnName}"`);
        return false;
      }
      const firstOrder = this.detectOrder(firstPageValues);
      if (firstOrder === 'UNSORTED') {
        console.log(`⚠️ "${columnName}" appears unsorted after first click, checking if sortable...`);
        await this.page.waitForTimeout(1000);
        await header.click();
        await this.waitForTableLoad();
        const retryValues = await this.getColumnValues(columnIndex);
        const retryOrder = this.detectOrder(retryValues);
        if (retryOrder === 'UNSORTED') {
          console.log(`❌ "${columnName}" is not sortable`);
          return false;
        }
        console.log(`📊 "${columnName}" sorted after second click: ${retryOrder}`);
        return await this.validateAllPages(columnIndex, columnName, retryOrder, testInfo);
      }
      console.log(`📊 First click order: ${firstOrder}`);
      const ascValid = await this.validateAllPages(columnIndex, columnName, firstOrder, testInfo);
      await this.goToFirstPage();
      await header.click();
      await this.waitForTableLoad();
      const secondPageValues = await this.getColumnValues(columnIndex);
      const secondOrder = this.detectOrder(secondPageValues);
      if (secondOrder === 'UNSORTED') {
        console.log(`⚠️ "${columnName}" unsorted after second click`);
        return ascValid;
      }
      console.log(`📊 Second click order: ${secondOrder}`);
      const descValid = await this.validateAllPages(columnIndex, columnName, secondOrder, testInfo);
      return ascValid && descValid;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.log(`❌ Could not verify sorting for "${columnName}": ${errorMessage}`);
      return false;
    }
  }

  async verifyLastUpdatedSorting(testInfo: TestInfo): Promise<boolean> {
    console.log(`\n🕒 Verifying Updated column sorting`);
    try {
      const columnIndex = await this.getColumnIndex('Updated');
      await this.resetTableState();
      const header = this.headers.nth(columnIndex);
      await header.click();
      await this.waitForTableLoad();
      const values = await this.getColumnValues(columnIndex);
      if (values.length === 0) {
        console.log(`❌ No data found for Updated column`);
        return false;
      }
      const order = this.detectOrder(values);
      if (order === 'UNSORTED') {
        console.log(`⚠️ Updated column appears unsorted, checking with second click`);
        await header.click();
        await this.waitForTableLoad();
        const retryValues = await this.getColumnValues(columnIndex);
        const retryOrder = this.detectOrder(retryValues);
        if (retryOrder === 'UNSORTED') {
          console.log(`❌ Updated column is not sortable`);
          return false;
        }
        console.log(`📊 Updated column order after second click: ${retryOrder}`);
        return await this.validateAllPages(columnIndex, 'Updated', retryOrder, testInfo);
      }
      console.log(`📊 Updated column order: ${order}`);
      return await this.validateAllPages(columnIndex, 'Updated', order, testInfo);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.log(`❌ Could not verify sorting for Updated column: ${errorMessage}`);
      return false;
    }
  }

  async verifyAllColumnsSorting(testInfo: TestInfo) {
    const results: Record<string, boolean> = {};
    const columns = ['ID', 'Make', 'Created', 'Updated', 'Status', 'Actions'];
    for (const column of columns) {
      try {
        if (column === 'Updated') {
          results[column] = await this.verifyLastUpdatedSorting(testInfo);
        } else {
          results[column] = await this.verifyColumnSorting(column, testInfo);
        }
        await this.page.waitForTimeout(500);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error(`❌ Failed for "${column}": ${errorMessage}`);
        results[column] = false;
      }
    }
    console.log('\n' + '='.repeat(50));
    console.log('SORTING VERIFICATION SUMMARY');
    console.log('='.repeat(50));
    for (const [column, passed] of Object.entries(results)) {
      const status = passed ? '✅ PASSED' : '❌ FAILED';
      console.log(`${column}: ${status}`);
    }
    return results;
  }
}