import { expect, Locator, Page, TestInfo, test } from '@playwright/test';
import { BasePage } from '../../../BasePage';
import ModelData from '../../../../testdata/DomainData.json';
import { Reporter } from '../../../utils/NewReport';
import { AddColor } from './add_color';

export class EditColor extends BasePage {

  addColorButton: Locator;
  colorNameInput: Locator;
  hexCodeInput: Locator;
  updateColorButton: Locator;
  cancelButton: Locator;
  addColorHeading: Locator;
  editColorHeading: Locator;
  searchInput: Locator;
  editColorInput: Locator;
  editHexCodeInput: Locator;

  constructor(page: Page) {
    super(page);

    this.addColorButton = page.locator(
      '[class="flex items-center gap-2"]'
    );

    this.colorNameInput = page.locator(
      '#admin-color-edit-colorName'
    );

    this.hexCodeInput = page.locator(
      '#admin-color-edit-colorName'
    );

    this.editColorInput = page.locator(
      '#admin-color-edit-colorName'
    );

    this.editHexCodeInput = page.locator(
      '#admin-color-edit-hexCode'
    );

    this.updateColorButton = page.getByRole(
      'button',
      {
        name: 'Update Color'
      }
    );

    this.cancelButton = page.getByRole(
      'button',
      {
        name: 'Cancel'
      }
    );

    this.addColorHeading = page.getByRole(
      'heading',
      {
        name: 'Add Color'
      }
    );

    this.editColorHeading = page.getByRole(
      'heading',
      {
        name: 'Edit Color'
      }
    );

    this.searchInput =
      page.getByPlaceholder('Search');
  }

  async editAndVerifyColor(
    testInfo: TestInfo
  ): Promise<void> {

    const addColor =
      new AddColor(this.page);

    // ==========================
    // CREATE COLOR
    // ==========================

    const createdColor =
      await addColor.createAndVerifyColor(
        testInfo
      );

    // ==========================
    // SEARCH COLOR
    // ==========================

    await expect(
      this.searchInput
    ).toBeVisible();

    await this.searchInput.clear();

    await this.searchInput.fill(
      createdColor
    );

    await this.page.keyboard.press(
      'Enter'
    );

    await this.page.waitForTimeout(
      2000
    );

    const colorRow =
      this.page
        .locator('tr')
        .filter({
          hasText: createdColor
        });

    await expect(
      colorRow
    ).toHaveCount(1);

    // ==========================
    // OPEN EDIT PAGE
    // ==========================

    await test.step(
      'Open Edit Color Page',
      async () => {

        await colorRow
          .locator('button')
          .first()
          .click();

        await expect(
          this.editColorHeading
        ).toBeVisible({
          timeout: 10000
        });

        await testInfo.attach(
          'Edit Color Page',
          {
            body:
              await this.page.screenshot(),
            contentType:
              'image/png'
          }
        );
      }
    );

    // ==========================
    // UPDATE COLOR
    // ==========================

    const updatedColorName =
      `${ModelData.editcolor}_${Date.now()}`;

    await test.step(
      'Update Color',
      async () => {

        await expect(
          this.editColorInput
        ).toBeVisible();

        const existingColor =
          await this.editColorInput
            .inputValue();

        console.log(
          `Existing Color : ${existingColor}`
        );

        await this.editColorInput
          .clear();

        await this.editColorInput
          .fill(updatedColorName);

        await this.updateColorButton
          .click();

        await expect(
          this.searchInput
        ).toBeVisible({
          timeout: 10000
        });

        await testInfo.attach(
          'After Update',
          {
            body:
              await this.page.screenshot(),
            contentType:
              'image/png'
          }
        );
      }
    );

    // ==========================
    // VERIFY UPDATED COLOR
    // ==========================

    await test.step(
      'Verify Updated Color',
      async () => {

        await this.searchInput
          .clear();

        await this.searchInput
          .fill(updatedColorName);

        await this.page.keyboard
          .press('Enter');

        await this.page.waitForTimeout(
          2000
        );

        const updatedRow =
          this.page
            .locator('tr')
            .filter({
              hasText:
                updatedColorName
            });

        const rowCount =
          await updatedRow.count();

        Reporter.validateSearch(
          updatedColorName,
          rowCount,
          1,
          testInfo
        );

        expect(rowCount)
          .toBeGreaterThan(0);
      }
    );

    // ==========================
    // REOPEN EDIT PAGE
    // ==========================

    await test.step(
      'Reopen Edit Page',
      async () => {

        const updatedRow =
          this.page
            .locator('tr')
            .filter({
              hasText:
                updatedColorName
            });

        await updatedRow
          .locator('button')
          .first()
          .click();

        await expect(
          this.editColorHeading
        ).toBeVisible();

        await testInfo.attach(
          'Reopen Edit Page',
          {
            body:
              await this.page.screenshot(),
            contentType:
              'image/png'
          }
        );
      }
    );

    // ==========================
    // VERIFY INPUT VALUE
    // ==========================

    await test.step(
      'Verify Updated Value',
      async () => {

        const actualColor =
          await this.editColorInput
            .inputValue();

        Reporter.validateData(
          updatedColorName,
          actualColor,
          'Edit Color Verification',
          testInfo
        );

        expect(
          actualColor
        ).toBe(
          updatedColorName
        );

        console.log(`
====================================
EDIT COLOR VERIFICATION SUCCESS
====================================
Expected : ${updatedColorName}
Actual   : ${actualColor}
Status   : PASS
====================================
`);

        await testInfo.attach(
          'Verify Input Value',
          {
            body:
              await this.page.screenshot(),
            contentType:
              'image/png'
          }
        );
      }
    );

    // ==========================
    // CANCEL
    // ==========================

    await test.step(
  'Click Cancel',
  async () => {

    await this.cancelButton.click();

    // Wait for UI update
    await this.page.waitForTimeout(2000);

    console.log(
      'Cancel button clicked successfully'
    );

    await testInfo.attach(
      'After Cancel',
      {
        body: await this.page.screenshot(),
        contentType: 'image/png'
      }
    );
  }
);

return;
}}