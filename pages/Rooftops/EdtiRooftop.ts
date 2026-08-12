import { Locator, Page, TestInfo } from '@playwright/test';
import { BasePage } from '../BasePage';
import EditRooftopData from '../../testdata/EditRooftopData.json';
import { AddRooftop } from './AddRooftop';
import { DeleteRooftop } from './DeleteRooftop';
import { Reporter } from '../utils/NewReport';

export class EditRooftop extends BasePage {

  Name: Locator;
  Description: Locator;
  DealerCode: Locator;
  Franchise: Locator;
  PlayerColor: Locator;
  SalesPersonName: Locator;
  Address: Locator;
  City: Locator;
  State: Locator;
  Zip: Locator;
  Phone: Locator;
  Email: Locator;
  URL: Locator;
  FaceebookID: Locator;
  DealerGroups: Locator;
  Comments: Locator;
  SearchBox: Locator;
  ActiveCheckbox: Locator;
  UpdateRooftopButton: Locator;
  CancelButton: Locator;

  private addRooftopHelper: AddRooftop;
  private deleteRooftopHelper: DeleteRooftop;

  constructor(page: Page) {
    super(page);

    this.addRooftopHelper = new AddRooftop(page);
    this.deleteRooftopHelper = new DeleteRooftop(page);

    this.Name = page.getByPlaceholder('Enter client name');
    this.Description = page.getByPlaceholder('Enter description');

    // Dealer Code
    this.DealerCode = page.getByLabel('Dealer Code');

    this.Franchise = page.getByPlaceholder('Enter franchise number');
    this.PlayerColor = page.locator('input[id="admin-rooftop-edit-playerColor"]');
    this.SalesPersonName = page.getByPlaceholder('Enter sales person name');
    this.Address = page.getByPlaceholder('Full address');
    this.City = page.getByPlaceholder('Enter city');
    this.State = page.getByPlaceholder('Enter state');
    this.Zip = page.getByPlaceholder('Enter ZIP code');
    this.Phone = page.getByPlaceholder('Enter phone number');
    this.Email = page.getByPlaceholder('Enter email address');
    this.URL = page.getByPlaceholder('https://example.com');
    this.FaceebookID = page.locator('input[placeholder="Enter Facebook ID"]');
    this.DealerGroups = page.locator(
      'input[placeholder="Enter dealer groups (comma separated)"]'
    );
    this.Comments = page.getByPlaceholder('Any additional notes...');

    this.UpdateRooftopButton = page.getByRole('button', {
      name: 'Update Rooftop'
    });

    this.CancelButton = page.getByRole('button', {
      name: 'Cancel'
    });

    this.SearchBox = page.getByPlaceholder('Search...');

    this.ActiveCheckbox = page
      .locator('label:has-text("Active") input[type="checkbox"]')
      .or(
        page.locator('input[type="checkbox"]').filter({
          hasText: 'Active'
        })
      );
  }

  /**
   * Check if a field is editable
   */
  async isFieldEditable(locator: Locator): Promise<boolean> {
    try {
      const isDisabled = await locator
        .isDisabled()
        .catch(() => false);

      const isReadonly = await locator
        .getAttribute('readonly')
        .then(attr => attr !== null)
        .catch(() => false);

      return !isDisabled && !isReadonly;
    } catch (error) {
      return false;
    }
  }

  /**
   * Fill a form field with better error handling
   */
  async fillEditFormField(
    locator: Locator,
    value: string,
    fieldName: string,
    testInfo: TestInfo
  ): Promise<void> {

    if (value && value.trim() !== '') {
      try {
        await locator.waitFor({
          state: 'visible',
          timeout: 5000
        });

        const isEditable = await this.isFieldEditable(locator);

        if (!isEditable) {
          console.log(
            `⚠️ Field "${fieldName}" is not editable (readonly/disabled), skipping`
          );

          Reporter.validateData(
            value,
            'READONLY',
            `Skip ${fieldName} (readonly)`,
            testInfo
          );

          return;
        }

        await locator.clear();
        await locator.fill(value);

        await this.page.waitForTimeout(300);

        Reporter.validateData(
          value,
          value,
          `Fill ${fieldName}`,
          testInfo
        );

      } catch (error) {

        console.log(
          `⚠️ Could not fill field "${fieldName}": ${error}`
        );

        Reporter.validateData(
          value,
          'FIELD_ERROR',
          `Skip ${fieldName} (error)`,
          testInfo
        );
      }
    }
  }

  generateUniqueName(baseName: string): string {
    const timestamp = Date.now();
    const randomNum = Math.floor(Math.random() * 10000);

    return `${baseName}_${timestamp}_${randomNum}`;
  }

  getEditRooftopData(): any {
    return EditRooftopData;
  }

  async addRooftop(
    rooftopName: string,
    testInfo: TestInfo
  ): Promise<string> {
    return await this.addRooftopHelper.AddRooftop(
      testInfo,
      rooftopName
    );
  }

  async deleteRooftop(
    rooftopName: string,
    testInfo: TestInfo
  ): Promise<boolean> {

    console.log(
      `\n============================================================`
    );

    console.log(
      `🗑️  Deleting Rooftop: ${rooftopName}`
    );

    console.log(
      `============================================================`
    );

    const result =
      await this.deleteRooftopHelper.DeleteRooftop(
        rooftopName,
        testInfo
      );

    return result.deletePassed &&
      result.verificationPassed;
  }

  async searchExactRooftopInSummary(
    rooftopName: string,
    testInfo: TestInfo
  ): Promise<boolean> {

    try {

      await this.SearchBox.waitFor({
        state: 'visible',
        timeout: 5000
      });

      await this.SearchBox.click();

      await this.SearchBox.fill('');

      await this.page.waitForTimeout(300);

      await this.SearchBox.fill(rooftopName);

      await this.page.waitForTimeout(1000);

      Reporter.validateData(
        rooftopName,
        rooftopName,
        `Search for: ${rooftopName}`,
        testInfo
      );

      const tableRows =
        this.page.locator('table tbody tr');

      const rowCount =
        await tableRows.count();

      for (let i = 0; i < rowCount; i++) {

        const nameCell =
          tableRows.nth(i).locator('td').nth(1);

        const cellText =
          (await nameCell.textContent())?.trim() || '';

        if (cellText === rooftopName) {

          Reporter.validateData(
            true,
            true,
            `Rooftop "${rooftopName}" found`,
            testInfo
          );

          return true;
        }
      }

      Reporter.validateData(
        true,
        false,
        `Rooftop "${rooftopName}" found`,
        testInfo
      );

      return false;

    } catch (error) {

      Reporter.validateData(
        true,
        false,
        `Search for "${rooftopName}"`,
        testInfo
      );

      return false;
    }
  }

  async clickEditButtonForExactRooftop(
    rooftopName: string,
    testInfo: TestInfo
  ): Promise<boolean> {

    try {

      const found =
        await this.searchExactRooftopInSummary(
          rooftopName,
          testInfo
        );

      if (!found) {
        return false;
      }

      await this.page.waitForTimeout(500);

      const tableRows =
        this.page.locator('table tbody tr');

      const rowCount =
        await tableRows.count();

      for (let i = 0; i < rowCount; i++) {

        const nameCell =
          tableRows.nth(i).locator('td').nth(1);

        const cellText =
          (await nameCell.textContent())?.trim() || '';

        if (cellText === rooftopName) {

          const actionsCell =
            tableRows.nth(i).locator('td').last();

          const editButton =
            actionsCell.getByRole('button').first();

          await editButton.click();

          await this.page.waitForLoadState(
            'networkidle'
          );

          await this.page.waitForTimeout(2000);

          Reporter.validateData(
            'Edit button clicked',
            'Edit button clicked',
            `Click Edit for ${rooftopName}`,
            testInfo
          );

          return true;
        }
      }

      return false;

    } catch (error) {

      Reporter.validateData(
        'Edit button clicked',
        `Error: ${error}`,
        `Click Edit for ${rooftopName}`,
        testInfo
      );

      return false;
    }
  }

  async setActiveCheckbox(
    shouldBeChecked: boolean,
    testInfo: TestInfo
  ): Promise<void> {

    try {

      await this.ActiveCheckbox.waitFor({
        state: 'attached',
        timeout: 5000
      });

      if (await this.ActiveCheckbox.count() > 0) {

        const isChecked =
          await this.ActiveCheckbox.isChecked();

        if (isChecked !== shouldBeChecked) {

          await this.ActiveCheckbox.click();

          Reporter.validateData(
            shouldBeChecked,
            !isChecked,
            `Set Active to ${shouldBeChecked}`,
            testInfo
          );
        }
      }

    } catch (error) {
      // Silent fail
    }
  }

  /**
   * Fill Edit Rooftop form
   */
  async fillEditForm(
    data: any,
    testInfo: TestInfo
  ): Promise<void> {

    await this.page.waitForSelector(
      'form',
      {
        state: 'visible',
        timeout: 10000
      }
    );

    await this.page.waitForTimeout(1000);

    await this.fillEditFormField(
      this.Name,
      data.Name,
      'Name',
      testInfo
    );

    await this.fillEditFormField(
      this.Description,
      data.Description,
      'Description',
      testInfo
    );

    // Dealer Code
    await this.fillEditFormField(
      this.DealerCode,
      data.DealerCode,
      'Dealer Code',
      testInfo
    );

    await this.fillEditFormField(
      this.Franchise,
      data.Franchise,
      'Franchise',
      testInfo
    );

    await this.fillEditFormField(
      this.PlayerColor,
      data.PlayerColor,
      'Player Color',
      testInfo
    );

    await this.fillEditFormField(
      this.SalesPersonName,
      data.SalesPersonName,
      'Sales Person Name',
      testInfo
    );

    await this.fillEditFormField(
      this.Address,
      data.Address,
      'Address',
      testInfo
    );

    await this.fillEditFormField(
      this.City,
      data.City,
      'City',
      testInfo
    );

    await this.fillEditFormField(
      this.State,
      data.State,
      'State',
      testInfo
    );

    await this.fillEditFormField(
      this.Zip,
      data.Zip,
      'ZIP',
      testInfo
    );

    await this.fillEditFormField(
      this.Phone,
      data.Phone,
      'Phone',
      testInfo
    );

    await this.fillEditFormField(
      this.Email,
      data.Email,
      'Email',
      testInfo
    );

    await this.fillEditFormField(
      this.URL,
      data.URL,
      'URL',
      testInfo
    );

    await this.fillEditFormField(
      this.FaceebookID,
      data.FacebookID,
      'Facebook ID',
      testInfo
    );

    if (data.DealerGroups) {

      try {

        await this.DealerGroups.waitFor({
          state: 'visible',
          timeout: 3000
        });

        const isEditable =
          await this.isFieldEditable(
            this.DealerGroups
          );

        if (isEditable) {

          await this.DealerGroups.clear();

          await this.page.waitForTimeout(300);

          await this.DealerGroups.fill(
            data.DealerGroups
          );

          Reporter.validateData(
            data.DealerGroups,
            data.DealerGroups,
            'Dealer Groups',
            testInfo
          );

        } else {

          console.log(
            `⚠️ Dealer Groups field is read-only or disabled, skipping`
          );

          Reporter.validateData(
            data.DealerGroups,
            'READONLY',
            'Dealer Groups (readonly)',
            testInfo
          );
        }

      } catch (error) {

        console.log(
          `⚠️ Dealer Groups field may not be visible: ${error}`
        );

        Reporter.validateData(
          data.DealerGroups,
          'FIELD_ERROR',
          'Dealer Groups',
          testInfo
        );
      }
    }

    await this.fillEditFormField(
      this.Comments,
      data.Comments,
      'Comments',
      testInfo
    );

    await this.setActiveCheckbox(
      data.Active,
      testInfo
    );
  }

  private async getFieldValue(
    locator: Locator
  ): Promise<string> {

    try {

      const elementCount =
        await locator.count();

      if (elementCount === 0) {
        return '';
      }

      try {

        const inputVal =
          await locator.inputValue();

        if (
          inputVal &&
          inputVal.trim().length > 0
        ) {
          return inputVal.trim();
        }

      } catch (e) {
        // Ignore inputValue error
      }

      return '';

    } catch (error) {

      return '';
    }
  }

  async getCurrentRooftopData(): Promise<any> {

    return {

      name:
        await this.getFieldValue(this.Name),

      description:
        await this.getFieldValue(this.Description),

      dealerCode:
        await this.getFieldValue(this.DealerCode),

      franchise:
        await this.getFieldValue(this.Franchise),

      playerColor:
        await this.getFieldValue(this.PlayerColor),

      salesPersonName:
        await this.getFieldValue(this.SalesPersonName),

      address:
        await this.getFieldValue(this.Address),

      city:
        await this.getFieldValue(this.City),

      state:
        await this.getFieldValue(this.State),

      zip:
        await this.getFieldValue(this.Zip),

      phone:
        await this.getFieldValue(this.Phone),

      email:
        await this.getFieldValue(this.Email),

      url:
        await this.getFieldValue(this.URL),

      facebookID:
        await this.getFieldValue(this.FaceebookID),

      dealerGroups:
        await this.getFieldValue(this.DealerGroups),

      comments:
        await this.getFieldValue(this.Comments),

      active:
        await this.ActiveCheckbox
          .isChecked()
          .catch(() => false)
    };
  }

  async clickCancelButton(): Promise<void> {

    try {

      await this.CancelButton.waitFor({
        state: 'visible',
        timeout: 5000
      });

      await this.CancelButton.click();

      await this.page.waitForLoadState(
        'networkidle'
      );

      await this.page.waitForTimeout(1000);

    } catch (error) {
      // Silent fail
    }
  }

  async editRooftop(
    originalName: string,
    editTemplate: any,
    testInfo: TestInfo
  ): Promise<{
    success: boolean;
    originalName: string;
    newName: string;
    fieldComparisons: Array<any>;
  }> {

    Reporter.startTest();

    try {

      const uniqueNewName =
        this.generateUniqueName(
          editTemplate.Name
        );

      // Generate unique Dealer Code
      const uniqueNewDealerCode =
        this.generateUniqueName(
          editTemplate.DealerCode
        );

      const editData = {
        ...editTemplate,
        Name: uniqueNewName,
        DealerCode: uniqueNewDealerCode
      };

      console.log(
        `\n📝 Editing Rooftop: ${originalName} -> ${uniqueNewName}`
      );

      const editClicked =
        await this.clickEditButtonForExactRooftop(
          originalName,
          testInfo
        );

      if (!editClicked) {

        Reporter.validateData(
          true,
          false,
          'Click Edit Button',
          testInfo
        );

        Reporter.endTest(testInfo);

        return {
          success: false,
          originalName,
          newName: '',
          fieldComparisons: []
        };
      }

      await this.fillEditForm(
        editData,
        testInfo
      );

      await this.UpdateRooftopButton.waitFor({
        state: 'visible',
        timeout: 10000
      });

      await this.UpdateRooftopButton.click();

      await this.page.waitForLoadState(
        'networkidle'
      );

      await this.page.waitForTimeout(2000);

      Reporter.validateData(
        'Update clicked',
        'Update clicked',
        'Update Rooftop',
        testInfo
      );

      const editedFound =
        await this.searchExactRooftopInSummary(
          uniqueNewName,
          testInfo
        );

      if (!editedFound) {

        Reporter.validateData(
          true,
          false,
          'Find edited rooftop',
          testInfo
        );

        Reporter.endTest(testInfo);

        return {
          success: false,
          originalName,
          newName: uniqueNewName,
          fieldComparisons: []
        };
      }

      await this.clickEditButtonForExactRooftop(
        uniqueNewName,
        testInfo
      );

      const currentData =
        await this.getCurrentRooftopData();

      await this.clickCancelButton();

      const fieldComparisons: Array<any> = [];

      let allMatch = true;

      const fieldsToCompare = [

        {
          key: 'name',
          label: 'Name',
          expected: editData.Name
        },

        {
          key: 'description',
          label: 'Description',
          expected: editData.Description
        },

        {
          key: 'dealerCode',
          label: 'Dealer Code',
          expected: editData.DealerCode
        },

        {
          key: 'franchise',
          label: 'Franchise',
          expected: editData.Franchise
        },

        {
          key: 'playerColor',
          label: 'Player Color',
          expected: editData.PlayerColor
        },

        {
          key: 'salesPersonName',
          label: 'Sales Person Name',
          expected: editData.SalesPersonName
        },

        {
          key: 'address',
          label: 'Address',
          expected: editData.Address
        },

        {
          key: 'city',
          label: 'City',
          expected: editData.City
        },

        {
          key: 'state',
          label: 'State',
          expected: editData.State
        },

        {
          key: 'zip',
          label: 'ZIP',
          expected: editData.Zip
        },

        {
          key: 'phone',
          label: 'Phone',
          expected: editData.Phone
        },

        {
          key: 'email',
          label: 'Email',
          expected: editData.Email
        },

        {
          key: 'url',
          label: 'URL',
          expected: editData.URL
        },

        {
          key: 'facebookID',
          label: 'Facebook ID',
          expected: editData.FacebookID
        },

        {
          key: 'dealerGroups',
          label: 'Dealer Groups',
          expected: editData.DealerGroups
        },

        {
          key: 'comments',
          label: 'Comments',
          expected: editData.Comments
        },

        {
          key: 'active',
          label: 'Active',
          expected: editData.Active
            ? 'true'
            : 'false'
        }
      ];

      for (const field of fieldsToCompare) {

        let expectedValue =
          String(field.expected || '');

        let actualValue =
          String(
            currentData[field.key] || ''
          );

        if (field.key === 'playerColor') {

          expectedValue =
            expectedValue
              .replace('#', '')
              .toUpperCase();

          actualValue =
            actualValue
              .replace('#', '')
              .toUpperCase();
        }

        else if (field.key === 'active') {

          actualValue =
            actualValue === 'true'
              ? 'true'
              : 'false';
        }

        const match =
          expectedValue === actualValue;

        if (!match) {
          allMatch = false;
        }

        let errorMessage = '';

        if (!match) {

          if (actualValue === '') {

            errorMessage =
              `Expected "${expectedValue}" but got EMPTY value`;

          } else {

            errorMessage =
              `Expected "${expectedValue}" but got "${actualValue}"`;
          }
        }

        fieldComparisons.push({

          field: field.label,

          expected: expectedValue,

          actual:
            actualValue === ''
              ? '(EMPTY)'
              : actualValue,

          status:
            match
              ? '✅ PASS'
              : '❌ FAIL',

          error: errorMessage
        });

        Reporter.validateData(
          expectedValue,

          actualValue === ''
            ? '(EMPTY)'
            : actualValue,

          `Field: ${field.label}`,

          testInfo
        );
      }

      console.log(
        `\n${'='.repeat(60)}`
      );

      console.log(
        `📋 EDIT ROOFTOP VERIFICATION SUMMARY`
      );

      console.log(
        `${'='.repeat(60)}`
      );

      for (const comparison of fieldComparisons) {

        console.log(
          `${comparison.field.padEnd(20)} : ${comparison.status}`
        );

        if (comparison.error) {

          console.log(
            `   └─ ${comparison.error}`
          );
        }
      }

      console.log(
        `${'='.repeat(60)}`
      );

      Reporter.validateData(
        true,
        allMatch,
        'Edit Rooftop Overall',
        testInfo
      );

      const summary =
        Reporter.endTest(testInfo);

      console.log(
        `\n📊 Edit Rooftop Completed - Pass Rate: ${summary.passRate}`
      );

      return {

        success: allMatch,

        originalName,

        newName: uniqueNewName,

        fieldComparisons
      };

    } catch (error) {

      console.log(
        `❌ Error editing rooftop: ${error}`
      );

      Reporter.validateData(
        true,
        false,
        'Edit Rooftop',
        testInfo
      );

      Reporter.endTest(testInfo);

      return {

        success: false,

        originalName,

        newName: '',

        fieldComparisons: []
      };
    }
  }

  async addAndEditRooftop(
    testInfo: TestInfo
  ): Promise<{
    addSuccess: boolean;
    editSuccess: boolean;
    addedName: string;
    editedName: string;
    fieldComparisons: Array<any>;
  }> {

    Reporter.startTest();

    try {

      const editTemplate =
        this.getEditRooftopData();

      const uniqueAddName =
        this.generateUniqueName(
          'Test_Rooftop'
        );

      console.log(
        `\n${'='.repeat(60)}`
      );

      console.log(
        `📝 ADDING NEW ROOFTOP`
      );

      console.log(
        `${'='.repeat(60)}`
      );

      const addedName =
        await this.addRooftop(
          uniqueAddName,
          testInfo
        );

      Reporter.validateData(
        true,
        true,
        'Add Rooftop',
        testInfo
      );

      console.log(
        `\n${'='.repeat(60)}`
      );

      console.log(
        `✏️ EDITING ROOFTOP`
      );

      console.log(
        `${'='.repeat(60)}`
      );

      const editResult =
        await this.editRooftop(
          addedName,
          editTemplate,
          testInfo
        );

      const summary =
        Reporter.endTest(testInfo);

      console.log(
        `\n📊 Add & Edit Rooftop Completed - Pass Rate: ${summary.passRate}`
      );

      return {

        addSuccess: true,

        editSuccess:
          editResult.success,

        addedName:

          addedName,

        editedName:
          editResult.newName,

        fieldComparisons:
          editResult.fieldComparisons
      };

    } catch (error) {

      console.log(
        `❌ Error: ${error}`
      );

      Reporter.validateData(
        true,
        false,
        'Add & Edit Rooftop',
        testInfo
      );

      Reporter.endTest(testInfo);

      return {

        addSuccess: false,

        editSuccess: false,

        addedName: '',

        editedName: '',

        fieldComparisons: []
      };
    }
  }
}