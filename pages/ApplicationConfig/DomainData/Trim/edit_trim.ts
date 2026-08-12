import { expect, Locator, Page, TestInfo, test } from '@playwright/test';
import { BasePage } from '../../../BasePage';
import { Reporter } from '../../../utils/NewReport';
import { AddTrim } from './add-verify-trim';

export class EditTrim extends BasePage {

  trimNameInput: Locator;
  cancelButton: Locator;
  updateTrimButton: Locator;
  editTrimHeading: Locator;
  searchInput: Locator;

  constructor(page: Page) {
    super(page);

    this.trimNameInput = page.locator('input[type="text"]').first();

    this.cancelButton = page.getByRole('button', {
      name: 'Cancel'
    });

    this.updateTrimButton = page.getByRole('button', {
      name: /Update Trim/i
    });

    this.editTrimHeading = page.getByRole('heading', {
      name: 'Edit Trim'
    });

    this.searchInput = page.getByPlaceholder('Search');
  }

async editAndVerifyTrim(testInfo: TestInfo): Promise<void> {

  const addTrim = new AddTrim(this.page);

  // =====================================
  // CREATE TRIM
  // =====================================

  const createdTrim =
    await addTrim.createAndVerifyTrim(testInfo);

  console.log(`Created Trim: ${createdTrim}`);

  // =====================================
  // SEARCH CREATED TRIM
  // =====================================

  await expect(this.searchInput).toBeVisible();

  await this.searchInput.click();
  await this.searchInput.press('Control+A');
  await this.searchInput.press('Backspace');

  await this.searchInput.fill(createdTrim);
  await this.page.keyboard.press('Enter');

  await this.page.waitForTimeout(2000);

  const trimRow = this.page
    .locator('tbody tr')
    .filter({ hasText: createdTrim })
    .first();

  await expect(trimRow).toBeVisible({
    timeout: 10000
  });

  // =====================================
  // OPEN EDIT PAGE
  // =====================================

  await test.step('Open Edit Trim Page', async () => {

    const editButton =
      trimRow.locator('button').first();

    await expect(editButton).toBeVisible();

    await editButton.click();

    await expect(this.editTrimHeading)
      .toBeVisible({
        timeout: 10000
      });

    console.log('Edit Trim page displayed');

    await testInfo.attach(
      'Edit Trim Page',
      {
        body: await this.page.screenshot(),
        contentType: 'image/png'
      }
    );
  });

  // =====================================
  // UPDATE TRIM
  // =====================================

  const updatedTrimName =
    `EditTrim_${Date.now()}`;

  await test.step('Update Trim', async () => {

    await expect(this.trimNameInput)
      .toBeVisible();

    const existingTrim =
      await this.trimNameInput.inputValue();

    console.log(
      `Existing Trim Name : ${existingTrim}`
    );

    expect(existingTrim)
      .toBe(createdTrim);

    await this.trimNameInput.clear();

    await this.trimNameInput.fill(
      updatedTrimName
    );

    const finalValue =
      await this.trimNameInput.inputValue();

    console.log(
      `Updated Trim Name : ${finalValue}`
    );

    // Click Update without waiting
    await this.updateTrimButton.click({
      force: true,
      noWaitAfter: true
    });

    console.log('Update button clicked');

    // Short pause
    await this.page.waitForTimeout(3000);

    console.log(
      'Current URL:',
      this.page.url()
    );

    await testInfo.attach(
      'After Update',
      {
        body: await this.page.screenshot(),
        contentType: 'image/png'
      }
    );

    // If still on edit page, go back
    const stillOnEditPage =
      await this.editTrimHeading
        .isVisible()
        .catch(() => false);

    if (stillOnEditPage) {

      console.log(
        'Still on Edit page after update'
      );

      if (await this.cancelButton
        .isVisible()) {

        await this.cancelButton.click();

        console.log(
          'Cancel clicked'
        );
      }
    }

    // Wait for list page
    await expect(this.searchInput)
      .toBeVisible({
        timeout: 15000
      });

    console.log(
      'Returned to Trim list page'
    );
  });

  // =====================================
// VERIFY UPDATED TRIM
// =====================================

await test.step(
  'Verify Updated Trim',
  async () => {

    console.log(
      `Searching for Updated Trim: ${updatedTrimName}`
    );

    await expect(this.searchInput)
      .toBeVisible();

    // Clear search field
    await this.searchInput.click();

    await this.searchInput.evaluate(
      (element, value) => {
        (element as HTMLInputElement).value = value as string;
        element.dispatchEvent(
          new Event('input', { bubbles: true })
        );
      },
      ''
    );

    // Set updated Trim value directly
    await this.searchInput.evaluate(
      (element, value) => {
        (element as HTMLInputElement).value = value as string;
        element.dispatchEvent(
          new Event('input', { bubbles: true })
        );
      },
      updatedTrimName
    );

    console.log('Search value entered');

    // Wait for table to refresh
    await expect(
      this.page.locator('tbody tr').first()
    ).toBeVisible({
      timeout: 10000
    });

    // Debug rows
    const rows = await this.page
      .locator('tbody tr')
      .allTextContents();

    console.log('Rows after update:', rows);

    const updatedRow = this.page
      .locator('tbody tr')
      .filter({
        hasText: updatedTrimName
      })
      .first();

    await expect(updatedRow)
      .toBeVisible({
        timeout: 10000
      });

    const rowCount =
      await updatedRow.count();

    Reporter.validateSearch(
      updatedTrimName,
      rowCount,
      1,
      testInfo
    );

    expect(rowCount).toBeGreaterThan(0);

    console.log(`
====================================
UPDATED TRIM VALIDATION
====================================
Created : ${createdTrim}
Updated : ${updatedTrimName}
Rows    : ${rowCount}
Status  : PASS
====================================
`);

    await testInfo.attach(
      'Updated Trim Search Result',
      {
        body: await this.page.screenshot(),
        contentType: 'image/png'
      }
    );
  }
);
}}