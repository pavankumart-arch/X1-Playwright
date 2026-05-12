import { Page, Locator, TestInfo } from '@playwright/test';
import { logAndValidate } from './reportUtil';

// ================= MAIN =================

export async function validateColumnSortingWithPagination(
  page: Page,
  rows: Locator,
  headers: Locator,
  columnName: string,
  testInfo: TestInfo
) {

  const columnIndex = await getColumnIndex(headers, columnName);
  const header = headers.nth(columnIndex);

  // 🔼 ASC
  console.log(`\n🔼 Checking ASC for ${columnName}`);
  await header.click();
  await page.waitForTimeout(800);

  await validateAllPages(page, rows, columnIndex, columnName, 'ASC', testInfo);

  // 🔽 DESC
  console.log(`\n🔽 Checking DESC for ${columnName}`);
  await header.click();
  await page.waitForTimeout(800);

  await validateAllPages(page, rows, columnIndex, columnName, 'DESC', testInfo);
}


// ================= GET COLUMN INDEX =================

async function getColumnIndex(headers: Locator, columnName: string) {

  const count = await headers.count();

  for (let i = 0; i < count; i++) {
    const text = (await headers.nth(i).innerText()).trim();

    if (text.toLowerCase().includes(columnName.toLowerCase())) {
      return i;
    }
  }

  throw new Error(`Column ${columnName} not found`);
}


// ================= PAGINATION =================

async function validateAllPages(
  page: Page,
  rows: Locator,
  columnIndex: number,
  columnName: string,
  order: 'ASC' | 'DESC',
  testInfo: TestInfo
) {

  let pageNumber = 1;

  while (true) {

    console.log(`📄 ${columnName} ${order} Page ${pageNumber}`);

    const values = await getColumnValues(rows, columnIndex);

    validateValues(values, columnName, order, pageNumber, testInfo);

    const nextBtn = page.locator('button:has-text("Next")').last();

    if (!(await nextBtn.isVisible()) || !(await nextBtn.isEnabled())) {
      break;
    }

    await nextBtn.click();
    await page.waitForLoadState('networkidle');

    pageNumber++;
  }
}


// ================= GET VALUES =================

async function getColumnValues(rows: Locator, columnIndex: number): Promise<string[]> {

  const values: string[] = [];
  const count = await rows.count();

  for (let i = 0; i < count; i++) {

    const text = (await rows
      .nth(i)
      .locator('td')
      .nth(columnIndex)
      .textContent())?.trim();

    if (text) values.push(text);
  }

  return values;
}


// ================= VALIDATION =================

function validateValues(
  values: string[],
  columnName: string,
  order: 'ASC' | 'DESC',
  pageNumber: number,
  testInfo: TestInfo
) {

  let isSorted = true;
  let expected = '';
  let actual = '';

  for (let i = 0; i < values.length - 1; i++) {

    const a = values[i];
    const b = values[i + 1];

    const result = a.localeCompare(b, undefined, {
      numeric: true,
      sensitivity: 'base'
    });

    if (order === 'ASC' && result > 0) {
      isSorted = false;
      expected = `${a} <= ${b}`;
      actual = `${a} > ${b}`;
      break;
    }

    if (order === 'DESC' && result < 0) {
      isSorted = false;
      expected = `${a} >= ${b}`;
      actual = `${a} < ${b}`;
      break;
    }
  }

  logAndValidate(
    {
      step: `${columnName} ${order} Page ${pageNumber}`,
      expected: isSorted ? 'Sorted Correctly' : expected,
      actual: isSorted ? 'Sorted Correctly' : actual
    },
    testInfo
  );
}