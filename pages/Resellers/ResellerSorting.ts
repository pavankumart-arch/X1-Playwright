import { Locator, Page, TestInfo } from '@playwright/test';
import { BasePage } from '../../pages/BasePage';
import { Reporter } from '../utils/NewReport';

export class TableSorting extends BasePage {

  tableRows: Locator;
  tableHeaders: Locator;
  nextButton: Locator;
  prevButton: Locator;
  paginationText: Locator;

  constructor(page: Page) {
    super(page);
    this.tableRows = page.locator('table tbody tr');
    this.tableHeaders = page.locator('table thead th');
    this.nextButton = page.getByRole('button', { name: 'Next' });
    this.prevButton = page.getByRole('button', { name: 'Prev' });
    this.paginationText = page.locator('text=/Showing \\d+-\\d+ of \\d+/');
  }

  async validateColumnSorting(columnName: string, testInfo: TestInfo): Promise<boolean> {

    try {
      const columnIndex = await this.getColumnIndex(columnName);
      const header = this.tableHeaders.nth(columnIndex);

      // ASCENDING
      console.log(`\n📊 Testing ASCENDING order for: ${columnName}`);
      await header.click();
      await this.waitForTableLoad();
      await this.goToFirstPage();

      const ascResult = await this.validateAllPages(columnIndex, 'ASC', testInfo, columnName);

      Reporter.validateData(
        'PASS',
        ascResult ? 'PASS' : 'FAIL',
        `🔼 ASCENDING ORDER (${columnName})`,
        testInfo
      );

      // DESCENDING
      console.log(`\n📊 Testing DESCENDING order for: ${columnName}`);
      await header.click();
      await this.waitForTableLoad();
      await this.goToFirstPage();

      const descResult = await this.validateAllPages(columnIndex, 'DESC', testInfo, columnName);

      Reporter.validateData(
        'PASS',
        descResult ? 'PASS' : 'FAIL',
        `🔽 DESCENDING ORDER (${columnName})`,
        testInfo
      );

      return ascResult && descResult;

    } catch (error: any) {
      console.log(`
========================================
SORTING VALIDATION FAILED
COLUMN : ${columnName}
ERROR  : ${error.message}
========================================
`);
      Reporter.validateData(
        'PASS',
        'FAIL',
        `SORTING VALIDATION (${columnName})`,
        testInfo
      );
      return false;
    }
  }

  private async validateAllPages(
    columnIndex: number, 
    order: 'ASC' | 'DESC', 
    testInfo: TestInfo,
    columnName: string
  ): Promise<boolean> {

    let pageNumber = 1;
    let allValues: any[] = [];
    let failedPosition = -1;
    let failedExpected = '';
    let failedActual = '';

    try {
      while (true) {
        const values = await this.getColumnValues(columnIndex);
        console.log(`📄 Page ${pageNumber} - ${order} Values:`, values.slice(0, 5), values.length > 5 ? '...' : '');
        allValues.push(...values);

        const isNextVisible = await this.nextButton.isVisible().catch(() => false);
        const isNextEnabled = await this.nextButton.isEnabled().catch(() => false);

        if (!isNextVisible || !isNextEnabled) {
          console.log(`   📌 Reached last page`);
          break;
        }

        const firstRowBefore = values.length > 0 ? values[0] : null;
        await this.nextButton.click();
        await this.waitForTableLoad();
        
        const newValues = await this.getColumnValues(columnIndex);
        const firstRowAfter = newValues.length > 0 ? newValues[0] : null;
        
        if (firstRowBefore === firstRowAfter && firstRowBefore !== null) break;
        pageNumber++;
        if (pageNumber > 100) break;
      }

      const validationResult = this.checkSortingWithDetails(allValues, order);
      const isSorted = validationResult.isSorted;
      
      if (!isSorted) {
        failedPosition = validationResult.failedPosition;
        failedExpected = validationResult.failedExpected;
        failedActual = validationResult.failedActual;
      }

      console.log(`\n${'='.repeat(60)}`);
      console.log(`SORT RESULTS for ${columnName} (${order})`);
      console.log(`${'='.repeat(60)}`);
      console.log(`Total Records: ${allValues.length}`);
      console.log(`Status: ${isSorted ? '✅ PASSED' : '❌ FAILED'}`);
      
      if (!isSorted) {
        console.log(`Failed at: Row ${failedPosition} → Row ${failedPosition + 1}`);
        console.log(`Expected: ${failedExpected}`);
        console.log(`Actual: ${failedActual}`);
      }
      console.log(`${'='.repeat(60)}\n`);

      if (isSorted) {
        Reporter.validateData(
          `${order} order - CORRECT`,
          `${order} order - CORRECT`,
          `✅ ${order} ORDER VALIDATION (${columnName})`,
          testInfo
        );
      } else {
        Reporter.validateData(
          `${order} order - All records sorted correctly`,
          `Failed at position ${failedPosition}: ${failedExpected} but found ${failedActual}`,
          `❌ ${order} ORDER VALIDATION (${columnName})`,
          testInfo
        );
      }

      return isSorted;

    } catch (error: any) {
      console.log(`❌ Page validation failed: ${error.message}`);
      return false;
    }
  }

  private checkSortingWithDetails(values: any[], order: 'ASC' | 'DESC'): {
    isSorted: boolean;
    failedPosition: number;
    failedExpected: string;
    failedActual: string;
  } {
    const nonEmptyValues = values.filter(v => v !== '' && v !== null && v !== undefined);
    
    if (nonEmptyValues.length <= 1) {
      return { isSorted: true, failedPosition: -1, failedExpected: '', failedActual: '' };
    }

    for (let i = 0; i < nonEmptyValues.length - 1; i++) {
      let a = nonEmptyValues[i];
      let b = nonEmptyValues[i + 1];
      
      let isValid: boolean;
      
      // Handle numbers (including IDs)
      if (typeof a === 'number' && typeof b === 'number') {
        isValid = order === 'ASC' ? a <= b : a >= b;
        
        if (!isValid) {
          return {
            isSorted: false,
            failedPosition: i + 1,
            failedExpected: order === 'ASC' ? `${a} <= ${b}` : `${a} >= ${b}`,
            failedActual: order === 'ASC' ? `${a} > ${b}` : `${a} < ${b}`
          };
        }
      }
      // Handle strings
      else {
        const aStr = String(a);
        const bStr = String(b);
        isValid = order === 'ASC' ? aStr.localeCompare(bStr) <= 0 : aStr.localeCompare(bStr) >= 0;
        
        if (!isValid) {
          return {
            isSorted: false,
            failedPosition: i + 1,
            failedExpected: order === 'ASC' ? `${aStr} <= ${bStr}` : `${aStr} >= ${bStr}`,
            failedActual: order === 'ASC' ? `${aStr} > ${bStr}` : `${aStr} < ${bStr}`
          };
        }
      }
    }

    return { isSorted: true, failedPosition: -1, failedExpected: '', failedActual: '' };
  }

  private async getColumnValues(columnIndex: number): Promise<any[]> {
    const values: any[] = [];

    try {
      await this.page.waitForTimeout(500);
      const count = await this.tableRows.count();

      for (let i = 0; i < count; i++) {
        try {
          const cell = this.tableRows.nth(i).locator('td').nth(columnIndex);
          let text = (await cell.innerText()).trim();
          text = text.replace(/\s+/g, ' ');
          values.push(this.parseValue(text));
        } catch {
          // Skip row errors
        }
      }
    } catch (error) {
      console.log(`   ⚠️ Error getting column values: ${error}`);
    }

    return values;
  }

  private parseValue(value: string): any {
    const cleanValue = value.trim();

    if (!cleanValue || cleanValue === '-') return '';

    // Handle pure numbers (IDs, counts, etc.)
    if (/^\d+$/.test(cleanValue)) {
      return Number(cleanValue);
    }

    // Handle decimal numbers
    if (/^-?\d+(\.\d+)?$/.test(cleanValue)) {
      return Number(cleanValue);
    }

    // Handle dates
    const dateRegex = /^(\d{4}-\d{2}-\d{2}|\d{2}\/\d{2}\/\d{4}|\d{2}-\d{2}-\d{4})$/;
    if (dateRegex.test(cleanValue)) {
      const date = new Date(cleanValue);
      if (!isNaN(date.getTime())) return date.getTime();
    }

    // Default: return as lowercase string
    return cleanValue.toLowerCase();
  }

  private async getColumnIndex(columnName: string): Promise<number> {
    const count = await this.tableHeaders.count();

    for (let i = 0; i < count; i++) {
      const text = (await this.tableHeaders.nth(i).innerText()).trim();
      if (text.toLowerCase().includes(columnName.toLowerCase())) {
        console.log(`📍 Found column "${columnName}" at index ${i}`);
        return i;
      }
    }

    throw new Error(`Column not found: ${columnName}`);
  }

  private async goToFirstPage(): Promise<void> {
    try {
      let maxAttempts = 20;
      let attempts = 0;
      
      while (attempts < maxAttempts) {
        const isPrevVisible = await this.prevButton.isVisible().catch(() => false);
        const isPrevEnabled = await this.prevButton.isEnabled().catch(() => false);
        
        if (!isPrevVisible || !isPrevEnabled) {
          console.log(`📌 Navigated to first page`);
          break;
        }
        
        await this.prevButton.click();
        await this.waitForTableLoad();
        attempts++;
      }
    } catch (error) {
      console.log(`⚠️ Could not navigate to first page: ${error}`);
    }
  }

  private async waitForTableLoad(): Promise<void> {
    try {
      await this.page.waitForLoadState('networkidle');
      await this.page.waitForTimeout(1000);
      
      await Promise.race([
        this.tableRows.first().waitFor({ state: 'visible', timeout: 5000 }),
        this.page.locator('text=No data').waitFor({ state: 'visible', timeout: 5000 })
      ]).catch(() => {
        console.log('⚠️ Table load timeout');
      });
    } catch (error) {
      console.log('⚠️ Table rows not visible');
    }
  }

  async getPaginationInfo(): Promise<{ currentPage: number; totalPages: number; totalRecords: number }> {
    try {
      const text = await this.paginationText.textContent();
      const match = text?.match(/Showing (\d+)-(\d+) of (\d+)/);
      if (match) {
        const showingTo = parseInt(match[2]);
        const totalRecords = parseInt(match[3]);
        const itemsPerPage = showingTo - parseInt(match[1]) + 1;
        const totalPages = Math.ceil(totalRecords / itemsPerPage);
        
        let currentPage = 1;
        const activePage = this.page.locator('button[aria-current="page"]');
        if (await activePage.isVisible().catch(() => false)) {
          currentPage = parseInt(await activePage.innerText()) || 1;
        }
        
        return { currentPage, totalPages, totalRecords };
      }
    } catch (error) {
      console.log(`⚠️ Could not get pagination info: ${error}`);
    }
    
    return { currentPage: 1, totalPages: 1, totalRecords: 0 };
  }

  async runAllSortingTests(testInfo: TestInfo, columns: string[] = ['Name', 'ID', 'Status']): Promise<boolean> {
    Reporter.startTest();

    console.log('\n' + '='.repeat(80));
    console.log('TABLE SORTING TESTS');
    console.log('='.repeat(80));

    let allPassed = true;

    for (const column of columns) {
      console.log(`\n${'─'.repeat(60)}`);
      console.log(`📍 Testing sorting for column: ${column}`);
      console.log(`${'─'.repeat(60)}`);
      
      const result = await this.validateColumnSorting(column, testInfo);
      if (!result) allPassed = false;
    }

    const summary = Reporter.endTest(testInfo);
    console.log(`\n📊 Sorting Tests Completed - Pass Rate: ${summary.passRate}`);
    
    return allPassed;
  }
}