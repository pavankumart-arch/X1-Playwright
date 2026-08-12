import { expect, Locator, Page, TestInfo } from '@playwright/test';
import { BasePage } from '../../../BasePage';
import ModelData from '../../../../testdata/DomainData.json';
import { Reporter } from '../../../utils/NewReport';

export class updateBodyType extends BasePage {

  addBodyTypeButton: Locator;
  bodyTypeInput: Locator;
  editBodyTypeInput: Locator;
  activeCheckbox: Locator;
  cancelButton: Locator;
  saveBodyTypeButton: Locator;
  addBodyTypeHeading: Locator;
  editBodyTypeHeading: Locator;
  searchInput: Locator;

  private uniqueBodyTypeName!: string;

  constructor(page: Page) {
    super(page);

    // Add Body Type button
    this.addBodyTypeButton = page.locator(
      '[class="flex items-center gap-2"]'
    );

    // Add Body Type input field
    this.bodyTypeInput = page.locator(
      '#admin-body-type-create-bodyTypeName'
    );

    // Edit Body Type input field
    this.editBodyTypeInput = page.locator(
      '#admin-body-type-edit-bodyTypeName'
    );

    // Active checkbox
    this.activeCheckbox = page.locator('svg.lucide-check');

    // Cancel button
    this.cancelButton = page.getByRole('button', {
      name: 'Cancel'
    });

    // Save button
    this.saveBodyTypeButton = page.getByRole('button', {
      name: 'Save Body Type'
    });

    // Add Body Type Heading
    this.addBodyTypeHeading = page.locator('h2').filter({
      hasText: 'Add Body Type'
    });

    // Edit Body Type Heading
    this.editBodyTypeHeading = page.locator('h2').filter({
      hasText: 'Edit Body Type'
    });

    // Search field
    this.searchInput = page.getByPlaceholder('Search');
  }

  // ============================================================
  // CREATE BODY TYPE
  // ============================================================
  async createAndVerifyBodyType(
    testInfo: TestInfo
  ): Promise<string> {

    this.uniqueBodyTypeName =
      `${ModelData.newbodytype}_${Date.now()}`;

    // Click Add Body Type
    await this.clickOnElement(this.addBodyTypeButton);

    // Verify Add page displayed
    await expect(this.addBodyTypeHeading).toBeVisible({
      timeout: 10000
    });

    // Enter Body Type name
    await this.fillElement(
      this.bodyTypeInput,
      this.uniqueBodyTypeName
    );

    // Save
    await this.clickOnElement(this.saveBodyTypeButton);

    // Reporting
    testInfo.annotations.push({
      type: 'Body Type Created',
      description: `Body Type Name: ${this.uniqueBodyTypeName}`
    });

    console.log(
      `Created Body Type: ${this.uniqueBodyTypeName}`
    );

    // Search and verify in summary page
    await this.searchBodyType(
      this.uniqueBodyTypeName,
      testInfo
    );

    return this.uniqueBodyTypeName;
  }

  // ============================================================
  // SEARCH BODY TYPE
  // ============================================================
  async searchBodyType(
    bodyTypeName: string,
    testInfo: TestInfo
  ): Promise<void> {

    await this.page.waitForLoadState('networkidle');

    await expect(this.searchInput).toBeVisible();

    await this.searchInput.clear();
    await this.searchInput.fill(bodyTypeName);
    await this.page.keyboard.press('Enter');

    await this.page.waitForTimeout(3000);

    const bodyTypeRow = this.page.locator('tr').filter({
      hasText: bodyTypeName
    });

    const rowCount = await bodyTypeRow.count();

    Reporter.validateSearch(
      bodyTypeName,
      rowCount,
      1,
      testInfo
    );

    expect(rowCount).toBeGreaterThan(0);

    console.log(
      `Body Type Found in Summary: ${bodyTypeName}`
    );
  }

  // ============================================================
  // VERIFY ADDED BODY TYPE FROM EDIT PAGE
  // ============================================================
  async verifyAddedBodyType(
    expectedBodyType: string,
    testInfo: TestInfo
  ): Promise<void> {

    // Search Body Type
    await this.searchBodyType(
      expectedBodyType,
      testInfo
    );

    // Locate searched row
    const bodyTypeRow = this.page.locator('tr').filter({
      hasText: expectedBodyType
    });

    // Click Edit button
    const editButton = bodyTypeRow
      .locator('button')
      .first();

    await editButton.click();

    // Wait for Edit page
    await this.page.waitForLoadState('networkidle');
    await this.page.waitForTimeout(2000);

    // Verify Edit Heading
    await expect(
      this.editBodyTypeHeading
    ).toBeVisible();

    console.log(
      'Edit Body Type page displayed successfully'
    );

    // Get actual value from input field
    const actualBodyType =
      await this.editBodyTypeInput.inputValue();

    console.log(
      `Expected Body Type : ${expectedBodyType}`
    );

    console.log(
      `Actual Body Type : ${actualBodyType}`
    );

    // Validation
    Reporter.validateData(
      expectedBodyType,
      actualBodyType,
      'Verify Added Body Type',
      testInfo
    );

    expect(actualBodyType).toBe(
      expectedBodyType
    );

    console.log(`
=================================================
VERIFY BODY TYPE SUCCESS
=================================================
Expected : ${expectedBodyType}
Actual   : ${actualBodyType}
Status   : PASS
=================================================
`);

    testInfo.annotations.push({
      type: 'Verify Added Body Type',
      description: `
Expected : ${expectedBodyType}
Actual   : ${actualBodyType}
Status   : PASS
`
    });

    // Return back to summary page
    await this.cancelButton.click();
  }
}