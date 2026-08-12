import { Page, Locator, TestInfo } from '@playwright/test';
import { Reporter } from '../../../utils/NewReport';


export class ModelSearch {
  page: Page;
  searchInput: Locator;
  noDataMessage: Locator;
  nextButton: Locator;
  previousButton: Locator;

  private readonly tableRowsSelector = 'table tbody tr';
  private readonly nextButtonSelector = 'button:has-text("Next")';
  private readonly previousButtonSelector = 'button:has-text("Previous")';

  constructor(page: Page) {
    this.page = page;
    this.searchInput = page.locator('input.table-search__input');
    this.noDataMessage = page.locator('td.table-body__cell--empty p');
    this.nextButton = page.locator(this.nextButtonSelector);
    this.previousButton = page.locator(this.previousButtonSelector);
  }

  private getRows() {
    return this.page.locator(this.tableRowsSelector);
  }

  async performSearch(value: string) {
    await this.searchInput.waitFor({
      state: 'visible',
      timeout: 10000
    });

    await this.searchInput.fill('');
    await this.searchInput.fill(value);
    await this.searchInput.press('Enter');

    await this.page.waitForTimeout(500);
  }

  async resetSearch() {
    await this.searchInput.fill('');
    await this.searchInput.press('Enter');

    await this.page.waitForTimeout(500);
  }

  async goToFirstPage() {
    try {
      while (
        await this.previousButton.isVisible().catch(() => false)
      ) {
        const disabled = await this.previousButton
          .isDisabled()
          .catch(() => true);

        if (disabled) {
          break;
        }

        await this.previousButton.click();
        await this.page.waitForTimeout(300);
      }
    } catch {
      // ignore
    }
  }

  private async searchAndFindRecord(
    searchValue: string,
    columnIndex: number
  ): Promise<boolean> {
    try {
      console.log(`🔍 Searching for: ${searchValue}`);

      await this.performSearch(searchValue);
      await this.goToFirstPage();

      const maxPages = 5;
      let currentPage = 1;

      while (currentPage <= maxPages) {
        console.log(`Checking page ${currentPage}`);

        const rows = this.getRows();
        const rowCount = await rows.count();

        const isNoData = await this.noDataMessage
          .isVisible()
          .catch(() => false);

        if (rowCount === 0 || isNoData) {
          console.log(`❌ No results found for ${searchValue}`);
          return false;
        }

        for (let i = 0; i < rowCount; i++) {
          const cellText =
            (
              await rows
                .nth(i)
                .locator('td')
                .nth(columnIndex)
                .textContent()
            )?.trim() || '';

          if (
            cellText
              .toLowerCase()
              .includes(searchValue.toLowerCase())
          ) {
            console.log(`✅ Record found : ${searchValue}`);
            return true;
          }
        }

        const nextVisible = await this.nextButton
          .isVisible()
          .catch(() => false);

        const nextDisabled = await this.nextButton
          .isDisabled()
          .catch(() => true);

        if (!nextVisible || nextDisabled) {
          break;
        }

        await this.nextButton.click();
        await this.page.waitForTimeout(300);

        currentPage++;
      }

      console.log(`❌ Record not found : ${searchValue}`);
      return false;
    } catch (error: any) {
      console.log(`⚠️ Search failed : ${error.message}`);
      return false;
    }
  }

  private async searchAndValidate(
    columnIndex: number,
    fieldName: string,
    testInfo: TestInfo
  ): Promise<boolean> {
    try {
      await this.resetSearch();
      await this.goToFirstPage();

      const rows = this.getRows();
      const rowCount = await rows.count();

      if (rowCount === 0) {
        Reporter.validateData(
          'Search Results Found',
          'No Data Available',
          `Search by ${fieldName}`,
          testInfo
        );

        return false;
      }

      const searchValue =
        (
          await rows
            .first()
            .locator('td')
            .nth(columnIndex)
            .textContent()
        )?.trim() || '';

      if (!searchValue) {
        Reporter.validateData(
          'Search Results Found',
          'No Value Found',
          `Search by ${fieldName}`,
          testInfo
        );

        return false;
      }

      console.log(
        `🔍 Searching ${fieldName} : ${searchValue}`
      );

      const found = await this.searchAndFindRecord(
        searchValue,
        columnIndex
      );

      Reporter.validateData(
        'Search Results Found',
        found ? 'Search Results Found' : 'No Data Found',
        `Search by ${fieldName}`,
        testInfo
      );

      await this.resetSearch();

      return found;
    } catch (error: any) {
      Reporter.validateData(
        'Search Results Found',
        `Error : ${error.message}`,
        `Search by ${fieldName}`,
        testInfo
      );

      return false;
    }
  }

  async searchByID(testInfo: TestInfo): Promise<boolean> {
    return await this.searchAndValidate(
      0,
      'ID',
      testInfo
    );
  }

  async searchByModelName(
    
    testInfo: TestInfo
  ): Promise<boolean> {
    return await this.searchAndValidate(
      1,
      'Model',
      testInfo
    );
  }
  async Modelnameforsort(
    modelName: string,
    testInfo: TestInfo
  ): Promise<boolean> {
    try {
      await this.resetSearch();
      await this.goToFirstPage();

      console.log(`🔍 Searching Model : ${modelName}`);

      const found = await this.searchAndFindRecord(
        modelName,
        1
      );

      Reporter.validateData(
        'Search Results Found',
        found ? 'Search Results Found' : 'No Data Found',
        `Search by Model : ${modelName}`,
        testInfo
      );

      await this.resetSearch();

      return found;
    } catch (error: any) {
      Reporter.validateData(
        'Search Results Found',
        `Error : ${error.message}`,
        `Search by Model : ${modelName}`,
        testInfo
      );

      return false;
    }
  }
  async searchByCreatedDate(
    testInfo: TestInfo
  ): Promise<boolean> {
    try {
      await this.resetSearch();
      await this.goToFirstPage();

      const rows = this.getRows();

      const createdValue =
        (
          await rows
            .first()
            .locator('td')
            .nth(2)
            .textContent()
        )?.trim() || '';

      if (!createdValue) {
        return false;
      }

      const dateOnly = createdValue.split(' ')[0];

      console.log(
        `🔍 Searching Created Date : ${dateOnly}`
      );

      const found = await this.searchAndFindRecord(
        dateOnly,
        2
      );

      Reporter.validateData(
        'Search Results Found',
        found ? 'Search Results Found' : 'No Data Found',
        'Search by Created',
        testInfo
      );

      await this.resetSearch();

      return found;
    } catch (error: any) {
      Reporter.validateData(
        'Search Results Found',
        `Error : ${error.message}`,
        'Search by Created',
        testInfo
      );

      return false;
    }
  }

  async searchByStatus(
    testInfo: TestInfo
  ): Promise<boolean> {
    try {
      const statuses = ['Active', 'Inactive'];
      let foundStatus = false;

      for (const status of statuses) {
        await this.resetSearch();

        console.log(`🔍 Searching Status : ${status}`);

        const found = await this.searchAndFindRecord(
          status,
          3
        );

        Reporter.validateData(
          'Search Results Found',
          found ? 'Search Results Found' : 'No Data Found',
          `Search Status : ${status}`,
          testInfo
        );

        if (found) {
          foundStatus = true;
        }
      }

      return foundStatus;
    } catch (error: any) {
      Reporter.validateData(
        'Search Results Found',
        `Error : ${error.message}`,
        'Search by Status',
        testInfo
      );

      return false;
    }
  }

  async invalidNameSearch(
    testInfo: TestInfo
  ): Promise<boolean> {
    try {
      const invalidData = 'invalid_model_123456';

      await this.performSearch(invalidData);

      const rowCount = await this.getRows().count();

      const isNoData = await this.noDataMessage
        .isVisible()
        .catch(() => false);

      const actual =
        rowCount === 0 || isNoData
          ? 'No Data Found'
          : 'Data Found';

      Reporter.validateData(
        'No Data Found',
        actual,
        'Invalid Data Search',
        testInfo
      );

      await this.resetSearch();

      return actual === 'No Data Found';
    } catch (error: any) {
      Reporter.validateData(
        'No Data Found',
        `Error : ${error.message}`,
        'Invalid Data Search',
        testInfo
      );

      return false;
    }

    
  }
}