  import {
    Page,
    Locator,
    TestInfo
  } from '@playwright/test';

  import { logAndValidate } from '../../../../utils/reportUtil';

  export class TrimSortingWithPagination {

    readonly page: Page;
    readonly rows: Locator;
    readonly headers: Locator;
    readonly nextButton: Locator;
    readonly prevButton: Locator;
    readonly searchInput: Locator;
    readonly addTrimButton: Locator;
    readonly columnsButton: Locator;

    constructor(page: Page) {
      this.page = page;

      // Table selectors
      this.rows = page.locator('table tbody tr');
      this.headers = page.locator('table thead th');
      this.nextButton = page.getByRole('button', { name: 'Next' });
      this.prevButton = page.getByRole('button', { name: 'Prev' });
      this.searchInput = page.getByPlaceholder('Search...');
      this.addTrimButton = page.getByRole('button', { name: '+ Trim' });
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
    // TRIM SEARCH FUNCTIONALITY
    // ======================================================

    /**
     * Search for Trim by name, ID, or other criteria
     * @param searchTerm - The term to search for
     */
    async searchForTrim(searchTerm: string) {
      await this.searchInput.clear();
      await this.searchInput.fill(searchTerm);
      await this.page.keyboard.press('Enter');
      await this.waitForTableLoad();
      
      console.log(`🔍 Searching for Trim: "${searchTerm}"`);
    }

    /**
     * Search for Trim by exact name match
     * @param trimName - The exact trim name to search for
     */
    async searchByTrimName(trimName: string) {
      await this.searchForTrim(trimName);
      
      // Verify search results contain the trim name
      const rows = await this.rows.all();
      for (const row of rows) {
        const trimNameCell = row.locator('td').nth(1); // Trim Name column
        const text = await trimNameCell.textContent();
        if (text && !text.toLowerCase().includes(trimName.toLowerCase())) {
          console.warn(`⚠️ Row contains "${text}" but searching for "${trimName}"`);
        }
      }
    }

    /**
     * Search for Trim by ID
     * @param id - The Trim ID to search for
     */
    async searchByTrimId(id: string | number) {
      await this.searchForTrim(id.toString());
    }

    /**
     * Clear search and show all Trims
     */
    async clearTrimSearch() {
      await this.searchInput.clear();
      await this.page.keyboard.press('Enter');
      await this.waitForTableLoad();
      console.log('🔄 Cleared Trim search');
    }

    /**
     * Get search result count
     */
    async getTrimSearchResultCount(): Promise<number> {
      await this.waitForTableLoad();
      return await this.rows.count();
    }

    /**
     * Verify search returns expected number of results
     * @param expectedCount - Expected number of search results
     * @param testInfo - Test info for logging
     */
    async verifyTrimSearchResults(expectedCount: number, testInfo: TestInfo) {
      const actualCount = await this.getTrimSearchResultCount();
      
      await logAndValidate(
        {
          step: 'Trim Search Results Count',
          expected: expectedCount.toString(),
          actual: actualCount.toString()
        },
        testInfo
      );
      
      return actualCount === expectedCount;
    }

    // ======================================================
    // ADD NEW TRIM
    // ======================================================

    /**
     * Click the + Trim button to add a new Trim
     */
    async clickAddTrim() {
      await this.addTrimButton.click();
      await this.page.waitForLoadState('networkidle');
      console.log('➕ Clicked Add Trim button');
    }

    /**
     * Check if Add Trim button is visible
     */
    async isAddTrimButtonVisible(): Promise<boolean> {
      return await this.addTrimButton.isVisible();
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
        `Column "${columnName}" not found. Available columns: ID, Trim Name, Created, Status, Actions`
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
     * Get specific Trim data from current page
     * @param trimName - The trim name to find
     */
    async getTrimData(trimName: string): Promise<{
      id: string;
      name: string;
      created: string;
      status: string;
    } | null> {
      const rows = await this.rows.all();
      
      for (const row of rows) {
        const nameCell = row.locator('td').nth(1);
        const name = await nameCell.textContent();
        
        if (name && name.toLowerCase().includes(trimName.toLowerCase())) {
          const id = await row.locator('td').nth(0).textContent();
          const created = await row.locator('td').nth(2).textContent();
          const status = await row.locator('td').nth(3).textContent();
          
          return {
            id: id?.trim() || '',
            name: name.trim(),
            created: created?.trim() || '',
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
      
      // Number
      if (/^-?\d+(\.\d+)?$/.test(clean)) {
        return Number(clean);
      }
      
      // Status Mapping for Trim Status
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
      return clean.toLowerCase();
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
        
        // Number
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
        
        // Number
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
      
      if (firstOrder === 'UNSORTED') {
        
        console.log(
          `⚠️ "${columnName}" unsorted after first click`
        );
        
        return false;
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
      
      if (secondOrder === 'UNSORTED') {
        
        console.log(
          `⚠️ "${columnName}" unsorted after second click`
        );
        
        return false;
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
    // VERIFY CREATED DATE SORTING
    // ======================================================

    async verifyCreatedDateSorting(
      testInfo: TestInfo
    ) {
      
      console.log(
        `\n📅 Verifying Created column sorting`
      );
      
      const columnIndex =
        await this.getColumnIndex('Created');
      
      const header =
        this.headers.nth(columnIndex);
      
      await this.goToFirstPage();
      
      await header.click();
      
      await this.waitForTableLoad();
      
      const values =
        await this.getColumnValues(columnIndex);
      
      const order =
        this.detectOrder(values);
      
      if (order === 'UNSORTED') {
        
        console.log(
          `⚠️ Created column appears unsorted`
        );
        
        return false;
      }
      
      console.log(
        `📊 Created column order: ${order}`
      );
      
      return await this.validateAllPages(
        columnIndex,
        'Created',
        order,
        testInfo
      );
    }

    // ======================================================
    // VERIFY TRIM NAME SORTING
    // ======================================================

    async verifyTrimNameSorting(
      testInfo: TestInfo
    ) {
      
      console.log(
        `\n🔤 Verifying Trim Name column sorting`
      );
      
      return await this.verifyColumnSorting(
        'Trim Name',
        testInfo
      );
    }

    // ======================================================
    // VERIFY STATUS SORTING
    // ======================================================

    async verifyStatusSorting(
      testInfo: TestInfo
    ) {
      
      console.log(
        `\n✅ Verifying Status column sorting`
      );
      
      return await this.verifyColumnSorting(
        'Status',
        testInfo
      );
    }

    // ======================================================
// VERIFY ALL COLUMNS
// ======================================================

async verifyAllColumnsSorting(
  testInfo: TestInfo
) {

  const results: Record<string, boolean> = {};

  const columns = [
    { name: 'ID', sortable: true },
    { name: 'Trim Name', sortable: true },
    { name: 'Created', sortable: true, isDateColumn: true },
    { name: 'Status', sortable: true },
    { name: 'Actions', sortable: false }
  ];

  for (const column of columns) {

    if (!column.sortable) {

      console.log(
        `⏭️ Skipping "${column.name}"`
      );

      results[column.name] = true;
      continue;
    }

    try {

      if (column.isDateColumn) {

        results[column.name] =
          await this.verifyCreatedDateSorting(
            testInfo
          );

      } else {

        results[column.name] =
          await this.verifyColumnSorting(
            column.name,
            testInfo
          );
      }

    } catch (error) {

      console.error(
        `❌ Failed for "${column.name}"`,
        error
      );

      results[column.name] = false;
    }
  }

  // ==================================================
  // SUMMARY
  // ==================================================

  console.log('\n' + '='.repeat(50));
  console.log('TRIM TABLE SORTING VERIFICATION SUMMARY');
  console.log('='.repeat(50));

  for (const [column, passed] of Object.entries(results)) {

    console.log(
      `${passed ? '✅' : '❌'} ` +
      `${column}: ` +
      `${passed ? 'PASSED' : 'FAILED'}`
    );
  }

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
}}