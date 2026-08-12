import { expect, Locator, Page, TestInfo } from '@playwright/test';
import { BasePage } from '../../../BasePage';
import ModelData from '../../../../testdata/DomainData.json';
import { Reporter } from '../../../utils/NewReport';

export class Addyear extends BasePage {
  addyearButton: Locator;
  yearNameInput: Locator;
  activeCheckbox: Locator;
  cancelButton: Locator;
  saveyearButton: Locator;
  addyearHeading: Locator;
  searchInput: Locator;
  editYearInput: Locator;

  protected expectedModelName: string = '';
  protected makeName: string = '';

  uniqueYearName!: string;

  constructor(page: Page) {
    super(page);

    this.addyearButton = page.locator('[class="flex items-center gap-2"]');

    // Update this locator if your application uses a different ID
    this.editYearInput = page.locator('#admin-year-edit-year');

    this.yearNameInput = page.locator('#admin-year-create-year');

    this.activeCheckbox = page.locator('svg.lucide-check');

    this.cancelButton = page.getByRole('button', {
      name: 'Cancel'
    });

    this.saveyearButton = page.getByRole('button', {
      name: 'Save Year'
    });

    this.addyearHeading = page.locator('h2').filter({
      hasText: 'Add Year'
    });

    this.searchInput = page.getByPlaceholder('Search');
  }

  async createAndVerifyYear(testInfo: TestInfo): Promise<string> {
    // ==========================
    // CREATE YEAR
    // ==========================
const baseYear = Number(ModelData.Yearname);

this.uniqueYearName = String(
  baseYear + Math.floor(Math.random() * 50) + 1
);

    await this.clickOnElement(this.addyearButton);

    await expect(this.addyearHeading).toBeVisible({
      timeout: 10000
    });

    await this.fillElement(
      this.yearNameInput,
      this.uniqueYearName
    );

    await this.clickOnElement(this.saveyearButton);

    testInfo.annotations.push({
      type: 'Year Created',
      description: `Year Name: ${this.uniqueYearName}`
    });

    console.log(`Created Year: ${this.uniqueYearName}`);

    // ==========================
    // SEARCH YEAR
    // ==========================

    await this.page.waitForLoadState('networkidle');

    await expect(this.searchInput).toBeVisible();

    await this.searchInput.clear();
    await this.searchInput.fill(this.uniqueYearName);
    await this.page.keyboard.press('Enter');

    await this.page.waitForTimeout(3000);

    const yearRow = this.page.locator('tr').filter({
      hasText: this.uniqueYearName
    });

    const rowCount = await yearRow.count();

    Reporter.validateSearch(
      this.uniqueYearName,
      rowCount,
      1,
      testInfo
    );

    expect(rowCount).toBeGreaterThan(0);

    console.log(
      `Year Found in Summary: ${this.uniqueYearName}`
    );

    // ==========================
    // EDIT YEAR FLOW
    // ==========================

    const editButton = yearRow
      .locator('button:has(svg)')
      .first();

    await editButton.click();

    const actualYearName =
      await this.editYearInput.inputValue();

    // ==========================
    // VALIDATION
    // ==========================

    Reporter.validateData(
      this.uniqueYearName,
      actualYearName,
      'Edit Year Name Verification',
      testInfo
    );

    expect(actualYearName).toBe(
      this.uniqueYearName
    );

    console.log(`
====================================
EDIT VERIFICATION SUCCESS
====================================
Expected : ${this.uniqueYearName}
Actual   : ${actualYearName}
Status   : PASS
====================================
`);

    testInfo.annotations.push({
      type: 'Edit Verification',
      description: `
Expected : ${this.uniqueYearName}
Actual   : ${actualYearName}
Status   : PASS
`
    });

    await this.cancelButton.click();

    return this.uniqueYearName;
  }
}