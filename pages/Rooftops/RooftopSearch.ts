import { Page, Locator, TestInfo } from '@playwright/test';
import { Reporter } from '../utils/NewReport';

export class RooftopSearch {
  page: Page;
  searchInput: Locator;
  noDataMessage: Locator;
  nextButton: Locator;
  testInfo: TestInfo;
  failures: string[] = [];

  constructor(page: Page, testInfo: TestInfo) {
    this.page = page;
    this.testInfo = testInfo;

    this.searchInput = page.getByPlaceholder('Search...');
    this.noDataMessage = page.locator('text=No data available');
    this.nextButton = page.getByRole('button', { name: 'Next' });
  }

  /**
   * Check whether page is still available.
   */
  private isPageAvailable(): boolean {
    try {
      return !this.page.isClosed();
    } catch {
      return false;
    }
  }

  /**
   * Get table rows.
   */
  private getRows(): Locator {
    return this.page.locator('table tbody tr');
  }

  /**
   * Get table headers.
   */
  private async getTableHeaders(): Promise<string[]> {
    try {
      const headers = this.page.locator('table thead th');
      const count = await headers.count();

      const headerNames: string[] = [];

      for (let i = 0; i < count; i++) {
        const text =
          (await headers.nth(i).textContent())?.trim() || '';

        headerNames.push(text);
      }

      return headerNames;
    } catch {
      return [];
    }
  }

  /**
   * Find column index by header name.
   */
  private async getColumnIndex(
    possibleNames: string[]
  ): Promise<number> {
    const headers = await this.getTableHeaders();

    for (const name of possibleNames) {
      const index = headers.findIndex(
        header =>
          header.trim().toLowerCase() ===
          name.trim().toLowerCase()
      );

      if (index !== -1) {
        return index;
      }
    }

    return -1;
  }

  /**
   * Get first record data.
   */
  private async getFirstRecordData(): Promise<{
    id: string;
    name: string;
    description: string;
    created: string;
    status: string;
  }> {
    try {
      if (!this.isPageAvailable()) {
        return {
          id: '',
          name: '',
          description: '',
          created: '',
          status: ''
        };
      }

      await this.resetSearch();

      const rows = this.getRows();

      await rows.first().waitFor({
        state: 'visible',
        timeout: 5000
      });

      const firstRow = rows.first();
      const cells = firstRow.locator('td');

      const cellCount = await cells.count();

      if (cellCount === 0) {
        return {
          id: '',
          name: '',
          description: '',
          created: '',
          status: ''
        };
      }

      /*
       * Default indexes.
       * These are used only if matching headers
       * cannot be found.
       */
      let idIndex = 0;
      let nameIndex = 1;
      let descriptionIndex = 2;
      let createdIndex = 3;
      let statusIndex = 4;

      const dynamicIdIndex = await this.getColumnIndex([
        'ID',
        'Id',
        'Rooftop ID'
      ]);

      const dynamicNameIndex = await this.getColumnIndex([
        'Name',
        'Rooftop Name'
      ]);

      const dynamicDescriptionIndex =
        await this.getColumnIndex([
          'Description'
        ]);

      const dynamicCreatedIndex =
        await this.getColumnIndex([
          'Created',
          'Created Date',
          'Created At'
        ]);

      const dynamicStatusIndex =
        await this.getColumnIndex([
          'Status'
        ]);

      if (dynamicIdIndex !== -1) {
        idIndex = dynamicIdIndex;
      }

      if (dynamicNameIndex !== -1) {
        nameIndex = dynamicNameIndex;
      }

      if (dynamicDescriptionIndex !== -1) {
        descriptionIndex = dynamicDescriptionIndex;
      }

      if (dynamicCreatedIndex !== -1) {
        createdIndex = dynamicCreatedIndex;
      }

      if (dynamicStatusIndex !== -1) {
        statusIndex = dynamicStatusIndex;
      }

      const getCellText = async (
        index: number
      ): Promise<string> => {
        if (index < 0 || index >= cellCount) {
          return '';
        }

        return (
          (await cells.nth(index).textContent())?.trim() || ''
        );
      };

      const id = await getCellText(idIndex);
      const name = await getCellText(nameIndex);
      const description =
        await getCellText(descriptionIndex);
      const created =
        await getCellText(createdIndex);
      const status =
        await getCellText(statusIndex);

      console.log(
        `📋 First Rooftop Record: ID="${id}", Name="${name}", Status="${status}"`
      );

      return {
        id,
        name,
        description,
        created,
        status
      };
    } catch (error) {
      console.log(
        `⚠️ Could not get first record data: ${error}`
      );

      return {
        id: '',
        name: '',
        description: '',
        created: '',
        status: ''
      };
    }
  }

  /**
   * Perform search.
   *
   * Important:
   * We do not immediately inspect the existing rows because
   * those rows may belong to the previous search.
   */
  async performSearch(value: string): Promise<boolean> {
    if (!value || value.trim() === '') {
      return false;
    }

    if (!this.isPageAvailable()) {
      this.fail(
        `Search "${value}" failed: Page is closed`
      );
      return false;
    }

    try {
      await this.searchInput.waitFor({
        state: 'visible',
        timeout: 5000
      });

      /*
       * Clear existing search.
       */
      await this.searchInput.fill('');

      /*
       * Enter new value.
       */
      await this.searchInput.fill(value);

      /*
       * Press Enter.
       */
      await this.searchInput.press('Enter').catch(() => {});

      /*
       * Give the application a small amount of time
       * to start processing the request.
       */
      await this.page.waitForTimeout(500);

      return true;
    } catch (error) {
      const message = String(error);

      console.log(
        `❌ Search failed: ${message}`
      );

      this.fail(
        `Search "${value}" failed: ${message}`
      );

      return false;
    }
  }

  /**
   * Wait for positive search result.
   *
   * We wait until either:
   * - rows exist
   * - no-data message appears
   */
  private async waitForPositiveSearchResult(): Promise<void> {
    if (!this.isPageAvailable()) {
      return;
    }

    try {
      await this.page.waitForFunction(() => {
        const rows =
          document.querySelectorAll(
            'table tbody tr'
          );

        const noData =
          Array.from(
            document.querySelectorAll('*')
          ).some(
            element =>
              element.textContent?.trim() ===
              'No data available'
          );

        return rows.length > 0 || noData;
      }, undefined, {
        timeout: 5000
      });
    } catch {
      // Caller validates final state.
    }
  }

  /**
   * Wait for negative search result.
   *
   * This is the important fix.
   *
   * We DO NOT simply call rows.count() immediately.
   *
   * The old 20 rows may still be displayed while the
   * application is processing the search.
   *
   * We wait until:
   *
   * 1. No data message appears
   * OR
   * 2. Rows become zero
   *
   * If the application keeps showing 20 rows after
   * the search has finished, we correctly report FAIL.
   */
  private async waitForNegativeSearchResult(): Promise<{
    noData: boolean;
    rowCount: number;
  }> {
    if (!this.isPageAvailable()) {
      return {
        noData: false,
        rowCount: 0
      };
    }

    let lastRowCount = -1;
    let stableCount = 0;

    for (let attempt = 0; attempt < 20; attempt++) {
      if (!this.isPageAvailable()) {
        return {
          noData: false,
          rowCount: 0
        };
      }

      const noDataVisible =
        await this.noDataMessage
          .isVisible()
          .catch(() => false);

      const rowCount =
        await this.getRows().count();

      /*
       * Best case:
       * Application explicitly shows "No data available".
       */
      if (noDataVisible) {
        return {
          noData: true,
          rowCount: 0
        };
      }

      /*
       * Best case:
       * Table becomes empty.
       */
      if (rowCount === 0) {
        return {
          noData: true,
          rowCount: 0
        };
      }

      /*
       * Track whether row count has become stable.
       *
       * If the application continues showing the same 20
       * rows for several checks, we consider the search
       * completed and validate those rows.
       */
      if (rowCount === lastRowCount) {
        stableCount++;
      } else {
        stableCount = 0;
      }

      lastRowCount = rowCount;

      /*
       * Give the UI/API time to update.
       */
      await this.page.waitForTimeout(250);

      /*
       * Once the result is stable for several checks,
       * stop waiting.
       */
      if (stableCount >= 5) {
        return {
          noData: false,
          rowCount
        };
      }
    }

    const finalRowCount =
      await this.getRows().count();

    const finalNoData =
      await this.noDataMessage
        .isVisible()
        .catch(() => false);

    return {
      noData: finalNoData || finalRowCount === 0,
      rowCount: finalRowCount
    };
  }

  /**
   * Reset search.
   */
  async resetSearch(): Promise<void> {
    if (!this.isPageAvailable()) {
      return;
    }

    try {
      await this.searchInput.waitFor({
        state: 'visible',
        timeout: 3000
      });

      await this.searchInput.fill('');

      await this.searchInput.press('Enter')
        .catch(() => {});

      /*
       * Wait until the normal table is available again.
       */
      await this.waitForPositiveSearchResult();

    } catch (error) {
      console.log(
        `⚠️ Could not reset search: ${error}`
      );
    }
  }

  /**
   * Positive search validation.
   */
  private async searchAndValidate(
    searchValue: string,
    columnName: string,
    expectedValue: string
  ): Promise<void> {
    if (!searchValue || !expectedValue) {
      Reporter.validateData(
        expectedValue || 'Value',
        'No data to search',
        `${columnName} Search`,
        this.testInfo
      );

      this.fail(
        `${columnName} Search: No data available`
      );

      return;
    }

    try {
      const searchStarted =
        await this.performSearch(searchValue);

      if (!searchStarted) {
        return;
      }

      await this.waitForPositiveSearchResult();

      const rows = this.getRows();
      const rowCount = await rows.count();

      let found = false;

      for (let i = 0; i < rowCount; i++) {
        const rowText =
          (await rows.nth(i).textContent()) || '';

        if (
          rowText
            .toLowerCase()
            .includes(expectedValue.toLowerCase())
        ) {
          found = true;
          break;
        }
      }

      if (found) {
        console.log(
          `✅ ${columnName} Search: "${searchValue}" found`
        );

        Reporter.validateData(
          'Found',
          'Found',
          `${columnName} Search: "${searchValue}"`,
          this.testInfo
        );
      } else {
        console.log(
          `❌ ${columnName} Search: "${searchValue}" not found`
        );

        Reporter.validateData(
          'Found',
          'Not Found',
          `${columnName} Search: "${searchValue}"`,
          this.testInfo
        );

        this.fail(
          `${columnName} Search: Expected "${expectedValue}" not found`
        );
      }

      await this.resetSearch();
    } catch (error) {
      const message = String(error);

      Reporter.validateData(
        expectedValue,
        `Error: ${message}`,
        `${columnName} Search`,
        this.testInfo
      );

      this.fail(
        `${columnName} Search failed: ${message}`
      );

      await this.resetSearch();
    }
  }

  /**
   * Negative search validation.
   */
  private async searchAndVerifyNoData(
    searchValue: string,
    testName: string
  ): Promise<void> {
    try {
      const searchStarted =
        await this.performSearch(searchValue);

      if (!searchStarted) {
        return;
      }

      const result =
        await this.waitForNegativeSearchResult();

      if (result.noData) {
        console.log(
          `✅ ${testName}: No data found as expected`
        );

        Reporter.validateData(
          '0 results',
          '0 results',
          testName,
          this.testInfo
        );
      } else {
        console.log(
          `❌ ${testName}: Found ${result.rowCount} result(s), expected 0`
        );

        Reporter.validateData(
          '0 results',
          `${result.rowCount} result(s) found`,
          testName,
          this.testInfo
        );

        this.fail(
          `${testName}: Expected no data, but found ${result.rowCount} row(s)`
        );
      }

      await this.resetSearch();
    } catch (error) {
      const message = String(error);

      console.log(
        `❌ ${testName} failed: ${message}`
      );

      Reporter.validateData(
        'No Data Found',
        `Error: ${message}`,
        testName,
        this.testInfo
      );

      this.fail(
        `${testName} failed: ${message}`
      );

      await this.resetSearch();
    }
  }

  /**
   * Search by ID.
   */
  async searchByID(): Promise<void> {
    const { id } =
      await this.getFirstRecordData();

    if (!id) {
      Reporter.validateData(
        'ID value',
        'No data found',
        'ID Search',
        this.testInfo
      );

      this.fail(
        'ID Search: No data found'
      );

      return;
    }

    await this.searchAndValidate(
      id,
      'ID',
      id
    );
  }

  /**
   * Search by Name.
   */
  async searchByName(): Promise<void> {
    const { name } =
      await this.getFirstRecordData();

    if (!name) {
      Reporter.validateData(
        'Name value',
        'No data found',
        'Name Search',
        this.testInfo
      );

      this.fail(
        'Name Search: No data found'
      );

      return;
    }

    await this.searchAndValidate(
      name,
      'Name',
      name
    );
  }

  /**
   * Search by Description.
   */
  async searchByDescription(): Promise<void> {
    const { description } =
      await this.getFirstRecordData();

    if (!description) {
      Reporter.validateData(
        'Description value',
        'No data found',
        'Description Search',
        this.testInfo
      );

      this.fail(
        'Description Search: No data found'
      );

      return;
    }

    await this.searchAndValidate(
      description,
      'Description',
      description
    );
  }

  /**
   * Search by Created Date.
   */
  async searchByCreated(): Promise<void> {
    const { created } =
      await this.getFirstRecordData();

    if (!created) {
      Reporter.validateData(
        'Created Date value',
        'No data found',
        'Created Date Search',
        this.testInfo
      );

      this.fail(
        'Created Date Search: No data found'
      );

      return;
    }

    await this.searchAndValidate(
      created,
      'Created Date',
      created
    );
  }

  /**
   * Search by Status.
   */
  async searchByStatus(): Promise<void> {
    const { status } =
      await this.getFirstRecordData();

    if (!status) {
      Reporter.validateData(
        'Status value',
        'No data found',
        'Status Search',
        this.testInfo
      );

      this.fail(
        'Status Search: No data found'
      );

      return;
    }

    await this.searchAndValidate(
      status,
      'Status',
      status
    );
  }

  /**
   * Negative search:
   * Inactive status should return no records.
   */
  async searchInactiveStatus(): Promise<void> {
    await this.searchAndVerifyNoData(
      'Inactive',
      'Inactive Status Search'
    );
  }

  /**
   * Negative search:
   * Invalid search value should return no records.
   */
  async invalidSearch(): Promise<void> {
    await this.searchAndVerifyNoData(
      'random_invalid_value_123',
      'Invalid Search'
    );
  }

  /**
   * Negative search:
   * Non-existent name should return no records.
   */
  async searchByNonExistentName(): Promise<void> {
    await this.searchAndVerifyNoData(
      'NonExistentRooftopNameXYZ',
      'Non-existent Name Search'
    );
  }

  /**
   * Negative search:
   * Non-existent ID should return no records.
   */
  async searchByNonExistentID(): Promise<void> {
    await this.searchAndVerifyNoData(
      'ID_999999',
      'Non-existent ID Search'
    );
  }

  /**
   * Store custom failure.
   */
  private fail(message: string): void {
    this.failures.push(message);

    console.log(
      `❌ ${message}`
    );
  }

  /**
   * Check whether custom failures exist.
   */
  hasFailures(): boolean {
    return this.failures.length > 0;
  }

  /**
   * Get failures.
   */
  getFailures(): string[] {
    return this.failures;
  }
}