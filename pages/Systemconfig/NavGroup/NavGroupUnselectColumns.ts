
import {
  Page,
  Locator,
  expect
} from '@playwright/test';

export class NavGroupUnselectColumns {

  readonly page: Page;

  readonly columnsButton: Locator;

  readonly tableHeaders: Locator;

  constructor(page: Page) {

    this.page = page;

    this.columnsButton = page.locator('button:has-text("Columns")');

    this.tableHeaders =
      page.locator(
        'table thead th'
      );

    console.log(
      '✅ NavGroupUnselectColumns Loaded'
    );
  }
  

// =========================================
// ✅ HIDE COLUMN (UNSELECT)
// =========================================

async hideColumn(
  columnName: string
) {

  // OPEN DROPDOWN
  await this.columnsButton.click();

  await this.page.waitForTimeout(2000);

  console.log(
    `👉 Trying to unselect: ${columnName}`
  );

  // ✅ FIND CHECKBOX USING ACCESSIBLE NAME
  const checkbox =
    this.page.getByRole(
      'checkbox',
      {
        name: new RegExp(
          `toggle ${columnName} visibility`,
          'i'
        )
      }
    );

  await checkbox.waitFor({
    state: 'visible',
    timeout: 10000
  });

  // DEBUG
  const before =
    await checkbox.isChecked();

  console.log(
    `Before Click Checked: ${before}`
  );

  // ✅ CLICK CHECKBOX DIRECTLY
  await checkbox.click({
    force: true
  });

  await this.page.waitForTimeout(2000);

  // VERIFY STATE CHANGED
  const after =
    await checkbox.isChecked();

  console.log(
    `After Click Checked: ${after}`
  );

  if (after) {

    throw new Error(
      `❌ Checkbox still checked for ${columnName}`
    );
  }

  console.log(
    `✅ Column Unselected: ${columnName}`
  );

  // CLOSE DROPDOWN
  await this.page.keyboard.press(
    'Escape'
  );

  await this.page.waitForTimeout(2000);
}

// =========================================
// ✅ VERIFY COLUMN HIDDEN
// =========================================

async verifyColumnHidden(
  columnName: string
) {

  const column =
    this.page.locator(
      `table thead th:has-text("${columnName}")`
    );

  // WAIT UI UPDATE
  await this.page.waitForTimeout(1500);

  const visible =
    await column.isVisible()
      .catch(() => false);

  if (visible) {

    throw new Error(
      `❌ Column still visible: ${columnName}`
    );
  }

  console.log(
    `✅ Column Hidden: ${columnName}`
  );
}
}