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

    try {

      const columnIndex = await this.getColumnIndex(columnName);

      const header = this.tableHeaders.nth(columnIndex);

      // ASCENDING

      await header.click();

      await this.page.waitForTimeout(2000);

      await this.waitForTableLoad();

      await this.goToFirstPage();

      const ascResult = await this.validateAllPages(columnIndex, 'ASC', testInfo);

      logAndValidate({
        step: `🔼 ASCENDING ORDER (${columnName})`,
        expected: 'PASS',
        actual: ascResult ? 'PASS' : 'FAIL'
      }, testInfo);

      // DESCENDING

      await header.click();

      await this.page.waitForTimeout(2000);

      await this.waitForTableLoad();

      await this.goToFirstPage();

      const descResult = await this.validateAllPages(columnIndex, 'DESC', testInfo);

      logAndValidate({
        step: `🔽 DESCENDING ORDER (${columnName})`,
        expected: 'PASS',
        actual: descResult ? 'PASS' : 'FAIL'
      }, testInfo);

      return ascResult && descResult;

    } catch (error: any) {

      console.log(`
========================================
SORTING VALIDATION FAILED
COLUMN : ${columnName}
ERROR  : ${error.message}
========================================
`);

      return false;
    }
  }

  private async validateAllPages(columnIndex: number, order: 'ASC' | 'DESC', testInfo: TestInfo): Promise<boolean> {

    let pageNumber = 1;

    let isAllPass = true;

    const allValues: any[] = [];

    try {

      while (true) {

        const values = await this.getColumnValues(columnIndex);

        console.log(`Page ${pageNumber} Values =>`, values);

        allValues.push(...values);

        const nextBtn = this.page.locator('button:has-text("Next")').last();

        const isDisabled = !(await nextBtn.isVisible()) || !(await nextBtn.isEnabled());

        if (isDisabled) break;

        await nextBtn.click();

        await this.page.waitForTimeout(2000);

        await this.waitForTableLoad();

        pageNumber++;

        if (pageNumber > 100) break;
      }

      const finalResult = this.checkSorting(allValues, order);

      if (finalResult.expected !== finalResult.actual) {
        isAllPass = false;
      }

      logAndValidate({
        step: `Full Table Validation (${order})`,
        expected: finalResult.expected,
        actual: finalResult.actual
      }, testInfo);

    } catch (error: any) {

      console.log(`
========================================
PAGE VALIDATION FAILED
ORDER  : ${order}
ERROR  : ${error.message}
========================================
`);

      isAllPass = false;
    }

    return isAllPass;
  }

  private async getColumnValues(columnIndex: number): Promise<any[]> {

    const values: any[] = [];

    try {

      const count = await this.tableRows.count();

      for (let i = 0; i < count; i++) {

        try {

          const cell = this.tableRows.nth(i).locator('td').nth(columnIndex);

          let text = (await cell.innerText()).trim();

          text = text.replace(/\s+/g, ' ');

          values.push(this.parseValue(text));

        } catch {}
      }

    } catch {}

    return values;
  }

  private parseValue(value: string): any {

    const cleanValue = value.trim();

    if (!cleanValue || cleanValue === '-') return '';

    if (/^-?\d+(\.\d+)?$/.test(cleanValue)) return Number(cleanValue);

    const dateRegex = /^(\d{4}-\d{2}-\d{2}|\d{2}\/\d{2}\/\d{4}|\d{2}-\d{2}-\d{4})$/;

    if (dateRegex.test(cleanValue)) {

      const date = new Date(cleanValue);

      if (!isNaN(date.getTime())) return date.getTime();
    }

    return cleanValue.toLowerCase();
  }

  private checkSorting(values: any[], order: 'ASC' | 'DESC') {

    for (let i = 0; i < values.length - 1; i++) {

      const a = values[i];

      const b = values[i + 1];

      const isValid = order === 'ASC' ? a <= b : a >= b;

      if (!isValid) {

        return {
          expected: `${a} ${order === 'ASC' ? '<=' : '>='} ${b}`,
          actual: `${a} ${order === 'ASC' ? '>' : '<'} ${b}`
        };
      }
    }

    return {
      expected: 'Sorted',
      actual: 'Sorted'
    };
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

    try {

      const prevBtn = this.page.locator('button:has-text("Prev")').first();

      while (await prevBtn.isVisible() && await prevBtn.isEnabled()) {

        await prevBtn.click();

        await this.page.waitForTimeout(2000);

        await this.waitForTableLoad();
      }

    } catch {}
  }

  private async waitForTableLoad() {

    try {

      await this.page.waitForLoadState('networkidle');

      await this.tableRows.first().waitFor({
        state: 'visible',
        timeout: 5000
      });

    } catch {

      console.log('⚠️ Table rows not visible');
    }
  }
}