import { Page, Locator, TestInfo } from '@playwright/test';
import { Reporter } from '../../utils/NewReport';


export class RooftopUserSortingWithPagination {
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
      await this.page.waitForFunction((oldVal) => {
        const el = document.querySelector('table tbody tr:first-child');
        return (el && el.textContent !== oldVal);
      }, before);
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
    return clean.toLowerCase();
  }

  detectOrder(values: any[]): 'asc' | 'desc' {
    let ascCount = 0;
    let descCount = 0;
    for (let i = 0; i < values.length - 1; i++) {
      const current = values[i];
      const next = values[i + 1];
      if (typeof current === 'number' && typeof next === 'number') {
        if (current <= next) ascCount++;
        if (current >= next) descCount++;
      } else {
        const comparison = String(current).localeCompare(String(next), undefined, {
          numeric: true,
          sensitivity: 'base'
        });
        if (comparison <= 0) ascCount++;
        if (comparison >= 0) descCount++;
      }
    }
    return descCount > ascCount ? 'desc' : 'asc';
  }

  validateValues(values: any[], order: 'asc' | 'desc') {
    for (let i = 0; i < values.length - 1; i++) {
      const current = values[i];
      const next = values[i + 1];
      let valid = false;
      let comparison = 0;
      
      if (typeof current === 'number' && typeof next === 'number') {
        valid = order === 'asc' ? current <= next : current >= next;
        comparison = current - next;
      } else {
        comparison = String(current).localeCompare(String(next), undefined, {
          numeric: true,
          sensitivity: 'base'
        });
        valid = order === 'asc' ? comparison <= 0 : comparison >= 0;
      }
      
      if (!valid) {
        return {
          pass: false,
          failedPosition: i + 1,
          totalRecords: values.length,
          currentValue: current,
          nextValue: next,
          expectedCondition: `${current} ${order === 'asc' ? '≤' : '≥'} ${next}`,
          actualCondition: `${current} ${order === 'asc' ? '>' : '<'} ${next}`,
          comparisonResult: comparison,
          expected: `${order.toUpperCase()} order: ${current} should come ${order === 'asc' ? 'before or equal to' : 'after or equal to'} ${next}`,
          actual: `Found ${current} ${order === 'asc' ? 'after' : 'before'} ${next} at position ${i + 1}`
        };
      }
    }
    
    return {
      pass: true,
      totalRecords: values.length,
      expected: 'Sorted Correctly',
      actual: 'Sorted Correctly'
    };
  }

  async validateAllPages(columnIndex: number, columnName: string, order: 'asc' | 'desc', testInfo: TestInfo) {
    let pageNo = 1;
    let allPagesValid = true;
    const validationDetails = [];
    let failureDetails: {
      column: string;
      order: 'asc' | 'desc';
      page: number;
      position: number;
      currentValue: any;
      nextValue: any;
      allValues: any[];
    } | null = null;

    while (true) {
      const values = await this.getColumnValues(columnIndex);
      const result = this.validateValues(values, order);
      
      validationDetails.push({
        page: pageNo,
        result: result,
        valuesCount: values.length,
        sampleValues: values.slice(0, 5)
      });

      if (!result.pass && result.failedPosition) {
        allPagesValid = false;
        failureDetails = {
          column: columnName,
          order: order,
          page: pageNo,
          position: result.failedPosition,
          currentValue: result.currentValue,
          nextValue: result.nextValue,
          allValues: values.slice(Math.max(0, result.failedPosition - 3), result.failedPosition + 2)
        };
        
        console.log(`\n${'='.repeat(80)}`);
        console.log(`❌ SORTING FAILURE DETECTED in "${columnName}" (${order.toUpperCase()})`);
        console.log(`${'='.repeat(80)}`);
        console.log(`📍 Page: ${pageNo}`);
        console.log(`📍 Position: ${result.failedPosition} of ${result.totalRecords}`);
        console.log(`📊 Current Value: "${result.currentValue}"`);
        console.log(`📊 Next Value: "${result.nextValue}"`);
        console.log(`🔍 Expected: ${result.currentValue} ${order === 'asc' ? '≤' : '≥'} ${result.nextValue}`);
        console.log(`🔍 Actual: ${result.currentValue} ${order === 'asc' ? '>' : '<'} ${result.nextValue}`);
        console.log(`\n📋 Values around failure:`);
        
        const start = Math.max(0, result.failedPosition - 3);
        for (let i = start; i < Math.min(values.length, start + 6); i++) {
          const marker = i + 1 === result.failedPosition ? '👉 ' : '   ';
          const arrow = i + 1 === result.failedPosition ? ' ❌ FAIL HERE' : '';
          console.log(`${marker}Position ${i + 1}: "${values[i]}"${arrow}`);
        }
        console.log(`${'='.repeat(80)}\n`);
      }

      if (await this.nextButton.isVisible() && await this.nextButton.isEnabled()) {
        const before = await this.rows.first().textContent();
        await this.nextButton.click();
        await this.page.waitForFunction((oldVal) => {
          const el = document.querySelector('table tbody tr:first-child');
          return (el && el.textContent !== oldVal);
        }, before);
        pageNo++;
      } else {
        break;
      }
    }

    const totalRecords = validationDetails.reduce((sum, detail) => sum + detail.valuesCount, 0);
    
    Reporter.validateSort(
      columnName,
      order,
      allPagesValid,
      testInfo
    );

    return { allPagesValid, failureDetails };
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
    
    const firstResult = await this.validateAllPages(columnIndex, columnName, firstOrder, testInfo);

    await this.goToFirstPage();
    await header.click();
    await this.waitForTableLoad();
    
    const secondPageValues = await this.getColumnValues(columnIndex);
    const secondOrder = this.detectOrder(secondPageValues);
    
    const secondResult = await this.validateAllPages(columnIndex, columnName, secondOrder, testInfo);
    
    return { 
      columnName, 
      allPagesValid: firstResult.allPagesValid && secondResult.allPagesValid,
      ascResult: firstResult,
      descResult: secondResult
    };
  }

  async verifyAllColumnsSorting(testInfo: TestInfo) {
    const columns = ['ID', 'Username', 'Email', 'Reseller', 'User Type', 'Status'];
    const results = [];
    let hasFailures = false;
    
    for (const column of columns) {
      const result = await this.verifyColumnSorting(column, testInfo);
      results.push(result);
      if (result && !result.allPagesValid) {
        hasFailures = true;
      }
    }
    
    console.log('\n' + '='.repeat(80));
    console.log('SORTING VALIDATION COMPLETED FOR ALL COLUMNS');
    console.log('='.repeat(80));
    
    return { hasFailures, results };
  }
}