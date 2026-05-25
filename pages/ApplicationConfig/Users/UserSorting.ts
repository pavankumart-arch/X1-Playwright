import {
  Page,
  Locator,
  TestInfo
} from '@playwright/test';

import {
  logAndValidate
} from '../../utils/reportUtil';

export class UserSortingWithPagination {

  readonly page: Page;
  readonly rows: Locator;
  readonly headers: Locator;
  readonly nextButton: Locator;
  readonly prevButton: Locator;

  constructor(page: Page) {

    this.page = page;

    this.rows =
      page.locator('table tbody tr');

    this.headers =
      page.locator('table thead th');

    this.nextButton =
      page.getByRole('button', { name: 'Next' });

    this.prevButton =
      page.getByRole('button', { name: 'Prev' });
  }

  // ======================================================
  // WAIT FOR TABLE LOAD
  // ======================================================

  async waitForTableLoad() {

    await this.page.waitForLoadState(
      'networkidle'
    );

    await this.rows
      .first()
      .waitFor({
        state: 'visible'
      });
  }

  // ======================================================
  // GO TO FIRST PAGE
  // ======================================================

  async goToFirstPage() {

    while (
      await this.prevButton.isVisible() &&
      await this.prevButton.isEnabled()
    ) {

      const before =
        await this.rows
          .first()
          .textContent();

      await this.prevButton.click();

      await this.page.waitForFunction(
        (oldVal) => {

          const el =
            document.querySelector(
              'table tbody tr:first-child'
            );

          return (
            el &&
            el.textContent !== oldVal
          );
        },
        before
      );
    }
  }

  // ======================================================
  // GET COLUMN INDEX
  // ======================================================

  async getColumnIndex(
    columnName: string
  ): Promise<number> {

    const count =
      await this.headers.count();

    for (let i = 0; i < count; i++) {

      const text =
        (
          await this.headers
            .nth(i)
            .innerText()
        ).trim();

      if (
        text
          .toLowerCase()
          .includes(
            columnName.toLowerCase()
          )
      ) {

        return i;
      }
    }

    throw new Error(
      `Column "${columnName}" not found`
    );
  }

  // ======================================================
  // GET COLUMN VALUES
  // ======================================================

  async getColumnValues(
    columnIndex: number
  ): Promise<any[]> {

    const values: any[] = [];

    const count =
      await this.rows.count();

    for (let i = 0; i < count; i++) {

      const value =
        (
          await this.rows
            .nth(i)
            .locator('td')
            .nth(columnIndex)
            .textContent()
        )?.trim();

      if (value) {

        values.push(
          this.parseValue(value)
        );
      }
    }

    return values;
  }

  // ======================================================
  // PARSE VALUE
  // ======================================================

  parseValue(
    value: string
  ): any {

    const clean =
      value.trim();

    // ==================================================
    // NUMBER
    // ==================================================

    if (
      /^-?\d+(\.\d+)?$/.test(clean)
    ) {

      return Number(clean);
    }

    // ==================================================
    // STRING
    // ==================================================

    return clean.toLowerCase();
  }

  // ======================================================
  // DETECT SORT ORDER
  // ======================================================

  detectOrder(
    values: any[]
  ): 'ASC' | 'DESC' {

    let ascCount = 0;
    let descCount = 0;

    for (
      let i = 0;
      i < values.length - 1;
      i++
    ) {

      const current =
        values[i];

      const next =
        values[i + 1];

      // ==================================================
      // NUMBER
      // ==================================================

      if (
        typeof current === 'number' &&
        typeof next === 'number'
      ) {

        if (current <= next) {
          ascCount++;
        }

        if (current >= next) {
          descCount++;
        }
      }

      // ==================================================
      // STRING
      // ==================================================

      else {

        const comparison =
          String(current).localeCompare(
            String(next),
            undefined,
            {
              numeric: true,
              sensitivity: 'base'
            }
          );

        if (comparison <= 0) {
          ascCount++;
        }

        if (comparison >= 0) {
          descCount++;
        }
      }
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

    for (
      let i = 0;
      i < values.length - 1;
      i++
    ) {

      const current =
        values[i];

      const next =
        values[i + 1];

      let valid = false;

      // ==================================================
      // NUMBER SORTING
      // ==================================================

      if (
        typeof current === 'number' &&
        typeof next === 'number'
      ) {

        valid =
          order === 'ASC'
            ? current <= next
            : current >= next;
      }

      // ==================================================
      // STRING SORTING
      // ==================================================

      else {

        const comparison =
          String(current).localeCompare(
            String(next),
            undefined,
            {
              numeric: true,
              sensitivity: 'base'
            }
          );

        valid =
          order === 'ASC'
            ? comparison <= 0
            : comparison >= 0;
      }

      // ==================================================
      // FAIL
      // ==================================================

      if (!valid) {

        return {
          pass: false,

          expected:
            `${current} ${
              order === 'ASC'
                ? '<='
                : '>='
            } ${next}`,

          actual:
            `${current} ${
              order === 'ASC'
                ? '>'
                : '<'
            } ${next}`
        };
      }
    }

    // ==================================================
    // PASS
    // ==================================================

    return {
      pass: true,
      expected: 'Sorted Correctly',
      actual: 'Sorted Correctly'
    };
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

    while (true) {

      const values =
        await this.getColumnValues(
          columnIndex
        );

      const result =
        this.validateValues(
          values,
          order
        );

      // ==================================================
      // SUCCESS LOG
      // ==================================================

      if (result.pass) {

        console.log(
          `✅ ${columnName} column sorting validated successfully on Page ${pageNo} (${order})`
        );
      }

      // ==================================================
      // FAILURE LOG
      // ==================================================

      else {

        console.log(
          `❌ Sorting issue in ${columnName} column on Page ${pageNo} (${order}) | Expected: ${result.expected} | Actual: ${result.actual}`
        );
      }

      // ==================================================
      // VALIDATION
      // ==================================================

      logAndValidate(
        {
          step:
            `Sorting Validation | Column: ${columnName} | Page: ${pageNo} | Order: ${order}`,

          expected:
            result.expected,

          actual:
            result.actual
        },
        testInfo
      );

      // ==================================================
      // NEXT PAGE
      // ==================================================

      if (
        await this.nextButton.isVisible() &&
        await this.nextButton.isEnabled()
      ) {

        const before =
          await this.rows
            .first()
            .textContent();

        await this.nextButton.click();

        await this.page.waitForFunction(
          (oldVal) => {

            const el =
              document.querySelector(
                'table tbody tr:first-child'
              );

            return (
              el &&
              el.textContent !== oldVal
            );
          },
          before
        );

        pageNo++;
      }

      else {

        break;
      }
    }
  }

  // ======================================================
  // VERIFY SINGLE COLUMN SORTING
  // ======================================================

  async verifyColumnSorting(
    columnName: string,
    testInfo: TestInfo
  ) {

    console.log(
      `🔍 Verifying sorting for ${columnName} column`
    );

    const columnIndex =
      await this.getColumnIndex(
        columnName
      );

    const header =
      this.headers.nth(
        columnIndex
      );

    // ==================================================
    // FIRST CLICK
    // ==================================================

    await this.goToFirstPage();

    await header.click();

    await this.waitForTableLoad();

    const firstPageValues =
      await this.getColumnValues(
        columnIndex
      );

    const firstOrder =
      this.detectOrder(
        firstPageValues
      );

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
      await this.getColumnValues(
        columnIndex
      );

    const secondOrder =
      this.detectOrder(
        secondPageValues
      );

    await this.validateAllPages(
      columnIndex,
      columnName,
      secondOrder,
      testInfo
    );
  }

  // ======================================================
  // VERIFY ALL COLUMNS
  // ======================================================

  async verifyAllColumnsSorting(
    testInfo: TestInfo
  ) {

    const columns = [
      'ID',
      'Username',
      'Email',
      'Reseller',
      'User Type',
      'Status'
    ];

    for (const column of columns) {

      await this.verifyColumnSorting(
        column,
        testInfo
      );
    }
  }
}