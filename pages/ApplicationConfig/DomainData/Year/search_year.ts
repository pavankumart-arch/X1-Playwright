import {
  Page,
  Locator,
  TestInfo
} from '@playwright/test';

import { logAndValidate } from '../../../../utils/reportUtil';

export class YearSearch {

  page: Page;
  searchInput: Locator;
  noDataMessage: Locator;
  nextButton: Locator;
  previousButton: Locator;

  private readonly tableRowsSelector =
    'table tbody tr';

  private readonly nextButtonSelector =
    'button:has-text("Next")';

  private readonly previousButtonSelector =
    'button:has-text("Previous")';

  constructor(page: Page) {

    this.page = page;

    this.searchInput =
      page.locator(
        'input.table-search__input'
      );

    this.noDataMessage =
      page.locator(
        'td.table-body__cell--empty p'
      );

    this.nextButton =
      page.locator(
        this.nextButtonSelector
      );

    this.previousButton =
      page.locator(
        this.previousButtonSelector
      );
  }

  // =====================================================
  // SEARCH
  // =====================================================

  async performSearch(value: string) {

    if (this.page.isClosed()) return;

    await this.searchInput.waitFor({
      state: 'visible',
      timeout: 10000
    });

    await this.searchInput.clear();

    await this.searchInput.fill(value);

    await this.searchInput.press('Enter');

    await this.page.waitForLoadState('networkidle');

    await this.page.waitForTimeout(500);
  }

  // =====================================================
  // RESET SEARCH
  // =====================================================

  async resetSearch() {

    if (this.page.isClosed()) return;

    await this.searchInput.clear();

    await this.searchInput.press('Enter');

    await this.page.waitForLoadState('networkidle');

    await this.page.waitForTimeout(500);
  }

  // =====================================================
  // GO TO FIRST PAGE
  // =====================================================

  async goToFirstPage() {

    try {

      while (
        await this.previousButton
          .isVisible()
          .catch(() => false)
      ) {

        const disabled =
          await this.previousButton
            .isDisabled()
            .catch(() => true);

        if (disabled) break;

        await this.previousButton.click();

        await this.page.waitForLoadState('networkidle');

        await this.page.waitForTimeout(500);
      }

    } catch {

      console.log(
        'Pagination reset skipped'
      );

    }
  }

  // =====================================================
  // GET TABLE ROWS
  // =====================================================

  private getRows() {

    return this.page.locator(
      this.tableRowsSelector
    );
  }

  // =====================================================
  // SEARCH AND FIND RECORD
  // =====================================================

  private async searchAndFindRecord(
    searchValue: string,
    columnIndex: number
  ): Promise<boolean> {

    try {

      await this.goToFirstPage();

      await this.performSearch(
        searchValue
      );

      let currentPage = 1;

      const maxPages = 50;

      while (currentPage <= maxPages) {

        const rows =
          this.getRows();

        const rowCount =
          await rows.count();

        const isNoData =
          await this.noDataMessage
            .isVisible()
            .catch(() => false);

        if (
          rowCount === 0 ||
          isNoData
        ) {

          console.log(
            `❌ No results found for ${searchValue}`
          );

          return false;
        }

        for (
          let i = 0;
          i < rowCount;
          i++
        ) {

          const cell =
            rows
              .nth(i)
              .locator('td')
              .nth(columnIndex);

          const text =
            (
              await cell.textContent()
            )?.trim() || '';

          if (
            text
              .toLowerCase()
              .includes(
                searchValue.toLowerCase()
              )
          ) {

            console.log(
              `✅ Record found : ${searchValue}`
            );

            return true;
          }
        }

        const isNextVisible =
          await this.nextButton
            .isVisible()
            .catch(() => false);

        const isNextDisabled =
          await this.nextButton
            .isDisabled()
            .catch(() => true);

        if (
          !isNextVisible ||
          isNextDisabled
        ) break;

        await this.nextButton.click();

        await this.page.waitForLoadState(
          'networkidle'
        );

        await this.page.waitForTimeout(500);

        currentPage++;
      }

      return false;

    } catch (error: any) {

      console.log(
        `⚠️ Search failed : ${error.message}`
      );

      return false;
    }
  }

  // =====================================================
  // COMMON SEARCH VALIDATION
  // =====================================================

  private async searchAndValidate(
    columnIndex: number,
    fieldName: string,
    testInfo: TestInfo
  ): Promise<boolean> {

    try {

      await this.goToFirstPage();

      const rows =
        this.getRows();

      const count =
        await rows.count();

      if (count === 0) {

        logAndValidate(
          {
            step: `Search by ${fieldName}`,
            expected: 'Search Results Found',
            actual: 'No Data Available'
          },
          testInfo
        );

        return false;
      }

      const value =
        (
          await rows
            .first()
            .locator('td')
            .nth(columnIndex)
            .textContent()
        )?.trim();

      if (!value) {

        logAndValidate(
          {
            step: `Search by ${fieldName}`,
            expected: 'Search Results Found',
            actual: 'No Value Found'
          },
          testInfo
        );

        return false;
      }

      console.log(
        `🔍 Searching ${fieldName} : ${value}`
      );

      const found =
        await this.searchAndFindRecord(
          value,
          columnIndex
        );

      const actual =
        found
          ? 'Search Results Found'
          : 'No Data Found';

      logAndValidate(
        {
          step: `Search by ${fieldName}`,
          expected: 'Search Results Found',
          actual
        },
        testInfo
      );

      await this.resetSearch();

      return found;

    } catch (error: any) {

      logAndValidate(
        {
          step: `Search by ${fieldName}`,
          expected: 'Search Results Found',
          actual: `Error : ${error.message}`
        },
        testInfo
      );

      return false;
    }
  }

  // =====================================================
  // SEARCH BY ID
  // =====================================================

  async searchByID(
    testInfo: TestInfo
  ): Promise<boolean> {

    return await this.searchAndValidate(
      0,
      'ID',
      testInfo
    );
  }

  // =====================================================
  // SEARCH BY YEAR
  // =====================================================

  async searchByYear(
    testInfo: TestInfo
  ): Promise<boolean> {

    return await this.searchAndValidate(
      1,
      'Year',
      testInfo
    );
  }

  // =====================================================
  // SEARCH BY CREATED DATE
  // =====================================================

  async searchByCreatedDate(
    testInfo: TestInfo
  ): Promise<boolean> {

    return await this.searchAndValidate(
      2,
      'Created',
      testInfo
    );
  }

  // =====================================================
  // SEARCH BY UPDATED DATE
  // =====================================================

  async searchByUpdatedDate(
    testInfo: TestInfo
  ): Promise<boolean> {

    return await this.searchAndValidate(
      3,
      'Updated',
      testInfo
    );
  }

  // =====================================================
  // SEARCH BY STATUS
  // =====================================================

  async searchByStatus(
    testInfo: TestInfo
  ): Promise<boolean> {

    try {

      const statuses = [
        'Active',
        'Inactive'
      ];

      let statusFound = false;

      for (const status of statuses) {

        await this.goToFirstPage();

        console.log(
          `🔍 Searching Status : ${status}`
        );

        const found =
          await this.searchAndFindRecord(
            status,
            4
          );

        const actual =
          found
            ? 'Search Results Found'
            : 'No Data Found';

        logAndValidate(
          {
            step: `Search Status : ${status}`,
            expected: 'Search Results Found',
            actual
          },
          testInfo
        );

        await this.resetSearch();

        if (found) {

          statusFound = true;
        }
      }

      return statusFound;

    } catch (error: any) {

      logAndValidate(
        {
          step: 'Search by Status',
          expected: 'Search Results Found',
          actual: `Error : ${error.message}`
        },
        testInfo
      );

      return false;
    }
  }

  // =====================================================
  // INVALID DATA SEARCH
  // =====================================================

  async invalidYearSearch(
    testInfo: TestInfo
  ): Promise<boolean> {

    try {

      if (this.page.isClosed()) {
        return false;
      }

      const invalidData =
        'invalid_year_9999';

      await this.performSearch(
        invalidData
      );

      const rowCount =
        await this.getRows().count();

      const isNoData =
        await this.noDataMessage
          .isVisible()
          .catch(() => false);

      const actual =
        rowCount === 0 || isNoData
          ? 'No Data Found'
          : 'Data Found';

      logAndValidate(
        {
          step: 'Invalid Data Search',
          expected: 'No Data Found',
          actual
        },
        testInfo
      );

      await this.resetSearch();

      return actual === 'No Data Found';

    } catch (error: any) {

      logAndValidate(
        {
          step: 'Invalid Data Search',
          expected: 'No Data Found',
          actual: `Error : ${error.message}`
        },
        testInfo
      );

      return false;
    }
  }

  // =====================================================
  // VERIFY ALL SEARCH SCENARIOS
  // =====================================================

  public async verifyYearSearch(
    testInfo: TestInfo
  ): Promise<void> {

    console.log(
      '\n===================================='
    );
    console.log(
      'YEAR SEARCH VALIDATION STARTED'
    );
    console.log(
      '====================================\n'
    );

    await this.searchByID(testInfo);

    await this.searchByYear(testInfo);

    await this.searchByCreatedDate(testInfo);

    await this.searchByUpdatedDate(testInfo);

    await this.searchByStatus(testInfo);

    await this.invalidYearSearch(testInfo);

    console.log(
      '\n===================================='
    );
    console.log(
      'YEAR SEARCH VALIDATION COMPLETED'
    );
    console.log(
      '====================================\n'
    );
  }
}