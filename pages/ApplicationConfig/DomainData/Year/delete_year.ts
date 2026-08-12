import { expect, Locator, Page, TestInfo, test } from '@playwright/test';
import { Reporter } from '../../../utils/NewReport';
import { searchbyName } from '../../../utils/Searchnew';
import { Addyear } from './add_year';


export class DeleteYear extends Addyear {
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

  async deleteAddedYear(
    yearName: string,
    testInfo: TestInfo
  ): Promise<void> {

    await test.step('Delete Added Year', async () => {

      const yearFound = await searchbyName(
        this.page,
        this.searchInput,
        yearName,
        'button:has-text("Next ›")',
        'table tbody tr',
        1
      );

      expect(yearFound).toBeTruthy();

      const row = this.page.locator(
        `table tbody tr:has-text("${yearName}")`
      );

      await row.waitFor({
        state: 'visible',
        timeout: 10000
      });

      await testInfo.attach('Before Delete Year', {
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

      await testInfo.attach('After Delete Year', {
        body: await this.page.screenshot(),
        contentType: 'image/png'
      });

      console.log(`
========== YEAR DELETED ==========
Deleted Year : ${yearName}
=================================
`);
    });
  }

  async verifyDeletedYear(
    yearName: string,
    testInfo: TestInfo
  ): Promise<boolean> {

    let yearDeleted = false;

    await test.step('Verify Deleted Year', async () => {

      // Clear previous search
      await this.searchInput.clear();

      // Search deleted year
      await this.searchInput.fill(yearName);
      await this.page.keyboard.press('Enter');

      // Wait for search to complete
      await this.page.waitForTimeout(3000);
      await this.page.waitForLoadState('networkidle');

      const deletedYearRow = this.page.locator('tr').filter({
        hasText: yearName
      });

      const rowCount = await deletedYearRow.count();

      yearDeleted = rowCount === 0;

      await testInfo.attach('Verify Deleted Year', {
        body: await this.page.screenshot(),
        contentType: 'image/png'
      });

      Reporter.validateData(
        'Deleted',
        yearDeleted ? 'Deleted' : 'Still Exists',
        'Verify deleted year should not appear in summary table',
        testInfo
      );

      expect(yearDeleted).toBeTruthy();

      console.log(`
========== DELETE VERIFICATION ==========
Year Name : ${yearName}
Rows Found: ${rowCount}
Status    : ${yearDeleted ? 'DELETED' : 'STILL EXISTS'}
=========================================
`);
    });

    return yearDeleted;
  }

async completeAddDeleteYearFlow(
    
  testInfo: TestInfo
): Promise<void> {

    await this.createAndVerifyYear(testInfo);

    await this.deleteAddedYear(
        this.uniqueYearName,
        testInfo
    );

    await this.verifyDeletedYear(
        this.uniqueYearName,
        testInfo
    );
}
  
}