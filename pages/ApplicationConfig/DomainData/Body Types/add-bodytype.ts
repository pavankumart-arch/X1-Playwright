import { expect, Locator, Page, TestInfo } from '@playwright/test';
import { BasePage } from '../../../BasePage';
import ModelData from '../../../../testdata/DomainData.json';
import { Reporter } from '../../../utils/NewReport';

export class AddBodyType extends BasePage {

  addBodyTypeButton: Locator;
  bodyTypeInput: Locator;
  editBodyTypeInput: Locator;
  activeCheckbox: Locator;
  cancelButton: Locator;
  saveBodyTypeButton: Locator;
  addBodyTypeHeading: Locator;
  searchInput: Locator;

  private uniqueBodyTypeName!: string;

  constructor(page: Page) {
    super(page);

    // this.addBodyTypeButton = page.getByRole('button', {
    //   name: /Body Type/i
    // });
     this.addBodyTypeButton = page.locator(
      '[class="flex items-center gap-2"]'
    );

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

    this.addBodyTypeHeading = page.locator('h2').filter({
      hasText: 'Add Body Type'
    });

    this.searchInput = page.getByPlaceholder('Search');
  }

  async createAndVerifyBodyType(
    testInfo: TestInfo
  ): Promise<string> {

    // ==========================
    // CREATE BODY TYPE
    // ==========================
    this.uniqueBodyTypeName =
      `${ModelData.newbodytype}_${Date.now()}`;

    await this.clickOnElement(this.addBodyTypeButton);

    await expect(this.addBodyTypeHeading).toBeVisible({
      timeout: 10000
    });

    await this.fillElement(
      this.bodyTypeInput,
      this.uniqueBodyTypeName
    );

    await this.clickOnElement(this.saveBodyTypeButton);

    testInfo.annotations.push({
      type: 'Body Type Created',
      description: `Body Type Name: ${this.uniqueBodyTypeName}`
    });

    console.log(
      `Created Body Type: ${this.uniqueBodyTypeName}`
    );

    // ==========================
    // SEARCH BODY TYPE
    // ==========================
    await this.page.waitForLoadState('networkidle');

    await expect(this.searchInput).toBeVisible();

    await this.searchInput.clear();
    await this.searchInput.fill(this.uniqueBodyTypeName);
    await this.page.keyboard.press('Enter');

    await this.page.waitForTimeout(3000);

    const bodyTypeRow = this.page.locator('tr').filter({
      hasText: this.uniqueBodyTypeName
    });

    const rowCount = await bodyTypeRow.count();

    Reporter.validateSearch(
      this.uniqueBodyTypeName,
      rowCount,
      1,
      testInfo
    );

    expect(rowCount).toBeGreaterThan(0);

    console.log(
      `Body Type Found in Summary: ${this.uniqueBodyTypeName}`
    );

    // ==========================
    // EDIT BODY TYPE FLOW
    // ==========================
 const editButton = bodyTypeRow
  .locator('button:has(svg)')
  .first();

await editButton.click();

await this.page.waitForLoadState('networkidle');
await this.page.waitForTimeout(2000);

console.log(
  'Current URL:',
  await this.page.url()
);

const actualBodyTypeName =
  await this.editBodyTypeInput.inputValue();

console.log(
  'Actual Body Type:',
  actualBodyTypeName
);

    // ==========================
    // VALIDATION
    // ==========================
    Reporter.validateData(
      this.uniqueBodyTypeName,
      actualBodyTypeName,
      'Edit Body Type Verification',
      testInfo
    );

    expect(actualBodyTypeName).toBe(
      this.uniqueBodyTypeName
    );

    console.log(`
====================================
EDIT VERIFICATION SUCCESS
====================================
Expected : ${this.uniqueBodyTypeName}
Actual   : ${actualBodyTypeName}
Status   : PASS
====================================
`);

    testInfo.annotations.push({
      type: 'Edit Verification',
      description: `
Expected : ${this.uniqueBodyTypeName}
Actual   : ${actualBodyTypeName}
Status   : PASS
`
    });

    await this.cancelButton.click();

    return this.uniqueBodyTypeName;
  }
}