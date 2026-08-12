import { Locator, Page, TestInfo } from '@playwright/test';
import { BasePage } from '../BasePage';
import { Reporter } from '../utils/NewReport';


export class RooftopSorting extends BasePage {

  tableRows: Locator;
  tableHeaders: Locator;
  nextButton: Locator;
  previousButton: Locator;

  constructor(page: Page) {
    super(page);
    this.tableRows = page.locator('table tbody tr');
    this.tableHeaders = page.locator('table thead th');
    this.nextButton = page.getByRole('button', { name: 'Next' });
    this.previousButton = page.getByRole('button', { name: 'Previous' });
  }

  async validateColumnSorting(columnName: string, testInfo: TestInfo, timeoutMs: number = 60000): Promise<{ passed: boolean; error?: string }> {
    const columnIndex = await this.getColumnIndex(columnName);
    const header = this.tableHeaders.nth(columnIndex);

    // Test ASCENDING order
    console.log(`\n📊 Testing ASCENDING order for: ${columnName}`);
    await header.click();
    await this.page.waitForTimeout(1500);
    await this.goToFirstPage();
    
    const ascResult = await this.validateAllPagesSorting(columnIndex, 'ASC', columnName, testInfo);

    Reporter.validateData(
      'PASS',
      ascResult.passed ? 'PASS' : 'FAIL',
      `🔼 ASCENDING ORDER (${columnName}) - All Pages`,
      testInfo
    );

    if (!ascResult.passed) {
      return { passed: false, error: `ASC sorting failed: ${ascResult.error}` };
    }

    // Test DESCENDING order
    console.log(`\n📊 Testing DESCENDING order for: ${columnName}`);
    await header.click();
    await this.page.waitForTimeout(1500);
    await this.goToFirstPage();
    
    const descResult = await this.validateAllPagesSorting(columnIndex, 'DESC', columnName, testInfo);

    Reporter.validateData(
      'PASS',
      descResult.passed ? 'PASS' : 'FAIL',
      `🔽 DESCENDING ORDER (${columnName}) - All Pages`,
      testInfo
    );

    if (!descResult.passed) {
      return { passed: false, error: `DESC sorting failed: ${descResult.error}` };
    }

    return { passed: true };
  }

  private async validateAllPagesSorting(
  columnIndex: number,
  order: 'ASC' | 'DESC',
  columnName: string,
  testInfo: TestInfo
): Promise<{ passed: boolean; error?: string }> {

  let pageNumber = 1;
  let isAllPass = true;
  let previousLastValue: any = null;
  let allValues: any[] = [];
  let errorDetails: string[] = [];

  try {
    while (true) {

      // Check if page is already closed
      if (this.page.isClosed()) {
        throw new Error('Page was closed unexpectedly');
      }

      const currentPageValues = await this.getColumnValues(columnIndex, columnName);

      console.log(
        `📄 Page ${pageNumber} - ${columnName} values: ${currentPageValues.length} rows`
      );

      allValues.push(...currentPageValues);

      // Validate current page sorting
      const pageCheck = this.checkSorting(
        currentPageValues,
        order,
        columnName
      );

      if (pageCheck.expected !== pageCheck.actual) {
        isAllPass = false;

        const errorMsg =
          `Page ${pageNumber}: ${pageCheck.actual} ` +
          `(Expected: ${pageCheck.expected})`;

        errorDetails.push(errorMsg);

        Reporter.validateData(
          pageCheck.expected,
          pageCheck.actual,
          `Page ${pageNumber} - ${columnName} (${order})`,
          testInfo
        );
      } else {
        Reporter.validateData(
          'Sorted correctly',
          'Sorted correctly',
          `Page ${pageNumber} - ${columnName} (${order})`,
          testInfo
        );
      }

      // Cross-page validation
      if (previousLastValue !== null && currentPageValues.length > 0) {

        const firstValue = currentPageValues[0];

        let crossPageValid = true;

        if (order === 'ASC') {
          crossPageValid =
            this.compareValues(previousLastValue, firstValue) <= 0;
        } else {
          crossPageValid =
            this.compareValues(previousLastValue, firstValue) >= 0;
        }

        if (!crossPageValid) {

          isAllPass = false;

          const expectedMsg =
            order === 'ASC'
              ? `${previousLastValue} <= ${firstValue}`
              : `${previousLastValue} >= ${firstValue}`;

          const actualMsg =
            order === 'ASC'
              ? `${previousLastValue} > ${firstValue}`
              : `${previousLastValue} < ${firstValue}`;

          errorDetails.push(
            `Cross-page violation between Page ${pageNumber - 1} and Page ${pageNumber}`
          );

          Reporter.validateData(
            expectedMsg,
            actualMsg,
            `Cross-page Check: Page ${pageNumber - 1} → Page ${pageNumber} (${order})`,
            testInfo
          );
        }
      }

      // Save last value
      if (currentPageValues.length > 0) {
        previousLastValue =
          currentPageValues[currentPageValues.length - 1];
      }

      // Pagination
      try {

        const isNextVisible = await this.nextButton.isVisible();
        const isNextEnabled = await this.nextButton.isEnabled();

        if (!isNextVisible || !isNextEnabled) {
          console.log(`📊 Reached last page (Page ${pageNumber})`);
          break;
        }

        console.log(
          `➡️ Moving to Page ${pageNumber + 1}`
        );

        await this.nextButton.scrollIntoViewIfNeeded();

        await Promise.all([
          this.page.waitForLoadState('networkidle'),
          this.nextButton.click()
        ]);

        await this.page.waitForTimeout(2000);

        pageNumber++;

      } catch (error) {
        console.log(
          `Pagination ended or Next button unavailable: ${error}`
        );
        break;
      }

      // Safety limit
      if (pageNumber > 100) {
        console.log('Stopped at 100 pages (Safety Limit)');
        break;
      }
    }

    // Final validation across all pages
    const overallCheck = this.checkSorting(
      allValues,
      order,
      columnName
    );

    if (overallCheck.expected !== overallCheck.actual) {

      isAllPass = false;

      errorDetails.push(
        `Overall sorting violation: ${overallCheck.actual}`
      );

      console.log(
        `❌ Overall sorting failed across ${pageNumber} pages`
      );

    } else {

      console.log(
        `✅ Overall sorting PASSED across ${pageNumber} pages (${allValues.length} rows)`
      );
    }

    Reporter.validateData(
      overallCheck.expected,
      overallCheck.actual,
      `Overall - ${columnName} (${order}) - ${allValues.length} rows across ${pageNumber} pages`,
      testInfo
    );

  } catch (error) {

    const errorMessage =
      error instanceof Error
        ? error.message
        : String(error);

    console.log(
      `⚠️ Error validating ${columnName} (${order}): ${errorMessage}`
    );

    return {
      passed: false,
      error: `Exception: ${errorMessage}`
    };
  }

  if (!isAllPass) {
    return {
      passed: false,
      error: errorDetails.join('; ')
    };
  }

  return { passed: true };
}
  private async getColumnValues(columnIndex: number, columnName: string): Promise<any[]> {
    const values: any[] = [];
    const count = await this.tableRows.count();

    for (let i = 0; i < count; i++) {
      const cell = this.tableRows.nth(i).locator('td').nth(columnIndex);
      const text = (await cell.innerText()).trim();
      values.push(this.parseValue(text, columnName));
    }

    return values;
  }

  private parseValue(value: string, columnName: string): any {
    if (columnName.toLowerCase() === 'status') {
      return value.toLowerCase();
    }

    if (columnName.toLowerCase() === 'id') {
      const numValue = parseInt(value);
      return isNaN(numValue) ? value : numValue;
    }

    if (!isNaN(Number(value)) && !value.includes('/') && !value.includes('-')) {
      return Number(value);
    }

    const date = new Date(value);
    if (!isNaN(date.getTime())) return date;

    return value.toLowerCase();
  }

  private compareValues(a: any, b: any): number {
    if (a instanceof Date && b instanceof Date) {
      return a.getTime() - b.getTime();
    }
    if (typeof a === 'number' && typeof b === 'number') {
      return a - b;
    }
    const strA = String(a).toLowerCase();
    const strB = String(b).toLowerCase();
    if (strA < strB) return -1;
    if (strA > strB) return 1;
    return 0;
  }

  private checkSorting(values: any[], order: 'ASC' | 'DESC', columnName: string) {
    if (values.length <= 1) {
      return { expected: 'Sorted', actual: 'Sorted' };
    }

    for (let i = 0; i < values.length - 1; i++) {
      const a = values[i];
      const b = values[i + 1];
      
      let isValid: boolean;
      
      if (order === 'ASC') {
        isValid = this.compareValues(a, b) <= 0;
      } else {
        isValid = this.compareValues(a, b) >= 0;
      }

      if (!isValid) {
        return {
          expected: `${a} ${order === 'ASC' ? '<=' : '>='} ${b}`,
          actual: `${a} ${order === 'ASC' ? '>' : '<'} ${b}`
        };
      }
    }

    return { expected: 'Sorted', actual: 'Sorted' };
  }

  private async getColumnIndex(columnName: string): Promise<number> {
    const count = await this.tableHeaders.count();

    for (let i = 0; i < count; i++) {
      const text = (await this.tableHeaders.nth(i).innerText()).trim();
      if (text.toLowerCase() === columnName.toLowerCase()) return i;
      if (text.toLowerCase().includes(columnName.toLowerCase())) return i;
    }

    throw new Error(`Column not found: ${columnName}`);
  }

  private async goToFirstPage() {
    while (await this.previousButton.isVisible().catch(() => false) && 
           await this.previousButton.isEnabled().catch(() => false)) {
      await this.previousButton.click();
      await this.page.waitForTimeout(500);
    }
  }
}