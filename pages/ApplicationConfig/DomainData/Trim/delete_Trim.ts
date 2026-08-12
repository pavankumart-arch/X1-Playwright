import { expect, Locator, Page, TestInfo, test } from '@playwright/test';
import { Reporter } from '../../../utils/NewReport';
import { searchbyName } from '../../../utils/Searchnew';
import { AddTrim } from './add-verify-trim';

export class DeleteTrim extends AddTrim {
  deleteIcon: Locator;
  confirmDeleteButton: Locator;
  deletePopup: Locator;
  noRecordText: Locator;

  constructor(page: Page) {
    super(page);

    this.deleteIcon = page.locator('button').filter({
      has: page.locator('svg.lucide-trash2')
    });

    this.confirmDeleteButton = page.locator(
      'button.bg-destructive'
    );

    this.deletePopup = page.getByText('Confirm Delete');

    this.noRecordText = page.getByText('No record found');
  }

  async deleteAddedTrim(
    trimName: string,
    testInfo: TestInfo
  ): Promise<void> {

    await test.step('Delete Added Trim', async () => {

      const trimFound = await searchbyName(
        this.page,
        this.searchInput,
        trimName,
        'button:has-text("Next ›")',
        'table tbody tr',
        1
      );

      expect(trimFound).toBeTruthy();

      const row = this.page.locator(
        `table tbody tr:has-text("${trimName}")`
      );

      await row.waitFor({
        state: 'visible',
        timeout: 10000
      });

      await testInfo.attach('Before Delete Trim', {
        body: await this.page.screenshot(),
        contentType: 'image/png'
      });

      const deleteButton = row
        .locator('button')
        .filter({
          has: this.page.locator('svg.lucide-trash2')
        });

      await deleteButton.click();

      await this.deletePopup.waitFor({
        state: 'visible',
        timeout: 10000
      });

      const dialog = this.page.locator('[role="dialog"]');

      await expect(dialog).toBeVisible();

      await dialog
        .getByRole('button', { name: 'Delete' })
        .click();

      await this.page.waitForLoadState('networkidle');

      await testInfo.attach('After Delete Trim', {
        body: await this.page.screenshot(),
        contentType: 'image/png'
      });

      console.log(`
========== TRIM DELETED ==========
Deleted Trim : ${trimName}
=================================
`);
    });
  }

async verifyDeletedTrim(
  trimName: string,
  testInfo: TestInfo
): Promise<boolean> {

  let trimDeleted = false;

  await test.step('Verify Deleted Trim', async () => {

    // Clear previous search
    await this.searchInput.clear();

    // Search deleted trim
    await this.searchInput.fill(trimName);
    await this.page.keyboard.press('Enter');

    // Wait for search to complete
    await this.page.waitForTimeout(3000);
    await this.page.waitForLoadState('networkidle');

    const deletedTrimRow = this.page.locator('tr').filter({
      hasText: trimName
    });

    const rowCount = await deletedTrimRow.count();

    trimDeleted = rowCount === 0;

    await testInfo.attach('Verify Deleted Trim', {
      body: await this.page.screenshot(),
      contentType: 'image/png'
    });

    Reporter.validateData(
      'Deleted',
      trimDeleted ? 'Deleted' : 'Still Exists',
      'Verify deleted trim should not appear in summary table',
      testInfo
    );

    expect(trimDeleted).toBeTruthy();

    console.log(`
========== DELETE VERIFICATION ==========
Trim Name : ${trimName}
Rows Found: ${rowCount}
Status    : ${trimDeleted ? 'DELETED' : 'STILL EXISTS'}
=========================================
`);
  });

  return trimDeleted;
}
  async completeAddDeleteTrimFlow(
    testInfo: TestInfo
  ): Promise<void> {

    const trimName = await this.createAndVerifyTrim(testInfo);

    await this.deleteAddedTrim(trimName, testInfo);

    await this.verifyDeletedTrim(trimName, testInfo);

    console.log(`
========== COMPLETE TRIM DELETE FLOW ==========
✓ Trim Added
✓ Trim Verified
✓ Trim Deleted
✓ Deletion Verified
==============================================
`);
  }
}