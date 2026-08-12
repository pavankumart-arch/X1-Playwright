import { expect, Locator, Page, TestInfo } from '@playwright/test';
import { BasePage } from '../../../BasePage';
import ModelData from '../../../../testdata/DomainData.json';
import { Reporter } from '../../../utils/NewReport';

export class AddColor extends BasePage {
  addColorButton: Locator;
  colorNameInput: Locator;
  hexCodeInput: Locator;
  activeCheckbox: Locator;
  cancelButton: Locator;
  saveColorButton: Locator;
  addColorHeading: Locator;
  searchInput: Locator;
  editColorInput: Locator;
  editHexCodeInput: Locator;

  uniqueColorName!: string;
  uniqueHexCode!: string;

  constructor(page: Page) {
    super(page);

    this.addColorButton = page.locator(
      '[class="flex items-center gap-2"]'
    );

    // Update these locators if IDs are different
    this.colorNameInput = page.locator(
      '#admin-color-create-colorName'
    );

    this.hexCodeInput = page.locator(
      '#admin-color-create-hexCode'
    );

    this.editColorInput = page.locator(
      '#admin-color-edit-colorName'
    );

    this.editHexCodeInput = page.locator(
      '#admin-color-edit-hexCode'
    );

    this.activeCheckbox = page.locator(
      'svg.lucide-check'
    );

    this.cancelButton = page.getByRole('button', {
      name: 'Cancel'
    });

    this.saveColorButton = page.getByRole('button', {
      name: 'Save Color'
    });

    this.addColorHeading = page.locator('h2').filter({
      hasText: 'Add Color'
    });

    this.searchInput = page.getByPlaceholder(
      'Search'
    );
  }

  async createAndVerifyColor(
    testInfo: TestInfo
  ): Promise<string> {

    // ==========================
    // CREATE COLOR
    // ==========================

    this.uniqueColorName =
      `${ModelData.Colour}_${Date.now()}`;

    // Random Hex Code
    this.uniqueHexCode =
      '#' +
      Math.floor(Math.random() * 16777215)
        .toString(16)
        .padStart(6, '0')
        .toUpperCase();

    await this.clickOnElement(
      this.addColorButton
    );

    await expect(
      this.addColorHeading
    ).toBeVisible({
      timeout: 10000
    });

    await this.fillElement(
      this.colorNameInput,
      this.uniqueColorName
    );

    await this.fillElement(
      this.hexCodeInput,
      this.uniqueHexCode
    );

    await this.clickOnElement(
      this.saveColorButton
    );

    testInfo.annotations.push({
      type: 'Color Created',
      description: `Color Name: ${this.uniqueColorName}
Hex Code: ${this.uniqueHexCode}`
    });

    console.log(
      `Created Color: ${this.uniqueColorName}`
    );

    // ==========================
    // SEARCH COLOR
    // ==========================

    await this.page.waitForLoadState(
      'networkidle'
    );

    await expect(
      this.searchInput
    ).toBeVisible();

    await this.searchInput.clear();

    await this.searchInput.fill(
      this.uniqueColorName
    );

    await this.page.keyboard.press(
      'Enter'
    );

    await this.page.waitForTimeout(
      3000
    );

    const colorRow = this.page
      .locator('tr')
      .filter({
        hasText: this.uniqueColorName
      });

    const rowCount =
      await colorRow.count();

    Reporter.validateSearch(
      this.uniqueColorName,
      rowCount,
      1,
      testInfo
    );

    expect(rowCount).toBeGreaterThan(
      0
    );

    console.log(
      `Color Found in Summary: ${this.uniqueColorName}`
    );

    // ==========================
    // EDIT COLOR FLOW
    // ==========================

    const editButton = colorRow
      .locator('button:has(svg)')
      .first();

    await editButton.click();
const actualColorName =
  await this.editColorInput.first().evaluate(
    (el: any) => el.value
  );
    const actualHexCode =
      await this.editHexCodeInput.inputValue();

    // ==========================
    // VALIDATION
    // ==========================

    Reporter.validateData(
      this.uniqueColorName,
      actualColorName,
      'Edit Color Name Verification',
      testInfo
    );

    Reporter.validateData(
      this.uniqueHexCode,
      actualHexCode,
      'Edit Hex Code Verification',
      testInfo
    );

    expect(actualColorName).toBe(
      this.uniqueColorName
    );

    expect(actualHexCode).toBe(
      this.uniqueHexCode
    );

    console.log(`
====================================
EDIT VERIFICATION SUCCESS
====================================
Expected Color : ${this.uniqueColorName}
Actual Color   : ${actualColorName}

Expected Hex   : ${this.uniqueHexCode}
Actual Hex     : ${actualHexCode}

Status         : PASS
====================================
`);

    testInfo.annotations.push({
      type: 'Edit Verification',
      description: `
Expected Color : ${this.uniqueColorName}
Actual Color   : ${actualColorName}

Expected Hex   : ${this.uniqueHexCode}
Actual Hex     : ${actualHexCode}

Status         : PASS
`
    });

    await this.cancelButton.click();

    return this.uniqueColorName;
  }
}