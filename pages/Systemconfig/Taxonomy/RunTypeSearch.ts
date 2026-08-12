
import {
  Page,
  Locator,
  TestInfo,
  expect
} from '@playwright/test';

import { logAndValidate } from '../../utils/reportUtil';
import { RunTypeColumns } from './RunTypeColumns';


export class RunTypeSearch {

  page: Page;
  testInfo: TestInfo;

  searchBox: Locator;
  noDataMessage: Locator;

  failures: string[] = [];


  constructor(
    page: Page,
    testInfo: TestInfo
  ) {

    this.page = page;
    this.testInfo = testInfo;

    this.searchBox =
      page.getByPlaceholder('Search...').first();

    this.noDataMessage =
      page.getByText('No data available', {
        exact: false
      });
  }


  // =========================================================
  // OPEN RUNTYPE PAGE
  // =========================================================

  async openRunTypes(): Promise<void> {

    const navigation =
      new RunTypeColumns(this.page);

    await navigation.openApp('Admin');

    await navigation.openModule('Modules');

    await expect(
      this.page
        .locator('table thead th')
        .filter({
          hasText: 'Title'
        })
    ).toBeVisible({
      timeout: 15000
    });

    console.log(
      '✅ RunType page opened'
    );
  }


  // =========================================================
  // GET TABLE ROWS
  // =========================================================

  private getRows(): Locator {

    return this.page.locator(
      'table tbody tr'
    );
  }


  // =========================================================
  // PERFORM SEARCH
  // =========================================================

  async performSearch(
    value: string
  ): Promise<void> {

    await expect(
      this.searchBox
    ).toBeVisible({
      timeout: 10000
    });


    await this.searchBox.click();


    await this.searchBox.press(
      'Control+A'
    );


    await this.searchBox.press(
      'Delete'
    );


    await this.searchBox.fill(
      value
    );


    /*
     * Search is dynamically handled by the UI.
     *
     * Do not use networkidle/domcontentloaded here.
     * Do not use tableRows because this class does
     * not have a tableRows property.
     */

    await this.page.waitForTimeout(300);
  }


  // =========================================================
  // RESET SEARCH
  // =========================================================

  async resetSearch(): Promise<void> {

    await expect(
      this.searchBox
    ).toBeVisible({
      timeout: 10000
    });


    await this.searchBox.click();


    await this.searchBox.press(
      'Control+A'
    );


    await this.searchBox.press(
      'Delete'
    );


    await this.page.waitForTimeout(300);
  }


  // =========================================================
  // WAIT FOR SEARCH RESULTS
  // =========================================================

  async waitForResults(): Promise<void> {

    const rows =
      this.getRows();


    await Promise.race([

      rows
        .first()
        .waitFor({
          state: 'visible',
          timeout: 5000
        }),

      this.noDataMessage
        .waitFor({
          state: 'visible',
          timeout: 5000
        })

    ]).catch(() => {});
  }


  // =========================================================
  // GET FIRST RECORD
  // =========================================================

  async getFirstRecordData() {

    await this.resetSearch();

    await this.waitForResults();


    const row =
      this.getRows().first();


    await row.waitFor({
      state: 'visible',
      timeout: 5000
    });


    const cells =
      row.locator('td');


    return {

      id:
        (
          await cells
            .nth(0)
            .textContent()
        )?.trim() || '',


      app:
        (
          await cells
            .nth(1)
            .textContent()
        )?.trim() || '',


      module:
        (
          await cells
            .nth(2)
            .textContent()
        )?.trim() || '',


      title:
        (
          await cells
            .nth(3)
            .textContent()
        )?.trim() || '',


      runType:
        (
          await cells
            .nth(4)
            .textContent()
        )?.trim() || '',


      className:
        (
          await cells
            .nth(5)
            .textContent()
        )?.trim() || '',


      method:
        (
          await cells
            .nth(6)
            .textContent()
        )?.trim() || ''
    };
  }


  // =========================================================
  // COMMON POSITIVE SEARCH
  // =========================================================

  async searchAndValidate(
    value: string,
    testName: string
  ): Promise<void> {

    if (!value) {

      this.fail(
        `${testName} failed - Search value is empty`
      );

      return;
    }


    await this.performSearch(
      value
    );


    await this.waitForResults();


    const rows =
      this.getRows();


    const count =
      await rows.count();


    let found = false;


    for (
      let i = 0;
      i < count;
      i++
    ) {

      const text =
        await rows
          .nth(i)
          .innerText();


      if (
        text
          .toLowerCase()
          .includes(
            value.toLowerCase()
          )
      ) {

        found = true;

        break;
      }
    }


    logAndValidate({

      step: testName,

      expected: value,

      actual:
        found
          ? value
          : 'Not Found',

      isSummary: false

    }, this.testInfo);


    if (!found) {

      this.fail(
        `${testName} failed`
      );

    } else {

      console.log(
        `✅ ${testName} passed`
      );
    }


    await this.resetSearch();
  }


  // =========================================================
  // VERIFY NO DATA
  // =========================================================

  async verifyNoData(
    value: string,
    testName: string
  ): Promise<void> {

    await this.performSearch(
      value
    );


    await this.waitForResults();


    const noData =
      await this.noDataMessage
        .isVisible()
        .catch(() => false);


    logAndValidate({

      step: testName,

      expected: 'No Data',

      actual:
        noData
          ? 'No Data'
          : 'Data Found',

      isSummary: false

    }, this.testInfo);


    if (!noData) {

      this.fail(
        `${testName} failed`
      );

    } else {

      console.log(
        `✅ ${testName} passed`
      );
    }


    await this.resetSearch();
  }


  // =========================================================
  // POSITIVE SEARCH TESTS
  // =========================================================

  async searchByID(): Promise<void> {

    const {
      id
    } =
      await this.getFirstRecordData();


    await this.searchAndValidate(
      id,
      'ID Search'
    );
  }


  async searchByTitle(): Promise<void> {

    const {
      title
    } =
      await this.getFirstRecordData();


    await this.searchAndValidate(
      title,
      'Title Search'
    );
  }


  async searchByRunType(): Promise<void> {

    const {
      runType
    } =
      await this.getFirstRecordData();


    await this.searchAndValidate(
      runType,
      'RunType Search'
    );
  }


  async searchByClass(): Promise<void> {

    const {
      className
    } =
      await this.getFirstRecordData();


    await this.searchAndValidate(
      className,
      'Class Search'
    );
  }


  async searchByMethod(): Promise<void> {

    const {
      method
    } =
      await this.getFirstRecordData();


    await this.searchAndValidate(
      method,
      'Method Search'
    );
  }


  // =========================================================
  // NEGATIVE SEARCH TESTS
  // =========================================================

  async invalidSearch(): Promise<void> {

    await this.verifyNoData(
      'invalid_runtype_12345',
      'Invalid Search'
    );
  }


  async nonExistentTitle(): Promise<void> {

    await this.verifyNoData(
      'NoRunTypeXYZ',
      'Non-existent Title Search'
    );
  }


  async nonExistentID(): Promise<void> {

    await this.verifyNoData(
      '999999',
      'Non-existent ID Search'
    );
  }


  // =========================================================
  // FAILURE HANDLING
  // =========================================================

  fail(
    message: string
  ): void {

    this.failures.push(
      message
    );


    console.log(
      `❌ ${message}`
    );
  }


  hasFailures(): boolean {

    return (
      this.failures.length > 0
    );
  }


  getFailures(): string[] {

    return [
      ...this.failures
    ];
  }


  // =========================================================
  // SEARCH SUMMARY
  // =========================================================

  getSearchSummary(): string {

    if (
      this.failures.length === 0
    ) {

      return 'No Search Failures';
    }


    return this.failures.join(
      '\n'
    );
  }

}
