import { expect, Locator, Page, TestInfo, test } from '@playwright/test';
import { BasePage } from '../../../BasePage';
import MakeData from '../../../../testdata/DomainData.json';
import { Reporter } from '../../../utils/NewReport';
import { AddMake } from './AddMake';
import { DeleteMake } from './DeleteMake';

export class EditMake extends BasePage {

  editMakeNameInput: Locator;
  cancelButton: Locator;
  updateMakeButton: Locator;
  editMakeHeading: Locator;
  searchInput: Locator;

  constructor(page: Page) {
    super(page);

    this.editMakeNameInput = page.locator('#admin-make-edit-makeName');
    this.cancelButton = page.getByRole('button', { name: 'Cancel' });
    this.updateMakeButton = page.getByRole('button', { name: 'Update Make' });
    this.editMakeHeading = page.getByRole('heading', { name: 'Edit Make' });
    this.searchInput = page.getByPlaceholder('Search');
  }

  async editAndVerifyMake(testInfo: TestInfo): Promise<boolean> {

    const addMake = new AddMake(this.page);
    const deleteMake = new DeleteMake(this.page);

    try {
      // =====================================
      // STEP 1: CREATE MAKE
      // =====================================
      const createdMake = await addMake.addMake(testInfo);
      console.log(`✅ Make created: ${createdMake}`);

      // =====================================
      // STEP 2: SEARCH CREATED MAKE
      // =====================================
      await this.searchInput.clear();
      await this.searchInput.fill(createdMake);
      await this.page.keyboard.press('Enter');
      await this.page.waitForTimeout(2000);

      const makeRow = this.page.locator('tr').filter({ hasText: createdMake });
      await expect(makeRow).toHaveCount(1);

      // =====================================
      // STEP 3: OPEN EDIT PAGE
      // =====================================
      await makeRow.locator('button').first().click();
      await expect(this.editMakeHeading).toBeVisible({ timeout: 10000 });
      console.log('✅ Edit Make page displayed');

      // =====================================
      // STEP 4: UPDATE MAKE
      // =====================================
      const updatedMakeName = `${MakeData.EditMake || 'EditMake'}_${Date.now()}`;

      await expect(this.editMakeNameInput).toBeVisible();
      const existingMake = await this.editMakeNameInput.inputValue();
      console.log(`Existing Make : ${existingMake}`);

      await this.editMakeNameInput.clear();
      await this.editMakeNameInput.fill(updatedMakeName);
      await this.updateMakeButton.click();

      await expect(this.searchInput).toBeVisible({ timeout: 10000 });
      console.log(`Updated Make : ${updatedMakeName}`);

      // =====================================
      // STEP 5: VERIFY UPDATED MAKE
      // =====================================
      await this.searchInput.clear();
      await this.searchInput.fill(updatedMakeName);
      await this.page.keyboard.press('Enter');
      await this.page.waitForTimeout(2000);

      const updatedRow = this.page.locator('tr').filter({ hasText: updatedMakeName });
      const rowCount = await updatedRow.count();

      Reporter.validateSearch(updatedMakeName, rowCount, 1, testInfo);
      expect(rowCount).toBeGreaterThan(0);
      console.log(`Updated Make Found : ${updatedMakeName}`);

      // =====================================
      // STEP 6: REOPEN EDIT PAGE
      // =====================================
      await updatedRow.locator('button').first().click();
      await expect(this.editMakeHeading).toBeVisible();

      // =====================================
      // STEP 7: VERIFY INPUT VALUE
      // =====================================
      await expect(this.editMakeNameInput).toBeVisible();
      const actualMakeName = await this.editMakeNameInput.inputValue();

      Reporter.validateData(updatedMakeName, actualMakeName, 'Edit Make Verification', testInfo);
      expect(actualMakeName).toBe(updatedMakeName);

      console.log(`
====================================
EDIT MAKE VERIFICATION SUCCESS
====================================
Expected : ${updatedMakeName}
Actual   : ${actualMakeName}
Status   : PASS
====================================
`);

      // =====================================
      // STEP 8: CANCEL
      // =====================================
      await this.cancelButton.click();
      await expect(this.searchInput).toBeVisible();
      console.log('Cancel button clicked successfully');

      // =====================================
      // STEP 9: DELETE (Cleanup)
      // =====================================
      console.log('🗑️ Deleting the make...');
      await deleteMake.deleteExistingMake(updatedMakeName);
      console.log('✅ Make deleted');

      return true;

    } catch (error) {
      console.error(`❌ Test failed: ${error}`);
      return false;
    }
  }
}