import { expect, Locator, Page, TestInfo } from '@playwright/test';
import { BasePage } from '../../../BasePage';
import ModelData from '../../../../testdata/DomainData.json';
import { Reporter } from '../../../utils/NewReport';

export class AddTrim extends BasePage {
  addTrimButton: Locator;
  TrimNameInput: Locator;
  activeCheckbox: Locator;
  cancelButton: Locator;
  saveModelButton: Locator;
  addModelHeading: Locator;
  searchInput: Locator;
  editTrimInput: Locator;


  protected expectedModelName: string = '';
  protected makeName: string = '';

  private uniqueTrimName!: string;

  constructor(page: Page) {
    super(page);

    this.addTrimButton = page.locator('button').filter({ hasText: 'Trim' });
    this.editTrimInput = page.locator('#admin-trim-edit-trimName');

    this.TrimNameInput = page.locator('#admin-trim-create-trimName');

    this.activeCheckbox = page.locator('svg.lucide-check');

    this.cancelButton = page.getByRole('button', { name: 'Cancel' });

    this.saveModelButton = page.getByRole('button', { name: 'Save Trim' });

    this.addModelHeading = page.locator('h2').filter({
      hasText: 'Add Trim'
    });

    this.searchInput = page.getByPlaceholder('Search');
  }

  async createAndVerifyTrim(testInfo: TestInfo): Promise<string> {

    // ==========================
    // CREATE TRIM
    // ==========================
    this.uniqueTrimName = `${ModelData.Trimname}_${Date.now()}`;

    await this.clickOnElement(this.addTrimButton);

    await expect(this.addModelHeading).toBeVisible({
      timeout: 10000
    });

    await this.fillElement(this.TrimNameInput, this.uniqueTrimName);

    await this.clickOnElement(this.saveModelButton);

    testInfo.annotations.push({
      type: 'Trim Created',
      description: `Trim Name: ${this.uniqueTrimName}`
    });

    console.log(`Created Trim: ${this.uniqueTrimName}`);

    // ==========================
    // SEARCH TRIM
    // ==========================
    await this.page.waitForLoadState('networkidle');

    await expect(this.searchInput).toBeVisible();

    await this.searchInput.clear();
    await this.searchInput.fill(this.uniqueTrimName);
    await this.page.keyboard.press('Enter');

    await this.page.waitForTimeout(3000);

    const trimRow = this.page.locator('tr').filter({
      hasText: this.uniqueTrimName
    });

    const rowCount = await trimRow.count();

    Reporter.validateSearch(
      this.uniqueTrimName,
      rowCount,
      1,
      testInfo
    );

    expect(rowCount).toBeGreaterThan(0);

    console.log(`Trim Found in Summary: ${this.uniqueTrimName}`);

    // ==========================
    // EDIT TRIM FLOW
    // ==========================

const editButton = trimRow
  .locator('button:has(svg)')
  .first();

await editButton.click();

// Wait for Edit popup/page to load
await this.page.waitForTimeout(3000);

// Debug logs
console.log(
  'Edit Field Count:',
  await this.page.locator('#admin-trim-edit-trimName').count()
);

console.log(
  'Edit Field Visible:',
  await this.editTrimInput.isVisible().catch(() => false)
);

// Wait for edit field
await expect(this.editTrimInput).toBeVisible({
  timeout: 10000
});

// Read value
const actualTrimName = await this.editTrimInput.inputValue();

console.log('Expected Trim Name:', this.uniqueTrimName);
console.log('Actual Trim Name  :', actualTrimName);

    // ==========================
    // VALIDATION
    // ==========================
    Reporter.validateData(
      this.uniqueTrimName,
      actualTrimName,
      'Edit Trim Name Verification',
      testInfo
    );

    expect(actualTrimName).toBe(this.uniqueTrimName);

    console.log(`
====================================
EDIT VERIFICATION SUCCESS
====================================
Expected : ${this.uniqueTrimName}
Actual   : ${actualTrimName}
Status   : PASS
====================================
`);

    testInfo.annotations.push({
      type: 'Edit Verification',
      description: `
Expected : ${this.uniqueTrimName}
Actual   : ${actualTrimName}
Status   : PASS
`
    });
await this.cancelButton.click()
    return this.uniqueTrimName;
  }
}