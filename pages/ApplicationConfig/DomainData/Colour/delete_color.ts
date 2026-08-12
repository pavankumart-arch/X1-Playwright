import { expect, Locator, Page, TestInfo, test } from '@playwright/test';
import { Reporter } from '../../../utils/NewReport';
import { AddColor } from './add_color';

export class DeleteColour extends AddColor {

  deletePopup: Locator;

  constructor(page: Page) {
    super(page);

    this.deletePopup = page.getByText('Confirm Delete');
  }

  async deleteAddedColour(
    colourName: string,
    testInfo: TestInfo
  ): Promise<void> {

    await test.step('Delete Added Colour', async () => {

      // Search Color
      await this.searchInput.clear();
      await this.searchInput.fill(colourName);
      await this.page.keyboard.press('Enter');

      await this.page.waitForLoadState('networkidle');
      await this.page.waitForTimeout(2000);

      const row = this.page.locator(
        `table tbody tr:has-text("${colourName}")`
      );

      await expect(row).toBeVisible({
        timeout: 10000
      });

      await testInfo.attach(
        'Before Delete Color',
        {
          body: await this.page.screenshot(),
          contentType: 'image/png'
        }
      );

      // First button = Edit
      // Second button = Delete
      const deleteButton = row
        .locator('button')
        .nth(1);

      await expect(deleteButton).toBeVisible();

      await deleteButton.click();

      // Wait for confirmation popup
      await expect(this.deletePopup).toBeVisible({
        timeout: 10000
      });

      // Click confirmation Delete button
      await this.page
        .locator('button.bg-destructive')
        .click();

      await this.page.waitForLoadState('networkidle');
      await this.page.waitForTimeout(2000);

      await testInfo.attach(
        'After Delete Color',
        {
          body: await this.page.screenshot(),
          contentType: 'image/png'
        }
      );

      console.log(`
========== COLOR DELETED ==========
Deleted Color : ${colourName}
==================================
`);
    });
  }

  async verifyDeletedColor(
    colorName: string,
    testInfo: TestInfo
  ): Promise<boolean> {

    let colorDeleted = false;

    await test.step(
      'Verify Deleted Color',
      async () => {

        await this.searchInput.clear();

        await this.searchInput.fill(
          colorName
        );

        await this.page.keyboard.press(
          'Enter'
        );

        await this.page.waitForLoadState(
          'networkidle'
        );

        await this.page.waitForTimeout(
          2000
        );

        const deletedRow =
          this.page
            .locator('tr')
            .filter({
              hasText: colorName
            });

        const rowCount =
          await deletedRow.count();

        colorDeleted =
          rowCount === 0;

        await testInfo.attach(
          'Verify Deleted Color',
          {
            body:
              await this.page.screenshot(),
            contentType:
              'image/png'
          }
        );

        Reporter.validateData(
          'Deleted',
          colorDeleted
            ? 'Deleted'
            : 'Still Exists',
          'Verify deleted color should not appear in summary table',
          testInfo
        );

        expect(
          colorDeleted
        ).toBeTruthy();

        console.log(`
========== DELETE VERIFICATION ==========
Color Name : ${colorName}
Rows Found : ${rowCount}
Status     : ${
  colorDeleted
    ? 'DELETED'
    : 'STILL EXISTS'
}
=========================================
`);
      }
    );

    return colorDeleted;
  }

  async completeAddDeleteColorFlow(
    testInfo: TestInfo
  ): Promise<void> {

    await this.createAndVerifyColor(
      testInfo
    );

    await this.deleteAddedColour(
      this.uniqueColorName,
      testInfo
    );

    await this.verifyDeletedColor(
      this.uniqueColorName,
      testInfo
    );
  }
}