import { expect, Locator, Page, TestInfo, test } from '@playwright/test';
import { BasePage } from '../../../BasePage';
import ModelData from '../../../../testdata/DomainData.json';
import { Reporter } from '../../../utils/NewReport';
import { AddBodyType } from './add-bodytype';

export class EditBodyType extends BasePage {

  addBodyTypeButton: Locator;
  bodyTypeInput: Locator;
  editBodyTypeInput: Locator;
  activeCheckbox: Locator;
  cancelButton: Locator;
  saveBodyTypeButton: Locator;
  updateBodyTypeButton: Locator;
  addBodyTypeHeading: Locator;
  editBodyTypeHeading: Locator;
  searchInput: Locator;
  editButton: Locator;

  constructor(page: Page) {
    super(page);

    this.addBodyTypeButton = page.getByRole('button', {
      name: /Body Type/i
    });

    this.bodyTypeInput = page.locator(
      '#admin-body-type-create-bodyTypeName'
    );

    this.editBodyTypeInput = page.locator(
      '#admin-body-type-edit-bodyTypeName'
    );

    this.activeCheckbox = page.locator('svg.lucide-check');

    this.cancelButton = page.getByRole('button', {
      name: 'Cancel'
    });

    this.saveBodyTypeButton = page.getByRole('button', {
      name: 'Save Body Type'
    });

    this.updateBodyTypeButton = page.getByRole('button', {
      name: 'Update Body Type'
    });

    this.addBodyTypeHeading = page.getByRole('heading', {
      name: 'Add Body Type'
    });

    this.editBodyTypeHeading = page.getByRole('heading', {
      name: 'Edit Body Type'
    });

    this.searchInput = page.getByPlaceholder('Search');

    this.editButton = page.locator('svg.lucide-square-pen').first();
  }

  async editAndVerifyBodyType(
    testInfo: TestInfo
  ): Promise<void> {

    const addBodyType = new AddBodyType(this.page);

    // =====================================
    // CREATE BODY TYPE
    // =====================================

    const createdBodyType =
      await addBodyType.createAndVerifyBodyType(testInfo);

    // =====================================
    // SEARCH CREATED BODY TYPE
    // =====================================

    await expect(this.searchInput).toBeVisible();

    await this.searchInput.clear();

    await this.searchInput.fill(createdBodyType);

    await this.page.keyboard.press('Enter');

    await this.page.waitForTimeout(2000);

    const bodyTypeRow = this.page.locator('tr').filter({
      hasText: createdBodyType
    });

    await expect(bodyTypeRow).toHaveCount(1);

    // =====================================
    // OPEN EDIT PAGE
    // =====================================

    await test.step(
      'Open Edit Body Type Page',
      async () => {

        const editButton =
          bodyTypeRow.locator('button').first();

        await editButton.click();

        await expect(
          this.editBodyTypeHeading
        ).toBeVisible({
          timeout: 10000
        });

        console.log(
          'Edit Body Type page displayed'
        );

        await testInfo.attach(
          'Edit Body Type Page',
          {
            body: await this.page.screenshot(),
            contentType: 'image/png'
          }
        );
      }
    );

    // =====================================
    // UPDATE BODY TYPE
    // =====================================

    const updatedBodyTypeName =
      `${ModelData.editbodytype}_${Date.now()}`;

    await test.step(
      'Update Body Type',
      async () => {

        await expect(
          this.editBodyTypeInput
        ).toBeVisible();

        const existingBodyType =
          await this.editBodyTypeInput.inputValue();

        console.log(
          `Existing Body Type : ${existingBodyType}`
        );

        await this.editBodyTypeInput.clear();

        await this.editBodyTypeInput.fill(
          updatedBodyTypeName
        );

        await this.updateBodyTypeButton.click();

        await expect(
          this.searchInput
        ).toBeVisible({
          timeout: 10000
        });

        console.log(
          `Updated Body Type : ${updatedBodyTypeName}`
        );

        await testInfo.attach(
          'After Update',
          {
            body: await this.page.screenshot(),
            contentType: 'image/png'
          }
        );
      }
    );

    // =====================================
    // VERIFY UPDATED BODY TYPE
    // =====================================

    await test.step(
      'Verify Updated Body Type',
      async () => {

        await this.searchInput.clear();

        await this.searchInput.fill(
          updatedBodyTypeName
        );

        await this.page.keyboard.press('Enter');

        await this.page.waitForTimeout(2000);

        const updatedRow =
          this.page.locator('tr').filter({
            hasText: updatedBodyTypeName
          });

        const rowCount =
          await updatedRow.count();

        Reporter.validateSearch(
          updatedBodyTypeName,
          rowCount,
          1,
          testInfo
        );

        expect(rowCount).toBeGreaterThan(0);

        console.log(
          `Updated Body Type Found : ${updatedBodyTypeName}`
        );
      }
    );

    // =====================================
    // REOPEN EDIT PAGE
    // =====================================

    await test.step(
      'Reopen Edit Page',
      async () => {

        const updatedRow =
          this.page.locator('tr').filter({
            hasText: updatedBodyTypeName
          });

        await updatedRow
          .locator('button')
          .first()
          .click();

        await expect(
          this.editBodyTypeHeading
        ).toBeVisible();

        await testInfo.attach(
          'Reopen Edit Page',
          {
            body: await this.page.screenshot(),
            contentType: 'image/png'
          }
        );
      }
    );

    // =====================================
    // VERIFY INPUT VALUE
    // =====================================

    await test.step(
      'Verify Updated Value',
      async () => {

        await expect(
          this.editBodyTypeInput
        ).toBeVisible();

        const actualBodyTypeName =
          await this.editBodyTypeInput.inputValue();

        Reporter.validateData(
          updatedBodyTypeName,
          actualBodyTypeName,
          'Edit Body Type Verification',
          testInfo
        );

        expect(actualBodyTypeName)
          .toBe(updatedBodyTypeName);

        console.log(`
====================================
EDIT BODY TYPE VERIFICATION SUCCESS
====================================
Expected : ${updatedBodyTypeName}
Actual   : ${actualBodyTypeName}
Status   : PASS
====================================
`);

        await testInfo.attach(
          'Verify Input Value',
          {
            body: await this.page.screenshot(),
            contentType: 'image/png'
          }
        );
      }
    );

    // =====================================
    // CANCEL
    // =====================================

    await test.step(
      'Click Cancel',
      async () => {

        await this.cancelButton.click();

        await expect(
          this.searchInput
        ).toBeVisible();

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
  }
}