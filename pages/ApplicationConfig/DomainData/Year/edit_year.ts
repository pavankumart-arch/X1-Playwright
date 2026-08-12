import { expect, Locator, Page, TestInfo, test } from '@playwright/test';
import { BasePage } from '../../../BasePage';
import ModelData from '../../../../testdata/DomainData.json';
import { Reporter } from '../../../utils/NewReport';
import { Addyear } from './add_year';


export class EditYear extends BasePage {

  addYearButton: Locator;
  yearNameInput: Locator;
  activeCheckbox: Locator;
  cancelButton: Locator;
  saveYearButton: Locator;
  updateYearButton: Locator;
  addYearHeading: Locator;
  editYearHeading: Locator;
  searchInput: Locator;
  editButton: Locator;

  constructor(page: Page) {
    super(page);

    this.addYearButton = page.locator('button').filter({
      hasText: 'Year'
    });

    this.yearNameInput = page.locator('input[type="text"]').first();

    this.activeCheckbox = page.locator('svg.lucide-check');

    this.cancelButton = page.getByRole('button', {
      name: 'Cancel'
    });

    this.saveYearButton = page.getByRole('button', {
      name: 'Save Year'
    });

    this.updateYearButton = page.getByRole('button', {
      name: 'Update Year'
    });

    this.addYearHeading = page.getByRole('heading', {
      name: 'Add Year'
    });

    this.editYearHeading = page.getByRole('heading', {
      name: 'Edit Year'
    });

    this.searchInput = page.getByPlaceholder('Search');

    this.editButton = page.locator('svg.lucide-square-pen').first();
  }

  async editAndVerifyYear(testInfo: TestInfo): Promise<void> {

    const addYear = new Addyear(this.page);

    // =====================================
    // CREATE YEAR
    // =====================================

    const createdYear = await addYear.createAndVerifyYear(testInfo);

    // =====================================
    // SEARCH CREATED YEAR
    // =====================================

    await expect(this.searchInput).toBeVisible();

    await this.searchInput.clear();

    await this.searchInput.fill(createdYear);

    await this.page.keyboard.press('Enter');

    await this.page.waitForTimeout(2000);

    const yearRow = this.page.locator('tr').filter({
      hasText: createdYear
    });

    await expect(yearRow).toHaveCount(1);

    // =====================================
    // OPEN EDIT PAGE
    // =====================================

    await test.step('Open Edit Year Page', async () => {

      const editButton = yearRow.locator('button').first();

      await editButton.click();

      await expect(this.editYearHeading).toBeVisible({
        timeout: 10000
      });

      console.log('Edit Year page displayed');

      await testInfo.attach('Edit Year Page', {
        body: await this.page.screenshot(),
        contentType: 'image/png'
      });
    });

    // =====================================
    // UPDATE YEAR
    // =====================================

    const updatedYearName =
      `${ModelData['EditYear']}_${Date.now()}`;

    await test.step('Update Year', async () => {

      await expect(this.yearNameInput).toBeVisible();

      const existingYear =
        await this.yearNameInput.inputValue();

      console.log(
        `Existing Year Name : ${existingYear}`
      );

      await this.yearNameInput.clear();

      await this.yearNameInput.fill(updatedYearName);

      await this.updateYearButton.click();

      await expect(this.searchInput).toBeVisible({
        timeout: 10000
      });

      console.log(
        `Updated Year Name : ${updatedYearName}`
      );

      await testInfo.attach('After Update', {
        body: await this.page.screenshot(),
        contentType: 'image/png'
      });
    });

    // =====================================
    // VERIFY UPDATED YEAR
    // =====================================

    await test.step('Verify Updated Year', async () => {

      await this.searchInput.clear();

      await this.searchInput.fill(updatedYearName);

      await this.page.keyboard.press('Enter');

      await this.page.waitForTimeout(2000);

      const updatedRow = this.page.locator('tr').filter({
        hasText: updatedYearName
      });

      const rowCount =
        await updatedRow.count();

      Reporter.validateSearch(
        updatedYearName,
        rowCount,
        1,
        testInfo
      );

      expect(rowCount).toBeGreaterThan(0);

      console.log(
        `Updated Year Found : ${updatedYearName}`
      );
    });

    // =====================================
    // REOPEN EDIT PAGE
    // =====================================

    await test.step('Reopen Edit Page', async () => {

      const updatedRow = this.page.locator('tr').filter({
        hasText: updatedYearName
      });

      await updatedRow
        .locator('button')
        .first()
        .click();

      await expect(this.editYearHeading).toBeVisible();

      await testInfo.attach(
        'Reopen Edit Page',
        {
          body: await this.page.screenshot(),
          contentType: 'image/png'
        }
      );
    });

    // =====================================
    // VERIFY INPUT VALUE
    // =====================================

    await test.step(
      'Verify Updated Value',
      async () => {

        await expect(
          this.yearNameInput
        ).toBeVisible();

        const actualYearName =
          await this.yearNameInput.inputValue();

        Reporter.validateData(
          updatedYearName,
          actualYearName,
          'Edit Year Verification',
          testInfo
        );

        expect(actualYearName)
          .toBe(updatedYearName);

        console.log(`
====================================
EDIT YEAR VERIFICATION SUCCESS
====================================
Expected : ${updatedYearName}
Actual   : ${actualYearName}
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