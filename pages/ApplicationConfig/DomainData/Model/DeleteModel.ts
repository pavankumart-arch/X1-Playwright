import { expect, Locator, Page, TestInfo, test } from '@playwright/test';
import { AddModel } from './AddModel';
import { Reporter } from '../../../utils/NewReport';
import { searchbyName } from '../../../utils/Searchnew';

export class DeleteModel extends AddModel {
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

  async deleteAddedModel(testInfo: TestInfo): Promise<void> {
  await test.step('Delete Added Model', async () => {

    const modelFound = await searchbyName(
      this.page,
      this.searchInput,
      this.expectedModelName,
      'button:has-text("Next ›")',
      'table tbody tr',
      1
    );

    expect(modelFound).toBeTruthy();

    const row = this.page.locator(
      `table tbody tr:has-text("${this.expectedModelName}")`
    );

    await row.waitFor({
      state: 'visible',
      timeout: 10000
    });

    await testInfo.attach('Before Delete Model', {
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

    await testInfo.attach('Delete Confirmation Popup', {
      body: await this.page.screenshot(),
      contentType: 'image/png'
    });

    const dialog = this.page.locator('[role="dialog"]');

    await expect(dialog).toBeVisible({
      timeout: 10000
    });

    await dialog
      .getByRole('button', { name: 'Delete' })
      .click();

    await this.page.waitForTimeout(3000);

    await this.page.waitForLoadState('networkidle');

    await testInfo.attach('After Delete Model', {
      body: await this.page.screenshot(),
      contentType: 'image/png'
    });

    console.log(`
========== MODEL DELETED ==========
Deleted Model : ${this.expectedModelName}
==================================
`);
  });
}
async verifyDeletedModel(testInfo: TestInfo): Promise<boolean> {

  let modelDeleted = false;

  await test.step('Verify Deleted Model', async () => {

    await this.searchInput.clear();
    await this.searchInput.fill(this.expectedModelName);

await this.page.waitForLoadState('networkidle');

    const deletedModelRow = this.page.locator(
      `table tbody tr:has-text("${this.expectedModelName}")`
    );

    modelDeleted = await deletedModelRow.count() === 0;

    await testInfo.attach('Verify Deleted Model', {
      body: await this.page.screenshot(),
      contentType: 'image/png'
    });

    Reporter.validateData(
      'Deleted',
      modelDeleted ? 'Deleted' : 'Still Exists',
      'Verify deleted model should not appear in summary table',
      testInfo
    );

    expect(modelDeleted).toBeTruthy();

    console.log(`
========== DELETE VERIFICATION ==========
Model Name : ${this.expectedModelName}
Status     : ${modelDeleted ? 'DELETED' : 'STILL EXISTS'}
=========================================
`);
  });

  return modelDeleted;
}

  async completeAddDeleteModelFlow(testInfo: TestInfo): Promise<void> {

    await this.createAndVerifyMake(testInfo);

    await this.clickOnMakeName(testInfo);

    await this.verifyAddModelButtonIsVisible(testInfo);

    await this.addModel(testInfo);

    await this.verifyAddedModelIsDisplayed(testInfo);

    await this.deleteAddedModel(testInfo);

    await this.verifyDeletedModel(testInfo);

    console.log(`
========== COMPLETE MODEL DELETE FLOW ==========
✓ Make Created
✓ Make Verified
✓ Model Added
✓ Model Verified
✓ Model Deleted
✓ Deletion Verified
===============================================
`);
  }
}