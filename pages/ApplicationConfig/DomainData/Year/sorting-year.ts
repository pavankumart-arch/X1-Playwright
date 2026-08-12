import {
  Page,
  Locator,
  TestInfo
} from '@playwright/test';

import { logAndValidate } from '../../../../utils/reportUtil';

export class YearSortingWithPagination {

  readonly page: Page;
  readonly rows: Locator;
  readonly headers: Locator;
  readonly nextButton: Locator;
  readonly prevButton: Locator;
  readonly searchInput: Locator;
  readonly addYearButton: Locator;
  readonly columnsButton: Locator;

  constructor(page: Page) {
    this.page = page;

    // Table selectors
    this.rows = page.locator('table tbody tr');
    this.headers = page.locator('table thead th');
    this.nextButton = page.getByRole('button', { name: 'Next' });
    this.prevButton = page.getByRole('button', { name: 'Prev' });
    this.searchInput = page.getByPlaceholder('Search...');
    this.addYearButton = page.getByRole('button', { name: '+ Year' });
    this.columnsButton = page.getByRole('button', { name: 'Columns' });
  }

  // ======================================================
  // WAIT FOR TABLE LOAD
  // ======================================================

  async waitForTableLoad() {
    await this.page.waitForLoadState('networkidle');
    
    if (await this.rows.count() > 0) {
      await this.rows.first().waitFor({ state: 'visible' });
    }
  }

  // ======================================================
  // YEAR SEARCH FUNCTIONALITY
  // ======================================================

  /**
   * Search for Year by name, ID, or other criteria
   * @param searchTerm - The term to search for
   */
  async searchForYear(searchTerm: string) {
    await this.searchInput.clear();
    await this.searchInput.fill(searchTerm);
    await this.page.keyboard.press('Enter');
    await this.waitForTableLoad();
    
    console.log(`🔍 Searching for Year: "${searchTerm}"`);
  }

  /**
   * Search for Year by exact year value
   * @param yearValue - The exact year to search for (e.g., "2024")
   */
  async searchByYearValue(yearValue: string) {
    await this.searchForYear(yearValue);
    
    // Verify search results contain the year
    const rows = await this.rows.all();
    for (const row of rows) {
      const yearCell = row.locator('td').nth(1); // Year column
      const text = await yearCell.textContent();
      if (text && !text.toLowerCase().includes(yearValue.toLowerCase())) {
        console.warn(`⚠️ Row contains "${text}" but searching for "${yearValue}"`);
      }
    }
  }

  /**
   * Search for Year by ID
   * @param id - The Year ID to search for
   */
  async searchByYearId(id: string | number) {
    await this.searchForYear(id.toString());
  }

  /**
   * Clear search and show all Years
   */
  async clearYearSearch() {
    await this.searchInput.clear();
    await this.page.keyboard.press('Enter');
    await this.waitForTableLoad();
    console.log('🔄 Cleared Year search');
  }

  /**
   * Get search result count
   */
  async getYearSearchResultCount(): Promise<number> {
    await this.waitForTableLoad();
    return await this.rows.count();
  }

  /**
   * Verify search returns expected number of results
   * @param expectedCount - Expected number of search results
   * @param testInfo - Test info for logging
   */
  async verifyYearSearchResults(expectedCount: number, testInfo: TestInfo) {
    const actualCount = await this.getYearSearchResultCount();
    
    await logAndValidate(
      {
        step: 'Year Search Results Count',
        expected: expectedCount.toString(),
        actual: actualCount.toString()
      },
      testInfo
    );
    
    return actualCount === expectedCount;
  }

  // ======================================================
  // ADD NEW YEAR
  // ======================================================

  /**
   * Click the + Year button to add a new Year
   */
  async clickAddYear() {
    await this.addYearButton.click();
    await this.page.waitForLoadState('networkidle');
    console.log('➕ Clicked Add Year button');
  }

  /**
   * Check if Add Year button is visible
   */
  async isAddYearButtonVisible(): Promise<boolean> {
    return await this.addYearButton.isVisible();
  }

  // ======================================================
  // COLUMN MANAGEMENT
  // ======================================================

  /**
   * Click the Columns button to manage visible columns
   */
  async clickColumnsButton() {
    await this.columnsButton.click();
    console.log('📊 Clicked Columns button');
  }

  /**
   * Toggle column visibility
   * @param columnName - Name of column to toggle
   */
  async toggleColumnVisibility(columnName: string) {
    await this.clickColumnsButton();
    
    const columnOption = this.page.getByRole('checkbox', { name: columnName });
    if (await columnOption.isVisible()) {
      await columnOption.click();
      console.log(`👁️ Toggled column: ${columnName}`);
    }
    
    // Close columns dropdown by clicking outside or pressing Escape
    await this.page.keyboard.press('Escape');
    await this.waitForTableLoad();
  }

  // ======================================================
  // GO TO FIRST PAGE
  // ======================================================

  async goToFirstPage() {
    while (
      await this.prevButton.isVisible() &&
      await this.prevButton.isEnabled()
    ) {
      const before = await this.rows.first().textContent();
      
      await this.prevButton.click();
      
      await this.page.waitForFunction(
        (oldVal) => {
          const el = document.querySelector(
            'table tbody tr:first-child'
          );
          return el && el.textContent !== oldVal;
        },
        before
      );
    }
    console.log('📄 Navigated to first page');
  }

  // ======================================================
  // GET COLUMN INDEX
  // ======================================================

  async getColumnIndex(columnName: string): Promise<number> {
    const count = await this.headers.count();
    
    for (let i = 0; i < count; i++) {
      const text = (
        await this.headers.nth(i).innerText()
      ).trim();
      
      if (
        text.toLowerCase().includes(columnName.toLowerCase())
      ) {
        return i;
      }
    }
    
    throw new Error(
      `Column "${columnName}" not found. Available columns: ID, Year, Created, Updated, Status, Actions`
    );
  }

  // ======================================================
  // GET COLUMN VALUES
  // ======================================================

  async getColumnValues(columnIndex: number): Promise<any[]> {
    const values: any[] = [];
    const count = await this.rows.count();
    
    for (let i = 0; i < count; i++) {
      const cell = this.rows
        .nth(i)
        .locator('td')
        .nth(columnIndex);
      
      const rawValue = await cell.textContent();
      const value = rawValue?.trim();
      
      if (!value) continue;
      
      values.push(this.parseValue(value));
    }
    
    return values;
  }

  /**
   * Get specific Year data from current page
   * @param yearValue - The year value to find
   */
  async getYearData(yearValue: string): Promise<{
    id: string;
    year: string;
    created: string;
    updated: string;
    status: string;
  } | null> {
    const rows = await this.rows.all();
    
    for (const row of rows) {
      const yearCell = row.locator('td').nth(1);
      const year = await yearCell.textContent();
      
      if (year && year.toLowerCase().includes(yearValue.toLowerCase())) {
        const id = await row.locator('td').nth(0).textContent();
        const created = await row.locator('td').nth(2).textContent();
        const updated = await row.locator('td').nth(3).textContent();
        const status = await row.locator('td').nth(4).textContent();
        
        return {
          id: id?.trim() || '',
          year: year.trim(),
          created: created?.trim() || '',
          updated: updated?.trim() || '',
          status: status?.trim() || ''
        };
      }
    }
    
    return null;
  }

  // ======================================================
  // PARSE VALUE
  // ======================================================

  parseValue(value: string): any {
    const clean = value.trim();
    
    // ISO Date
    if (/^\d{4}-\d{2}-\d{2}$/.test(clean)) {
      return new Date(clean);
    }
    
    // DateTime
    if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(clean)) {
      return new Date(clean);
    }
    
    // MM/DD/YYYY
    if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(clean)) {
      return new Date(clean);
    }
    
    // Timestamp
    if (/^\d{10,13}$/.test(clean)) {
      return new Date(parseInt(clean));
    }
    
    // Year (4-digit number)
    if (/^\d{4}$/.test(clean)) {
      return Number(clean);
    }
    
    // Number
    if (/^-?\d+(\.\d+)?$/.test(clean)) {
      return Number(clean);
    }
    
    // Status Mapping
    const statusMap: Record<string, number> = {
      active: 3,
      published: 3,
      completed: 3,
      pending: 2,
      inactive: 1,
      draft: 1,
      archived: 0,
      deleted: 0
    };
    
    const lower = clean.toLowerCase();
    
    if (statusMap[lower] !== undefined) {
      return statusMap[lower];
    }
    
    // Default String
    return lower;
  }

  // ======================================================
  // DETECT SORT ORDER
  // ======================================================

  detectOrder(
    values: any[]
  ): 'ASC' | 'DESC' | 'UNSORTED' {
    
    if (values.length <= 1) {
      return 'ASC';
    }
    
    let ascCount = 0;
    let descCount = 0;
    
    for (let i = 0; i < values.length - 1; i++) {
      
      const current = values[i];
      const next = values[i + 1];
      
      let comparison = 0;
      
      // Date
      if (
        current instanceof Date &&
        next instanceof Date
      ) {
        comparison =
          current.getTime() - next.getTime();
      }
      
      // Number (including Year)
      else if (
        typeof current === 'number' &&
        typeof next === 'number'
      ) {
        comparison = current - next;
      }
      
      // String
      else {
        comparison = String(current).localeCompare(
          String(next),
          undefined,
          {
            numeric: true,
            sensitivity: 'base'
          }
        );
      }
      
      if (comparison < 0) {
        ascCount++;
      } else if (comparison > 0) {
        descCount++;
      }
    }
    
    const totalComparisons = values.length - 1;
    
    const sortedRatio =
      Math.max(ascCount, descCount) /
      totalComparisons;
    
    if (sortedRatio < 0.7) {
      return 'UNSORTED';
    }
    
    return descCount > ascCount
      ? 'DESC'
      : 'ASC';
  }

  // ======================================================
  // VALIDATE VALUES
  // ======================================================

  validateValues(
    values: any[],
    order: 'ASC' | 'DESC'
  ) {
    
    for (let i = 0; i < values.length - 1; i++) {
      
      const current = values[i];
      const next = values[i + 1];
      
      if (this.isEqual(current, next)) {
        continue;
      }
      
      let valid = false;
      
      // Date
      if (
        current instanceof Date &&
        next instanceof Date
      ) {
        valid =
          order === 'ASC'
            ? current.getTime() < next.getTime()
            : current.getTime() > next.getTime();
      }
      
      // Number (including Year)
      else if (
        typeof current === 'number' &&
        typeof next === 'number'
      ) {
        valid =
          order === 'ASC'
            ? current < next
            : current > next;
      }
      
      // String
      else {
        const comparison = String(current).localeCompare(
          String(next),
          undefined,
          {
            numeric: true,
            sensitivity: 'base'
          }
        );
        
        valid =
          order === 'ASC'
            ? comparison < 0
            : comparison > 0;
      }
      
      if (!valid) {
        return {
          pass: false,
          expected:
            `${this.formatValue(current)} ` +
            `${order === 'ASC' ? '<' : '>'} ` +
            `${this.formatValue(next)}`,
          
          actual:
            `${this.formatValue(current)} ` +
            `${order === 'ASC' ? '>=' : '<='} ` +
            `${this.formatValue(next)}`
        };
      }
    }
    
    return {
      pass: true,
      expected: 'Sorted Correctly',
      actual: 'Sorted Correctly'
    };
  }

  // ======================================================
  // HELPER: EQUAL CHECK
  // ======================================================

  private isEqual(a: any, b: any): boolean {
    
    if (
      a instanceof Date &&
      b instanceof Date
    ) {
      return a.getTime() === b.getTime();
    }
    
    return a === b;
  }

  // ======================================================
  // HELPER: FORMAT VALUE
  // ======================================================

  private formatValue(value: any): string {
    
    if (value instanceof Date) {
      return value.toLocaleString();
    }
    
    return String(value);
  }

  // ======================================================
  // GO TO NEXT PAGE
  // ======================================================

  private async goToNextPage(): Promise<boolean> {
    
    if (
      await this.nextButton.isVisible() &&
      await this.nextButton.isEnabled()
    ) {
      
      const before =
        await this.rows.first().textContent();
      
      await this.nextButton.click();
      
      await this.page.waitForFunction(
        (oldVal) => {
          const el = document.querySelector(
            'table tbody tr:first-child'
          );
          return el && el.textContent !== oldVal;
        },
        before
      );
      
      return true;
    }
    
    return false;
  }

  // ======================================================
  // VALIDATE ALL PAGES
  // ======================================================

  async validateAllPages(
    columnIndex: number,
    columnName: string,
    order: 'ASC' | 'DESC',
    testInfo: TestInfo
  ) {
    
    let pageNo = 1;
    let allPagesValid = true;
    
    while (true) {
      
      const values =
        await this.getColumnValues(columnIndex);
      
      if (values.length === 0) {
        
        console.log(
          `⚠️ No data found on Page ${pageNo}`
        );
        
        if (!(await this.goToNextPage())) {
          break;
        }
        
        pageNo++;
        continue;
      }
      
      const result =
        this.validateValues(values, order);
      
      if (result.pass) {
        
        console.log(
          `✅ ${columnName} validated on Page ${pageNo}`
        );
        
      } else {
        
        allPagesValid = false;
        
        console.log(
          `❌ ${columnName} issue on Page ${pageNo}`
        );
      }
      
      await logAndValidate(
        {
          step:
            `Sorting Validation | ` +
            `Column: ${columnName} | ` +
            `Page: ${pageNo} | ` +
            `Order: ${order}`,
          
          expected: result.expected,
          actual: result.actual
        },
        testInfo
      );
      
      if (!(await this.goToNextPage())) {
        break;
      }
      
      pageNo++;
    }
    
    return allPagesValid;
  }

  // ======================================================
  // VERIFY COLUMN SORTING
  // ======================================================

  async verifyColumnSorting(
    columnName: string,
    testInfo: TestInfo,
    options?: { skipReverseCheck?: boolean }
  ) {
    
    console.log(
      `\n🔍 Verifying sorting for "${columnName}"`
    );
    
    const columnIndex =
      await this.getColumnIndex(columnName);
    
    const header =
      this.headers.nth(columnIndex);
    
    // Skip Actions column
    if (
      columnName.toLowerCase() === 'actions'
    ) {
      
      console.log(
        `⚠️ Skipping "${columnName}" column`
      );
      
      return true;
    }
    
    // ==================================================
    // FIRST CLICK
    // ==================================================
    
    await this.goToFirstPage();
    
    await header.click();
    
    await this.waitForTableLoad();
    
    const firstPageValues =
      await this.getColumnValues(columnIndex);
    
    const firstOrder =
      this.detectOrder(firstPageValues);
    
    // Handle UNSORTED case
    if (firstOrder === 'UNSORTED') {
      console.log(`⚠️ "${columnName}" unsorted after first click, trying second click...`);
      
      // Try second click
      await this.goToFirstPage();
      await header.click();
      await this.waitForTableLoad();
      
      const secondPageValues = await this.getColumnValues(columnIndex);
      const secondOrder = this.detectOrder(secondPageValues);
      
      if (secondOrder === 'UNSORTED') {
        const errorMsg = `❌ "${columnName}" cannot be sorted`;
        console.log(errorMsg);
        await logAndValidate(
          {
            step: `${columnName} Sorting Validation`,
            expected: 'ASC or DESC',
            actual: 'UNSORTED'
          },
          testInfo
        );
        throw new Error(errorMsg);
      }
      
      console.log(`📊 Order after second click: ${secondOrder}`);
      return await this.validateAllPages(
        columnIndex,
        columnName,
        secondOrder,
        testInfo
      );
    }
    
    console.log(
      `📊 First click order: ${firstOrder}`
    );
    
    const ascValid =
      await this.validateAllPages(
        columnIndex,
        columnName,
        firstOrder,
        testInfo
      );
    
    // ==================================================
    // SECOND CLICK
    // ==================================================
    
    await this.goToFirstPage();
    
    await header.click();
    
    await this.waitForTableLoad();
    
    const secondPageValues =
      await this.getColumnValues(columnIndex);
    
    const secondOrder =
      this.detectOrder(secondPageValues);
    
    // Handle UNSORTED case for second click
    if (secondOrder === 'UNSORTED') {
      console.log(`⚠️ "${columnName}" unsorted after second click`);
      return ascValid;
    }
    
    console.log(
      `📊 Second click order: ${secondOrder}`
    );
    
    if (
      !options?.skipReverseCheck &&
      firstOrder === secondOrder &&
      firstPageValues.length > 1
    ) {
      
      console.warn(
        `⚠️ Second click did not reverse sorting`
      );
    }
    
    const descValid =
      await this.validateAllPages(
        columnIndex,
        columnName,
        secondOrder,
        testInfo
      );
    
    return ascValid && descValid;
  }

  // ======================================================
  // VERIFY YEAR SORTING
  // ======================================================

  async verifyYearSorting(
    testInfo: TestInfo
  ): Promise<boolean> {
    
    console.log(
      `\n📅 Verifying Year column sorting`
    );
    
    try {
      const columnIndex =
        await this.getColumnIndex('Year');
      
      const header =
        this.headers.nth(columnIndex);
      
      await this.goToFirstPage();
      
      await header.click();
      
      await this.waitForTableLoad();
      
      const values =
        await this.getColumnValues(columnIndex);
      
      if (values.length === 0) {
        const errorMsg = 'No data found in Year column to validate sorting';
        console.log(`⚠️ ${errorMsg}`);
        await logAndValidate(
          {
            step: 'Year Sorting Validation',
            expected: 'Data to sort',
            actual: 'No data found'
          },
          testInfo
        );
        throw new Error(errorMsg);
      }
      
      const order =
        this.detectOrder(values);
      
      // Handle UNSORTED case
      if (order === 'UNSORTED') {
        console.log(`⚠️ Year column unsorted after first click, trying second click...`);
        
        await this.goToFirstPage();
        await header.click();
        await this.waitForTableLoad();
        
        const secondValues = await this.getColumnValues(columnIndex);
        const secondOrder = this.detectOrder(secondValues);
        
        if (secondOrder === 'UNSORTED') {
          const errorMsg = 'Year column cannot be sorted - table may not support sorting';
          console.log(`❌ ${errorMsg}`);
          await logAndValidate(
            {
              step: 'Year Sorting Validation',
              expected: 'ASC or DESC',
              actual: 'UNSORTED'
            },
            testInfo
          );
          throw new Error(errorMsg);
        }
        
        console.log(`📊 Year column order on second click: ${secondOrder}`);
        return await this.validateAllPages(
          columnIndex,
          'Year',
          secondOrder,
          testInfo
        );
      }
      
      console.log(
        `📊 Year column order: ${order}`
      );
      
      return await this.validateAllPages(
        columnIndex,
        'Year',
        order,
        testInfo
      );
      
    } catch (error) {
      console.error(`❌ Error verifying Year sorting:`, error);
      await logAndValidate(
        {
          step: 'Year Sorting Validation',
          expected: 'Successful validation',
          actual: `Error: ${error instanceof Error ? error.message : error}`
        },
        testInfo
      );
      // Re-throw to make the test fail
      throw error;
    }
  }

  // ======================================================
  // VERIFY CREATED DATE SORTING
  // ======================================================

  async verifyCreatedDateSorting(
    testInfo: TestInfo
  ): Promise<boolean> {
    
    console.log(
      `\n📅 Verifying Created column sorting`
    );
    
    try {
      return await this.verifyColumnSorting('Created', testInfo);
    } catch (error) {
      console.error(`❌ Error verifying Created sorting:`, error);
      await logAndValidate(
        {
          step: 'Created Sorting Validation',
          expected: 'Successful validation',
          actual: `Error: ${error instanceof Error ? error.message : error}`
        },
        testInfo
      );
      throw error;
    }
  }

  // ======================================================
  // VERIFY UPDATED DATE SORTING
  // ======================================================

  async verifyUpdatedDateSorting(
    testInfo: TestInfo
  ): Promise<boolean> {
    
    console.log(
      `\n📅 Verifying Updated column sorting`
    );
    
    try {
      return await this.verifyColumnSorting('Updated', testInfo);
    } catch (error) {
      console.error(`❌ Error verifying Updated sorting:`, error);
      await logAndValidate(
        {
          step: 'Updated Sorting Validation',
          expected: 'Successful validation',
          actual: `Error: ${error instanceof Error ? error.message : error}`
        },
        testInfo
      );
      throw error;
    }
  }

  // ======================================================
  // VERIFY STATUS SORTING
  // ======================================================

  async verifyStatusSorting(
    testInfo: TestInfo
  ): Promise<boolean> {
    
    console.log(
      `\n✅ Verifying Status column sorting`
    );
    
    try {
      return await this.verifyColumnSorting('Status', testInfo);
    } catch (error) {
      console.error(`❌ Error verifying Status sorting:`, error);
      await logAndValidate(
        {
          step: 'Status Sorting Validation',
          expected: 'Successful validation',
          actual: `Error: ${error instanceof Error ? error.message : error}`
        },
        testInfo
      );
      throw error;
    }
  }

  // ======================================================
  // VERIFY ID SORTING
  // ======================================================

  async verifyIdSorting(
    testInfo: TestInfo
  ): Promise<boolean> {
    
    console.log(
      `\n🔢 Verifying ID column sorting`
    );
    
    try {
      return await this.verifyColumnSorting('ID', testInfo);
    } catch (error) {
      console.error(`❌ Error verifying ID sorting:`, error);
      await logAndValidate(
        {
          step: 'ID Sorting Validation',
          expected: 'Successful validation',
          actual: `Error: ${error instanceof Error ? error.message : error}`
        },
        testInfo
      );
      throw error;
    }
  }

  // ======================================================
  // VERIFY ALL COLUMNS
  // ======================================================

  async verifyAllColumnsSorting(
    testInfo: TestInfo
  ): Promise<Record<string, boolean>> {

    const results: Record<string, boolean> = {};

    const columns = [
      { name: 'ID', sortable: true },
      { name: 'Year', sortable: true, isYearColumn: true },
      { name: 'Created', sortable: true, isDateColumn: true },
      { name: 'Updated', sortable: true, isDateColumn: true },
      { name: 'Status', sortable: true },
      { name: 'Actions', sortable: false }
    ];

    for (const column of columns) {

      if (!column.sortable) {

        console.log(
          `⏭️ Skipping "${column.name}" (not sortable)`
        );

        results[column.name] = true;
        continue;
      }

      try {

        console.log(`\n${'='.repeat(50)}`);
        console.log(`Testing sorting for column: ${column.name}`);
        console.log(`${'='.repeat(50)}`);

        if (column.isYearColumn) {

          results[column.name] =
            await this.verifyYearSorting(testInfo);

        } else if (column.isDateColumn) {

          results[column.name] =
            await this.verifyColumnSorting(
              column.name,
              testInfo
            );

        } else {

          results[column.name] =
            await this.verifyColumnSorting(
              column.name,
              testInfo
            );
        }
        
        // Log individual result
        console.log(
          `${results[column.name] ? '✅' : '❌'} ` +
          `${column.name} sorting: ${results[column.name] ? 'PASSED' : 'FAILED'}`
        );

      } catch (error) {

        console.error(
          `❌ Failed for "${column.name}"`,
          error
        );

        results[column.name] = false;
        
        // Log the error in the report
        await logAndValidate(
          {
            step: `${column.name} Sorting Validation`,
            expected: 'Successful validation',
            actual: `Exception: ${error instanceof Error ? error.message : error}`
          },
          testInfo
        );
      }
    }

    // ==================================================
    // SUMMARY
    // ==================================================

    console.log('\n' + '='.repeat(50));
    console.log('YEAR TABLE SORTING VERIFICATION SUMMARY');
    console.log('='.repeat(50));
    console.log(`Total columns tested: ${Object.keys(results).length}`);
    console.log(`Passed: ${Object.values(results).filter(v => v === true).length}`);
    console.log(`Failed: ${Object.values(results).filter(v => v === false).length}`);
    console.log('='.repeat(50));

    for (const [column, passed] of Object.entries(results)) {

      console.log(
        `${passed ? '✅' : '❌'} ` +
        `${column}: ${passed ? 'PASSED' : 'FAILED'}`
      );
    }
    console.log('='.repeat(50));

    // ==================================================
    // FAIL PLAYWRIGHT TEST
    // ==================================================

    const allPassed = Object.values(results).every(
      value => value === true
    );

    if (!allPassed) {

      const failedColumns = Object.entries(results)
        .filter(([_, passed]) => !passed)
        .map(([column]) => column)
        .join(', ');

      throw new Error(
        `Sorting validation failed for column(s): ${failedColumns}`
      );
    }

    return results;
  }
}