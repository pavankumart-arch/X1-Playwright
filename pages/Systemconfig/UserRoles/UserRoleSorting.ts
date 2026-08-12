import { Locator, Page, TestInfo } from '@playwright/test';
import { BasePage } from '../../BasePage';

export class UserRoleSorting extends BasePage {

  tableRows: Locator;
  tableHeaders: Locator;
  nextButton: Locator;
  previousButton: Locator;

  constructor(page: Page) {

    super(page);

    this.tableRows =
      page.locator('table tbody tr');

    this.tableHeaders =
      page.locator('table thead th');

    this.nextButton =
      page.getByRole('button', {
        name: 'Next'
      });

    this.previousButton =
      page.getByRole('button', {
        name: 'Previous'
      });
  }

  async validateColumnSorting(
    columnName: string,
    testInfo: TestInfo
  ): Promise<{
    passed: boolean;
    error?: string;
  }> {

    try {

      const columnIndex =
        await this.getColumnIndex(
          columnName
        );

      const header =
        this.tableHeaders.nth(
          columnIndex
        );

      // ASC SORT
      console.log(
        `\n📊 Testing ASCENDING order for: ${columnName}`
      );

      await header.click();

      await this.page.waitForTimeout(1500);

      const ascValues =
        await this.getColumnValues(
          columnIndex,
          columnName
        );

      const ascCheck =
        this.checkSorting(
          ascValues,
          'ASC'
        );

      console.log(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
STEP     : 🔼 ASCENDING ORDER (${columnName})
STATUS   : ${ascCheck ? 'PASS ✅' : 'FAIL ❌'}
EXPECTED : PASS
ACTUAL   : ${ascCheck ? 'PASS' : 'FAIL'}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`);

      if (!ascCheck) {

        return {
          passed: false,
          error:
            'Ascending sorting failed'
        };
      }

      // DESC SORT
      console.log(
        `\n📊 Testing DESCENDING order for: ${columnName}`
      );

      await header.click();

      await this.page.waitForTimeout(1500);

      const descValues =
        await this.getColumnValues(
          columnIndex,
          columnName
        );

      const descCheck =
        this.checkSorting(
          descValues,
          'DESC'
        );

      console.log(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
STEP     : 🔽 DESCENDING ORDER (${columnName})
STATUS   : ${descCheck ? 'PASS ✅' : 'FAIL ❌'}
EXPECTED : PASS
ACTUAL   : ${descCheck ? 'PASS' : 'FAIL'}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`);

      if (!descCheck) {

        return {
          passed: false,
          error:
            'Descending sorting failed'
        };
      }

      return {
        passed: true
      };

    } catch (error) {

      return {
        passed: false,
        error:
          error instanceof Error
            ? error.message
            : String(error)
      };
    }
  }

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

      const cell =
        this.tableRows
          .nth(i)
          .locator('td')
          .nth(columnIndex);

      const text =
        (
          await cell.innerText()
        ).trim();

      values.push(
        this.parseValue(
          text,
          columnName
        )
      );
    }

    console.log(
      `📄 ${columnName} values:`,
      values
    );

    return values;
  }

  private parseValue(
    value: string,
    columnName: string
  ): any {

    if (
      columnName
        .toLowerCase() === 'id'
    ) {

      const num =
        parseInt(value);

      return isNaN(num)
        ? value
        : num;
    }

    if (
      columnName
        .toLowerCase()
        .includes('created')
      ||
      columnName
        .toLowerCase()
        .includes('updated')
    ) {

      const date =
        new Date(value);

      return isNaN(
        date.getTime()
      )
        ? value
        : date;
    }

    if (
      columnName
        .toLowerCase() ===
      'status'
    ) {

      return value
        .toLowerCase();
    }

    return value
      .toLowerCase();
  }

  private checkSorting(
    values: any[],
    order: 'ASC' | 'DESC'
  ): boolean {

    for (
      let i = 0;
      i < values.length - 1;
      i++
    ) {

      const current =
        values[i];

      const next =
        values[i + 1];

      let valid = true;

      if (
        current instanceof Date &&
        next instanceof Date
      ) {

        valid =
          order === 'ASC'
            ? current.getTime()
              <= next.getTime()
            : current.getTime()
              >= next.getTime();

      } else {

        valid =
          order === 'ASC'
            ? current <= next
            : current >= next;
      }

      if (!valid) {

        console.log(
          `❌ Sorting failed : ${current} ${order === 'ASC' ? '>' : '<'} ${next}`
        );

        return false;
      }
    }

    return true;
  }

  private async getColumnIndex(
    columnName: string
  ): Promise<number> {

    const count =
      await this.tableHeaders.count();

    for (
      let i = 0;
      i < count;
      i++
    ) {

      const text =
        (
          await this.tableHeaders
            .nth(i)
            .innerText()
        ).trim();

      if (
        text.toLowerCase() ===
        columnName.toLowerCase()
      ) {

        return i;
      }
    }

    throw new Error(
      `Column not found: ${columnName}`
    );
  }
}