import {
  Page,
  Locator,
  TestInfo
} from '@playwright/test';

import {
  logAndValidate
} from './reportUtil';

// =====================================================
// MAIN FUNCTION
// =====================================================

export async function validateColumnSortingWithPagination(
  page: Page,
  rows: Locator,
  headers: Locator,
  columnName: string,
  sortOrder: 'asc' | 'desc' = 'asc',
  testInfo?: TestInfo
): Promise<void> {

  const columnIndex =
    await getColumnIndex(
      headers,
      columnName
    );

  const header =
    headers.nth(columnIndex);

  // =====================================================
  // RESET TO FIRST PAGE
  // =====================================================

  await resetToFirstPage(page);

  // =====================================================
  // ASCENDING SORT
  // =====================================================

  if (sortOrder === 'asc') {

    console.log(
      `\n🔼 Checking ASC for ${columnName}`
    );

    await header.click();

    await page.waitForLoadState(
      'networkidle'
    );

    await validateAllPages(
      page,
      rows,
      columnIndex,
      columnName,
      'ASC',
      testInfo
    );
  }

  // =====================================================
  // DESCENDING SORT
  // =====================================================

  else {

    console.log(
      `\n🔽 Checking DESC for ${columnName}`
    );

    // FIRST CLICK = ASC

    await header.click();

    await page.waitForLoadState(
      'networkidle'
    );

    // SECOND CLICK = DESC

    await header.click();

    await page.waitForLoadState(
      'networkidle'
    );

    await validateAllPages(
      page,
      rows,
      columnIndex,
      columnName,
      'DESC',
      testInfo
    );
  }
}

// =====================================================
// GET COLUMN INDEX
// =====================================================

async function getColumnIndex(
  headers: Locator,
  columnName: string
): Promise<number> {

  const count =
    await headers.count();

  for (let i = 0; i < count; i++) {

    const text =
      (
        await headers
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

// =====================================================
// RESET TO FIRST PAGE
// =====================================================

async function resetToFirstPage(
  page: Page
): Promise<void> {

  const firstButton =
    page.locator(
      'button:has-text("First")'
    ).last();

  if (
    await firstButton.isVisible() &&
    await firstButton.isEnabled()
  ) {

    await firstButton.click();

    await page.waitForLoadState(
      'networkidle'
    );
  }
}

// =====================================================
// VALIDATE ALL PAGES
// =====================================================

async function validateAllPages(
  page: Page,
  rows: Locator,
  columnIndex: number,
  columnName: string,
  order: 'ASC' | 'DESC',
  testInfo?: TestInfo
): Promise<void> {

  let pageNumber = 1;

  while (true) {

    console.log(
      `📄 ${columnName} ${order} Page ${pageNumber}`
    );

    const values =
      await getColumnValues(
        rows,
        columnIndex
      );

    validateValues(
      values,
      columnName,
      order,
      pageNumber,
      testInfo
    );

    const nextButton =
      page.locator(
        'button:has-text("Next")'
      ).last();

    if (
      !(await nextButton.isVisible()) ||
      !(await nextButton.isEnabled())
    ) {

      break;
    }

    await nextButton.click();

    await page.waitForLoadState(
      'networkidle'
    );

    pageNumber++;
  }
}

// =====================================================
// GET COLUMN VALUES
// =====================================================

async function getColumnValues(
  rows: Locator,
  columnIndex: number
): Promise<string[]> {

  const values: string[] = [];

  const rowCount =
    await rows.count();

  for (let i = 0; i < rowCount; i++) {

    const value =
      (
        await rows
          .nth(i)
          .locator('td')
          .nth(columnIndex)
          .textContent()
      )?.trim();

    if (value) {

      values.push(value);
    }
  }

  return values;
}

// =====================================================
// VALIDATE VALUES
// =====================================================

function validateValues(
  values: string[],
  columnName: string,
  order: 'ASC' | 'DESC',
  pageNumber: number,
  testInfo?: TestInfo
): void {

  let isSorted = true;

  let expected = '';

  let actual = '';

  for (
    let i = 0;
    i < values.length - 1;
    i++
  ) {

    const current =
      values[i];

    const next =
      values[i + 1];

    const comparison =
      current.localeCompare(
        next,
        undefined,
        {
          numeric: true,
          sensitivity: 'base'
        }
      );

    // ASCENDING

    if (
      order === 'ASC' &&
      comparison > 0
    ) {

      isSorted = false;

      expected =
        `${current} <= ${next}`;

      actual =
        `${current} > ${next}`;

      break;
    }

    // DESCENDING

    if (
      order === 'DESC' &&
      comparison < 0
    ) {

      isSorted = false;

      expected =
        `${current} >= ${next}`;

      actual =
        `${current} < ${next}`;

      break;
    }
  }

  // PASS

  if (isSorted) {

    expected = 'Sorted Correctly';

    actual = 'Sorted Correctly';
  }

  // REPORT

  if (testInfo) {

    logAndValidate(
      {
        step:
          `${columnName} ${order} Page ${pageNumber}`,

        expected,
        actual
      },
      testInfo
    );
  }
}