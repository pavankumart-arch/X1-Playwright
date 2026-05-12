import {
  Page,
  Locator,
  expect,
  TestInfo
} from '@playwright/test';

import AddResellerdata
from '../../testdata/AddResellerData.json';

import { logAndValidate }
from '../utils/reportUtil';

export class ResellerSearch {

  page: Page;

  searchInput: Locator;

  noDataMessage: Locator;

  nextButton: Locator;

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
      page.getByRole(
        'button',
        { name: 'Next' }
      );
  }

  // =====================================================
  // SEARCH FUNCTION
  // =====================================================

  async performSearch(
    value: string
  ) {

    if (!value) {

      expect.soft(
        false,
        '❌ Search value is empty'
      ).toBeTruthy();

      return;
    }

    await this.searchInput.waitFor({
      state: 'visible'
    });

    await this.searchInput.fill('');

    await this.searchInput.fill(
      value
    );

    await this.searchInput.press(
      'Enter'
    );

    await this.page.waitForTimeout(
      2000
    );
  }

  // =====================================================
  // GET ROWS
  // =====================================================

  private getRows() {

    return this.page.locator(
      'table tbody tr'
    );
  }

  // =====================================================
  // WAIT FOR RESULTS
  // =====================================================

  async waitForResults() {

    await Promise.race([

      this.getRows()
        .first()
        .waitFor({
          state: 'visible',
          timeout: 10000
        }),

      this.noDataMessage.waitFor({
        state: 'visible',
        timeout: 10000
      })
    ]);
  }

  // =====================================================
  // GET COLUMN DATA
  // =====================================================

  private async getColumnData(
    index: number
  ): Promise<string[]> {

    const values: string[] = [];

    while (true) {

      const rows =
        this.getRows();

      const count =
        await rows.count();

      for (
        let i = 0;
        i < count;
        i++
      ) {

        const text =
          (
            await rows
              .nth(i)
              .locator('td')
              .nth(index)
              .textContent()
          )?.trim();

        if (text)
          values.push(text);
      }

      const disabled =
        await this.nextButton
          .isDisabled()
          .catch(() => true);

      if (disabled)
        break;

      await this.nextButton.click();

      await this.page.waitForTimeout(
        2000
      );
    }

    return values;
  }

  // =====================================================
  // VALIDATE COLUMN
  // =====================================================

  private async validateColumn(
    index: number,
    expected: string,
    testInfo: TestInfo,
    stepName: string,
    exact = false
  ) {

    await this.waitForResults();

    const rows =
      this.getRows();

    const count =
      await rows.count();

    let found = false;

    let actual =
      'No Data Found';

    for (
      let i = 0;
      i < count;
      i++
    ) {

      const row =
        rows.nth(i);

      const cells =
        row.locator('td');

      const cellCount =
        await cells.count();

      if (index >= cellCount)
        continue;

      const text =
        (
          await cells
            .nth(index)
            .textContent()
        )?.trim() || '';

      if (
        exact
          ? text === expected
          : text
              .toLowerCase()
              .includes(
                expected.toLowerCase()
              )
      ) {

        found = true;

        actual = text;

        break;
      }
    }

    logAndValidate(
      {
        step: stepName,
        expected,
        actual
      },
      testInfo
    );

    expect
      .soft(found)
      .toBeTruthy();
  }

  // =====================================================
  // NEGATIVE SEARCH VALIDATION
  // =====================================================

  private async verifyNoData(
    value: string,
    testInfo: TestInfo,
    stepName: string
  ) {

    await this.performSearch(
      value
    );

    await this.waitForResults();

    const rows =
      await this.getRows()
        .count();

    const isNoData =
      await this.noDataMessage
        .isVisible()
        .catch(() => false);

    const passed =
      rows === 0 || isNoData;

    logAndValidate(
      {
        step: stepName,
        expected:
          'No Data Found',
        actual: passed
          ? 'No Data Found'
          : `${rows} Rows Found`
      },
      testInfo
    );

    expect
      .soft(passed)
      .toBeTruthy();
  }

  // =====================================================
  // POSITIVE SEARCH TESTS
  // =====================================================

  async searchByID(
    testInfo: TestInfo
  ) {

    const data =
      await this.getColumnData(0);

    if (!data.length) {

      expect.soft(
        false,
        '❌ No ID data found'
      ).toBeTruthy();

      return;
    }

    await this.performSearch(
      data[0]
    );

    await this.validateColumn(
      0,
      data[0],
      testInfo,
      'Search by ID',
      true
    );
  }

  async searchByName(
    testInfo: TestInfo,
    name?: string
  ) {

    const value =
      name ??
      (
        await this.getColumnData(1)
      )[0];

    if (!value) {

      expect.soft(
        false,
        '❌ No Name data found'
      ).toBeTruthy();

      return;
    }

    await this.performSearch(
      value
    );

    await this.validateColumn(
      1,
      value,
      testInfo,
      'Search by Name'
    );
  }

  async searchByDescription(
    testInfo: TestInfo
  ) {

    const data =
      await this.getColumnData(2);

    if (!data.length) {

      expect.soft(
        false,
        '❌ No Description data found'
      ).toBeTruthy();

      return;
    }

    await this.performSearch(
      data[0]
    );

    await this.validateColumn(
      2,
      data[0],
      testInfo,
      'Search by Description'
    );
  }

  async searchByCreated(
    testInfo: TestInfo
  ) {

    const data =
      await this.getColumnData(3);

    if (!data.length) {

      expect.soft(
        false,
        '❌ No Created data found'
      ).toBeTruthy();

      return;
    }

    await this.performSearch(
      data[0]
    );

    await this.validateColumn(
      3,
      data[0],
      testInfo,
      'Search by Created',
      true
    );
  }

  async searchByStatus(
    testInfo: TestInfo
  ) {

    const data =
      await this.getColumnData(4);

    if (!data.length) {

      expect.soft(
        false,
        '❌ No Status data found'
      ).toBeTruthy();

      return;
    }

    await this.performSearch(
      data[0]
    );

    await this.validateColumn(
      4,
      data[0],
      testInfo,
      'Search by Status',
      true
    );
  }

  // =====================================================
  // NEGATIVE SEARCH TESTS
  // =====================================================

  async searchByBillingName(
    testInfo: TestInfo
  ) {

    await this.verifyNoData(
      AddResellerdata.BillingName,
      testInfo,
      'Search by Billing Name'
    );
  }

  async searchBySalesPerson(
    testInfo: TestInfo
  ) {

    await this.verifyNoData(
      AddResellerdata.SalesPerson,
      testInfo,
      'Search by Sales Person'
    );
  }

  async searchByTTOptions(
    testInfo: TestInfo
  ) {

    await this.verifyNoData(
      AddResellerdata.TTOptions,
      testInfo,
      'Search by TT Options'
    );
  }

  async searchByAppID(
    testInfo: TestInfo
  ) {

    await this.verifyNoData(
      AddResellerdata.AppID,
      testInfo,
      'Search by App ID'
    );
  }

  async searchByPlayerSize(
    testInfo: TestInfo
  ) {

    await this.verifyNoData(
      AddResellerdata.PlayerSize.toString(),
      testInfo,
      'Search by Player Size'
    );
  }

  async invalidSearch(
    testInfo: TestInfo
  ) {

    await this.verifyNoData(
      'random_invalid_value_123',
      testInfo,
      'Invalid Search'
    );
  }
}