import { Page, Locator, TestInfo } from '@playwright/test';
import { logAndValidate } from './reportUtil';

export async function validateColumnSortingWithPagination(
  page: Page,
  rows: Locator,
  headers: Locator,
  columnName: string,
  testInfo: TestInfo
) {

  const columnIndex = await getColumnIndex(headers, columnName);
  const header = headers.nth(columnIndex);

  // Apply ASC sorting
  await header.click();
  await page.waitForTimeout(800);

  let pageNumber = 1;
  let previousLastValue: number | null = null;

  while (true) {

    const values = await getColumnValues(rows, columnIndex);

    // ================= PAGE-WISE =================
    let isPageSorted = true;
    let expected = 'Sorted';
    let actual = 'Sorted';

    for (let i = 0; i < values.length - 1; i++) {
      if (values[i] > values[i + 1]) {
        isPageSorted = false;
        expected = `${values[i]} <= ${values[i + 1]}`;
        actual = `${values[i]} > ${values[i + 1]}`;
        break;
      }
    }

    logAndValidate(
      {
        step: `Page ${pageNumber} - ${columnName} ASC`,
        expected,
        actual
      },
      testInfo
    );

    // ================= GLOBAL =================
    if (previousLastValue !== null && values.length > 0) {

      const firstCurrent = values[0];

      if (previousLastValue > firstCurrent) {

        logAndValidate(
          {
            step: `Page ${pageNumber} - GLOBAL CHECK`,
            expected: `${previousLastValue} <= ${firstCurrent}`,
            actual: `${previousLastValue} > ${firstCurrent}`
          },
          testInfo
        );
      }
    }

    previousLastValue = values[values.length - 1];

    // ================= NEXT PAGE =================
    const nextBtn = page.locator('button:has-text("Next")').last();

    if (!(await nextBtn.isVisible()) || !(await nextBtn.isEnabled())) {
      break;
    }

    await nextBtn.click();
    await page.waitForTimeout(800);

    pageNumber++;

    if (pageNumber > 50) break;
  }
}


// ===== HELPERS =====

async function getColumnIndex(headers: Locator, columnName: string) {

  const count = await headers.count();

  for (let i = 0; i < count; i++) {
    const text = (await headers.nth(i).innerText()).trim();

    if (text.toLowerCase().includes(columnName.toLowerCase())) {
      return i;
    }
  }

  throw new Error(`Column not found: ${columnName}`);
}


async function getColumnValues(
  rows: Locator,
  columnIndex: number
): Promise<number[]> {

  const values: number[] = [];
  const count = await rows.count();

  for (let i = 0; i < count; i++) {
    const text = await rows.nth(i).locator('td').nth(columnIndex).innerText();
    const num = Number(text.trim());

    if (!isNaN(num)) {
      values.push(num);
    }
  }

  return values;
}