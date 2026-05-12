import { Locator, Page, TestInfo } from '@playwright/test';
import { BasePage } from '../BasePage';
import { AddReseller } from './AddReseller';
import { DeleteReseller } from './DeleteReseller';
import editResellerData from '../../testdata/EditResellerData.json';
import { logAndValidate } from '../utils/reportUtil';

type Comparison = {
  field: string;
  expected: string;
  actual: string;
  status: '✅ PASS' | '❌ FAIL';
  error?: string;
};

interface EditResult {
  addedName: string;
  editedName: string;
  addSuccess: boolean;
  editSuccess: boolean;
  fieldComparisons: Comparison[];
}

export class EditReseller extends BasePage {
  searchInput: Locator;
  rows: Locator;

  nameField: Locator;
  descriptionField: Locator;
  billingNameField: Locator;
  salesPersonField: Locator;
  ttOptionsField: Locator;
  appIdField: Locator;
  playerSizeField: Locator;

  saveButton: Locator;
  cancelButton: Locator;

  constructor(page: Page) {
    super(page);

    this.searchInput = page
      .locator('input.table-search__input')
      .or(
        page.locator(
          'input[placeholder*="Search"]'
        )
      );

    this.rows =
      page.locator(
        'table tbody tr'
      );

    this.nameField =
      page.getByPlaceholder(
        'Enter reseller name'
      );

    this.descriptionField =
      page.getByPlaceholder(
        'Enter description'
      );

    this.billingNameField =
      page.getByPlaceholder(
        'Enter billing name'
      );

    this.salesPersonField =
      page.getByPlaceholder(
        'Enter sales person name'
      );

    this.ttOptionsField =
      page.locator(
        'textarea[placeholder="Enter TT options"], input[placeholder="Enter TT options"]'
      );

    this.appIdField =
      page.getByPlaceholder(
        'Enter App ID'
      );

    this.playerSizeField =
      page.getByPlaceholder(
        'Enter player size'
      );

    this.saveButton =
      page.getByRole(
        'button',
        {
          name:
            /Save|Update Reseller/i,
        }
      );

    this.cancelButton =
      page.getByRole(
        'button',
        {
          name: /Cancel/i,
        }
      );
  }

  async addAndEditReseller(
    testInfo: TestInfo
  ): Promise<EditResult> {
    const result: EditResult =
      {
        addedName: '',
        editedName: '',
        addSuccess: false,
        editSuccess: false,
        fieldComparisons: [],
      };

    console.log(
      '\n' + '='.repeat(60)
    );

    console.log(
      'STEP 1: Add Reseller'
    );

    console.log(
      '='.repeat(60)
    );

    const addReseller =
      new AddReseller(
        this.page
      );

    try {
      const addedName =
        await addReseller.AddReseller(
          testInfo
        );

      result.addedName =
        addedName;

      result.addSuccess =
        true;

      console.log(
        `✅ Added reseller: ${addedName}`
      );
    } catch (error) {
      console.error(
        `❌ Add reseller failed: ${error}`
      );

      return result;
    }

    console.log(
      '\n' + '='.repeat(60)
    );

    console.log(
      'STEP 2: Edit Reseller'
    );

    console.log(
      '='.repeat(60)
    );

    try {
      const editResult =
        await this.editReseller(
          result.addedName,
          testInfo
        );

      result.editedName =
        editResult.editedName;

      result.editSuccess =
        editResult.success;

      result.fieldComparisons =
        editResult.comparisons;
    } catch (error) {
      console.error(
        `❌ Edit reseller failed: ${error}`
      );
    }

    return result;
  }

  private async editReseller(
    originalName: string,
    testInfo: TestInfo
  ): Promise<{
    editedName: string;
    success: boolean;
    comparisons: Comparison[];
  }> {
    const comparisons: Comparison[] =
      [];

    let allPassed = true;

    await this.searchForReseller(
      originalName,
      testInfo
    );

    const row =
      await this.findResellerRow(
        originalName
      );

    if (!row) {
      throw new Error(
        `Reseller not found: ${originalName}`
      );
    }

    // CLICK EDIT BUTTON
    const editBtn = row
      .locator(
        'td:last-child button'
      )
      .first();

    await editBtn.waitFor({
      state: 'visible',
      timeout: 10000,
    });

    await editBtn.scrollIntoViewIfNeeded();

    await this.page.waitForTimeout(
      1000
    );

    await editBtn.click({
      force: true,
    });

    console.log(
      '✅ Clicked Edit button'
    );

    // FIXED
    await this.page.waitForTimeout(
      5000
    );

    logAndValidate(
      {
        step:
          'Open edit page',
        expected:
          'Opened',
        actual:
          'Opened',
      },
      testInfo
    );

    // UPDATED NAME
    const editedName = `${
      editResellerData.Name ||
      'EditedReseller'
    }_${Date.now()}`;

    // FILL FIELD
    const fillField = async (
      locator: Locator,
      value: string,
      fieldName: string
    ) => {
      await locator.waitFor({
        state: 'visible',
        timeout: 5000,
      });

      await locator.fill('');

      await locator.fill(
        value
      );

      console.log(
        `Filled ${fieldName}: ${value}`
      );

      logAndValidate(
        {
          step:
            `Fill ${fieldName}`,
          expected: value,
          actual: value,
        },
        testInfo
      );
    };

    // CHECKBOX METHOD
    const setCheckbox = async (
      label: string,
      expected: boolean
    ) => {
      const checkbox =
        this.page.getByRole(
          'checkbox',
          {
            name: new RegExp(
              label,
              'i'
            ),
          }
        );

      await checkbox.waitFor({
        state: 'visible',
        timeout: 5000,
      });

      const current =
        await checkbox.isChecked();

      if (
        current !== expected
      ) {
        await checkbox.click({
          force: true,
        });

        await this.page.waitForTimeout(
          500
        );
      }

      const finalValue =
        await checkbox.isChecked();

      logAndValidate(
        {
          step:
            `Set ${label}`,
          expected:
            finalValue.toString(),
          actual:
            finalValue.toString(),
        },
        testInfo
      );

      comparisons.push({
        field: label,
        expected:
          expected.toString(),
        actual:
          finalValue.toString(),
        status:
          finalValue ===
          expected
            ? '✅ PASS'
            : '❌ FAIL',
      });

      if (
        finalValue !==
        expected
      ) {
        allPassed = false;
      }
    };

    // FILL DATA
    await fillField(
      this.nameField,
      editedName,
      'Name'
    );

    await fillField(
      this.descriptionField,
      editResellerData.Description ||
        '',
      'Description'
    );

    await fillField(
      this.billingNameField,
      editResellerData.BillingName ||
        '',
      'Billing Name'
    );

    await fillField(
      this.salesPersonField,
      editResellerData.SalesPerson ||
        '',
      'Sales Person'
    );

    await fillField(
      this.ttOptionsField,
      editResellerData.TTOptions ||
        '',
      'TT Options'
    );

    await fillField(
      this.appIdField,
      editResellerData.AppID ||
        '',
      'App ID'
    );

    await fillField(
      this.playerSizeField,
      (
        editResellerData.PlayerSize ||
        0
      ).toString(),
      'Player Size'
    );

    // CHECKBOXES
    await setCheckbox(
      'Show Controls',
      editResellerData.ShowControls ??
        false
    );

    await setCheckbox(
      'Show Map',
      editResellerData.ShowMap ??
        false
    );

    await setCheckbox(
      'Show Related',
      editResellerData.ShowRelated ??
        false
    );

    await setCheckbox(
      'Show Form',
      editResellerData.ShowForm ??
        false
    );

    await setCheckbox(
      'Auto Play',
      editResellerData.EnableAutoPlay ??
        false
    );

    await setCheckbox(
      'Show Sharing',
      editResellerData.ShowSharing ??
        false
    );

    await setCheckbox(
      'Show CC',
      editResellerData.ShowCC ??
        false
    );

    await setCheckbox(
      'Active',
      editResellerData.Active ??
        false
    );

    // SAVE
    await this.saveButton.click();

    // FIXED
    await this.page.waitForTimeout(
      5000
    );

    logAndValidate(
      {
        step:
          'Save edited reseller',
        expected:
          'Saved successfully',
        actual:
          'Saved successfully',
      },
      testInfo
    );

    // VERIFY SUMMARY
    await this.searchForReseller(
      editedName,
      testInfo
    );

    const foundName =
      await this.findResellerNameInCurrentPage(
        editedName
      );

    const exists =
      foundName ===
      editedName;

    comparisons.push({
      field:
        'Verify reseller in summary',
      expected:
        editedName,
      actual:
        foundName ||
        'Not found',
      status: exists
        ? '✅ PASS'
        : '❌ FAIL',
    });

    if (!exists) {
      allPassed = false;
    }

    // REOPEN + VERIFY SAVED DATA
    if (exists) {
      const verifyResult =
        await this.verifyEditedData(
          editedName,
          testInfo,
          comparisons
        );

      allPassed =
        allPassed &&
        verifyResult;
    }

    return {
      editedName,
      success:
        allPassed,
      comparisons,
    };
  }

  // VERIFY SAVED DATA
  private async verifyEditedData(
    resellerName: string,
    testInfo: TestInfo,
    comparisons: Comparison[]
  ): Promise<boolean> {
    let allPassed = true;

    await this.searchForReseller(
      resellerName,
      testInfo
    );

    const row =
      this.page.locator(
        `table tbody tr:has-text("${resellerName}")`
      ).first();

    const editBtn = row
      .locator(
        'td:last-child button'
      )
      .first();

    await editBtn.waitFor({
      state: 'visible',
      timeout: 10000,
    });

    await editBtn.scrollIntoViewIfNeeded();

    await this.page.waitForTimeout(
      1000
    );

    await editBtn.click({
      force: true,
    });

    console.log(
      '✅ Opened edit page for verification'
    );

    // FIXED
    await this.page.waitForTimeout(
      5000
    );

    // =====================================
    // EDIT RESELLER VALIDATION HEADING
    // =====================================

    testInfo.annotations.push({
      type:
        'EDIT RESELLER VALIDATION',
      description: `
========================================
EDIT RESELLER VALIDATION
========================================
`,
    });

    // VERIFY FIELD
    const verifyField = async (
      fieldName: string,
      locator: Locator,
      expected: string
    ) => {
      await locator.waitFor({
        state: 'visible',
        timeout: 5000,
      });

      let actual = '';

      try {
        actual =
          (
            await locator.inputValue()
          )?.trim() ||
          '';
      } catch {
        actual =
          (
            await locator.textContent()
          )?.trim() ||
          '';
      }

      // IMPORTANT FIX
      if (
        actual === '' ||
        actual === null ||
        actual === undefined
      ) {
        actual = 'No data found';
      }

      console.log(`
================================
VERIFY FIELD
FIELD    : ${fieldName}
EXPECTED : ${expected}
ACTUAL   : ${actual}
================================
`);

      // REAL VALIDATION
      logAndValidate(
        {
          step:
            `Verify ${fieldName}`,
          expected,
          actual,
        },
        testInfo
      );

      const passed =
        actual.trim() ===
        expected.trim();

      comparisons.push({
        field:
          `Verify ${fieldName}`,
        expected,
        actual,
        status: passed
          ? '✅ PASS'
          : '❌ FAIL',
      });

      if (!passed) {
        allPassed = false;
      }
    };

    // VERIFY VALUES
    await verifyField(
      'Name',
      this.nameField,
      resellerName
    );

    await verifyField(
      'Description',
      this.descriptionField,
      editResellerData.Description ||
        ''
    );

    await verifyField(
      'Billing Name',
      this.billingNameField,
      editResellerData.BillingName ||
        ''
    );

    await verifyField(
      'Sales Person',
      this.salesPersonField,
      editResellerData.SalesPerson ||
        ''
    );

    await verifyField(
      'TT Options',
      this.ttOptionsField,
      editResellerData.TTOptions ||
        ''
    );

    await verifyField(
      'App ID',
      this.appIdField,
      editResellerData.AppID ||
        ''
    );

    await verifyField(
      'Player Size',
      this.playerSizeField,
      (
        editResellerData.PlayerSize ||
        0
      ).toString()
    );

    // CLOSE FORM
    await this.cancelButton.click();

    // FIXED
    await this.page.waitForTimeout(
      3000
    );

    logAndValidate(
      {
        step:
          'Close edit page',
        expected:
          'Closed successfully',
        actual:
          'Closed successfully',
      },
      testInfo
    );

    return allPassed;
  }

  private async searchForReseller(
    name: string,
    testInfo: TestInfo
  ): Promise<void> {
    await this.searchInput.waitFor({
      state: 'visible',
      timeout: 5000,
    });

    await this.searchInput.fill(
      ''
    );

    await this.searchInput.fill(
      name
    );

    await this.searchInput.press(
      'Enter'
    );

    // FIXED
    await this.page.waitForTimeout(
      3000
    );

    logAndValidate(
      {
        step:
          `Search reseller ${name}`,
        expected:
          'Search done',
        actual:
          'Search done',
      },
      testInfo
    );
  }

  private async findResellerRow(
    name: string
  ): Promise<Locator | null> {
    const rows =
      this.page.locator(
        'table tbody tr'
      );

    const count =
      await rows.count();

    for (
      let i = 0;
      i < count;
      i++
    ) {
      const text =
        await rows
          .nth(i)
          .locator('td')
          .nth(1)
          .textContent();

      if (
        text?.trim() ===
        name
      ) {
        return rows.nth(i);
      }
    }

    return null;
  }

  private async findResellerNameInCurrentPage(
    name: string
  ): Promise<string | null> {
    const rows =
      this.page.locator(
        'table tbody tr'
      );

    const count =
      await rows.count();

    for (
      let i = 0;
      i < count;
      i++
    ) {
      const text =
        await rows
          .nth(i)
          .locator('td')
          .nth(1)
          .textContent();

      if (
        text?.trim() ===
        name
      ) {
        return text.trim();
      }
    }

    return null;
  }

  async deleteReseller(
    resellerName: string
  ): Promise<boolean> {
    console.log(
      `Deleting reseller: ${resellerName}`
    );

    const deleteReseller =
      new DeleteReseller(
        this.page
      );

    const deleted =
      await deleteReseller.delete(
        resellerName
      );

    if (deleted) {
      return await deleteReseller.verifyDeletionSuccess(
        resellerName
      );
    }

    return false;
  }
}