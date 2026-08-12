
import { Locator, Page, TestInfo, expect } from '@playwright/test';
import { BasePage } from '../../BasePage';

export class AppTypeSorting extends BasePage {

  tableRows: Locator;
  tableHeaders: Locator;

  constructor(page: Page) {
    super(page);

    this.tableRows = page.locator('table tbody tr');
    this.tableHeaders = page.locator('table thead th');
  }

  // =========================================
  // VALIDATE COLUMN SORTING
  // =========================================

  async validateColumnSorting(
    columnName: string,
    testInfo: TestInfo
  ): Promise<{ passed: boolean; error?: string }> {

    try {

      const columnIndex =
        await this.getColumnIndex(columnName);

      const header =
        this.tableHeaders.nth(columnIndex);

      await expect(header).toBeVisible({
        timeout: 10000
      });

      // =========================================
      // ASCENDING
      // =========================================

      console.log(
        `\n📊 Testing ASCENDING for ${columnName}`
      );

      await this.clickSortHeader(header);

      let values =
        await this.getColumnValues(
          columnIndex,
          columnName
        );

      let ascCheck =
        this.checkSorting(
          values,
          'ASC',
          columnName
        );

      /*
       * If the first click resulted in DESC,
       * click again and validate ASC.
       */
      if (!ascCheck) {

        await this.clickSortHeader(header);

        values =
          await this.getColumnValues(
            columnIndex,
            columnName
          );

        ascCheck =
          this.checkSorting(
            values,
            'ASC',
            columnName
          );
      }

      // =========================================
      // DESCENDING
      // =========================================

      console.log(
        `\n📊 Testing DESCENDING for ${columnName}`
      );

      /*
       * If all values are identical, ASC and DESC
       * are logically the same.
       */
      if (this.allValuesSame(values)) {

        console.log(
          `ℹ️ ${columnName}: all values are identical`
        );

        console.log(
          `✅ ${columnName} sorting passed`
        );

        return {
          passed: ascCheck
        };
      }

      await this.clickSortHeader(header);

      values =
        await this.getColumnValues(
          columnIndex,
          columnName
        );

      let descCheck =
        this.checkSorting(
          values,
          'DESC',
          columnName
        );

      /*
       * If the first click did not produce DESC,
       * click again.
       */
      if (!descCheck) {

        await this.clickSortHeader(header);

        values =
          await this.getColumnValues(
            columnIndex,
            columnName
          );

        descCheck =
          this.checkSorting(
            values,
            'DESC',
            columnName
          );
      }

      // =========================================
      // FINAL RESULT
      // =========================================

      if (ascCheck && descCheck) {

        console.log(
          `✅ ${columnName} sorting passed`
        );

        return {
          passed: true
        };
      }

      console.log(
        `❌ ${columnName} sorting failed`
      );

      return {
        passed: false,
        error: `${columnName} sorting failed`
      };

    } catch (error) {

      console.log(
        `❌ Error while sorting ${columnName}:`,
        error
      );

      return {
        passed: false,
        error: `${columnName} sorting failed`
      };
    }
  }


  // =========================================
  // CLICK SORT HEADER
  // =========================================

  private async clickSortHeader(
    header: Locator
  ): Promise<void> {

    await expect(header).toBeVisible({
      timeout: 10000
    });

    await header.click();

    /*
     * Sorting appears to be client-side.
     * Do not use networkidle or waitForTimeout here.
     */

    await expect(
      this.tableRows.first()
    ).toBeVisible({
      timeout: 5000
    });
  }


  // =========================================
  // GET COLUMN VALUES
  // =========================================

  private async getColumnValues(
    columnIndex: number,
    columnName: string
  ): Promise<any[]> {

    const values: any[] = [];

    const rowCount =
      await this.tableRows.count();

    for (
      let i = 0;
      i < rowCount;
      i++
    ) {

      const cells =
        this.tableRows
          .nth(i)
          .locator('td');

      const cellCount =
        await cells.count();

      if (columnIndex >= cellCount) {
        continue;
      }

      const text =
        (
          await cells
            .nth(columnIndex)
            .innerText()
        ).trim();

      values.push(
        this.parseValue(
          text,
          columnName
        )
      );
    }

    console.log(
      `📋 ${columnName} values:`,
      values
    );

    return values;
  }


  // =========================================
  // PARSE VALUE
  // =========================================

  private parseValue(
    value: string,
    columnName: string
  ): any {

    const column =
      columnName
        .trim()
        .toLowerCase();

    // =========================================
    // ID
    // =========================================

    if (column === 'id') {

      const number =
        Number(
          value.replace(/,/g, '').trim()
        );

      return Number.isNaN(number)
        ? value.trim().toLowerCase()
        : number;
    }

    // =========================================
    // CREATED / UPDATED
    // =========================================

    if (
      column === 'created' ||
      column === 'updated'
    ) {

      const timestamp =
        Date.parse(value);

      if (!Number.isNaN(timestamp)) {
        return timestamp;
      }

      return value.trim().toLowerCase();
    }

    // =========================================
    // APP TITLE / APP TYPE / STATUS
    // =========================================

    return value
      .trim()
      .toLowerCase();
  }


  // =========================================
  // CHECK SORTING
  // =========================================

  private checkSorting(
    values: any[],
    order: 'ASC' | 'DESC',
    columnName: string
  ): boolean {

    const filteredValues =
      values.filter(
        value =>
          value !== null &&
          value !== undefined &&
          value !== ''
      );

    if (filteredValues.length <= 1) {
      return true;
    }

    /*
     * Status with identical values.
     */
    if (this.allValuesSame(filteredValues)) {

      console.log(
        `ℹ️ ${columnName}: all values are identical`
      );

      return true;
    }

    for (
      let i = 0;
      i < filteredValues.length - 1;
      i++
    ) {

      const current =
        filteredValues[i];

      const next =
        filteredValues[i + 1];

      const comparison =
        this.compareValues(
          current,
          next
        );

      const valid =
        order === 'ASC'
          ? comparison <= 0
          : comparison >= 0;

      if (!valid) {

        console.log(
          `❌ Sorting Failed: ${current} -> ${next}`
        );

        return false;
      }
    }

    return true;
  }


  // =========================================
  // COMPARE VALUES
  // =========================================

  private compareValues(
    a: any,
    b: any
  ): number {

    // NUMBER
    if (
      typeof a === 'number' &&
      typeof b === 'number'
    ) {
      return a - b;
    }

    // STRING
    const stringA =
      String(a).toLowerCase();

    const stringB =
      String(b).toLowerCase();

    if (stringA === stringB) {
      return 0;
    }

    /*
     * Plain JavaScript comparison.
     *
     * This avoids localeCompare() because your
     * App Title/App Type values contain:
     *
     * -
     * _
     * numbers
     *
     * and localeCompare() was producing a different
     * order from the application.
     */
    return stringA < stringB
      ? -1
      : 1;
  }


  // =========================================
  // CHECK ALL VALUES SAME
  // =========================================

  private allValuesSame(
    values: any[]
  ): boolean {

    if (values.length <= 1) {
      return true;
    }

    const first =
      values[0];

    return values.every(
      value =>
        this.compareValues(
          first,
          value
        ) === 0
    );
  }


  // =========================================
  // GET COLUMN INDEX
  // =========================================

  private async getColumnIndex(
    columnName: string
  ): Promise<number> {

    const count =
      await this.tableHeaders.count();

    const expected =
      columnName
        .trim()
        .toLowerCase();

    for (
      let i = 0;
      i < count;
      i++
    ) {

      const actual =
        (
          await this.tableHeaders
            .nth(i)
            .innerText()
        )
          .trim()
          .toLowerCase();

      /*
       * Exact match prevents:
       *
       * App       -> App Title
       * Type      -> App Type
       */
      if (actual === expected) {

        console.log(
          `✅ Column "${columnName}" found at index ${i}`
        );

        return i;
      }
    }

    const headers =
      await this.tableHeaders
        .allTextContents();

    console.log(
      'Available headers:',
      headers
        .map(h => h.trim())
        .filter(Boolean)
    );

    throw new Error(
      `Column not found: ${columnName}`
    );
  }
}
