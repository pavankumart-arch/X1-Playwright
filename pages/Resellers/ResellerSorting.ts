import { Locator, Page, TestInfo } from '@playwright/test';
import { BasePage } from '../../pages/BasePage';
import { logAndValidate } from '../../utils/reportUtil';

export class TableSorting extends BasePage {

  tableRows: Locator;
  tableHeaders: Locator;

  constructor(page: Page) {
    super(page);
    this.tableRows = page.locator('table tbody tr');
    this.tableHeaders = page.locator('table thead th');
  }

  async validateColumnSorting(columnName: string, testInfo: TestInfo): Promise<boolean> {

    const columnIndex = await this.getColumnIndex(columnName);
    const header = this.tableHeaders.nth(columnIndex);

    // ASC
    await header.click();
    await this.page.waitForTimeout(800);
    await this.goToFirstPage();

    const ascResult = await this.validateAllPages(columnIndex, 'ASC', testInfo);

    logAndValidate({
      step: `🔼 ASCENDING ORDER (${columnName})`,
      expected: 'PASS',
      actual: ascResult ? 'PASS' : 'FAIL'
    }, testInfo);

    // DESC
    await header.click();
    await this.page.waitForTimeout(800);
    await this.goToFirstPage();

    const descResult = await this.validateAllPages(columnIndex, 'DESC', testInfo);

    logAndValidate({
      step: `🔽 DESCENDING ORDER (${columnName})`,
      expected: 'PASS',
      actual: descResult ? 'PASS' : 'FAIL'
    }, testInfo);

    return ascResult && descResult;
  }

  private async validateAllPages(
    columnIndex: number,
    order: 'ASC' | 'DESC',
    testInfo: TestInfo
  ): Promise<boolean> {

    let pageNumber = 1;
    let isAllPass = true;

    while (true) {

      const values = await this.getColumnValues(columnIndex);
      const pageCheck = this.checkSorting(values, order);

      if (pageCheck.expected !== pageCheck.actual) {
        isAllPass = false;
      }

      logAndValidate({
        step: `Page ${pageNumber}`,
        expected: pageCheck.expected,
        actual: pageCheck.actual
      }, testInfo);

      const nextBtn = this.page.locator('button:has-text("Next")').last();

      if (!(await nextBtn.isVisible()) || !(await nextBtn.isEnabled())) break;

      await nextBtn.click();
      await this.page.waitForTimeout(800);

      pageNumber++;
      if (pageNumber > 50) break;
    }

    return isAllPass;
  }

  private async getColumnValues(columnIndex: number): Promise<any[]> {

    const values: any[] = [];
    const count = await this.tableRows.count();

    for (let i = 0; i < count; i++) {

      const text = (await this.tableRows
        .nth(i)
        .locator('td')
        .nth(columnIndex)
        .innerText()).trim();

      values.push(this.parseValue(text));
    }

    return values;
  }

  private parseValue(value: string): any {

    if (!isNaN(Number(value))) return Number(value);

    const date = new Date(value);
    if (!isNaN(date.getTime())) return date;

    return value.toLowerCase();
  }

  private checkSorting(values: any[], order: 'ASC' | 'DESC') {

    for (let i = 0; i < values.length - 1; i++) {

      const a = values[i];
      const b = values[i + 1];

      let isValid;

      if (a instanceof Date && b instanceof Date) {
        isValid = order === 'ASC'
          ? a.getTime() <= b.getTime()
          : a.getTime() >= b.getTime();
      } else {
        isValid = order === 'ASC'
          ? a <= b
          : a >= b;
      }

      if (!isValid) {
        return {
          expected: `${a} ${order === 'ASC' ? '<=' : '>='} ${b}`,
          actual: `${a} ${order === 'ASC' ? '>' : '<'} ${b}`
        };
      }
    }

    return { expected: 'Sorted', actual: 'Sorted' };
  }

  private async getColumnIndex(columnName: string) {

    const count = await this.tableHeaders.count();

    for (let i = 0; i < count; i++) {
      const text = (await this.tableHeaders.nth(i).innerText()).trim();
      if (text.toLowerCase().includes(columnName.toLowerCase())) return i;
    }

    throw new Error(`Column not found: ${columnName}`);
  }

  private async goToFirstPage() {

    const prevBtn = this.page.locator('button:has-text("Prev")').first();

    while (await prevBtn.isVisible() && await prevBtn.isEnabled()) {
      await prevBtn.click();
      await this.page.waitForTimeout(500);
    }
  }
}