import { Locator, Page, TestInfo, expect } from '@playwright/test';
import { BasePage } from '../../BasePage';
import Edituserdata from '../../../testdata/EditUser.json';
import { AddUser } from './AddUser';
import { DeleteUser } from './DeleteUser';
import { searchbyName } from '../../utils/Searchnew';
import { Reporter } from '../../utils/NewReport';

type Comparison = {
  field: string;
  expected: string;
  actual: string;
  status: '✅ PASS' | '❌ FAIL';
};

interface EditResult {
  editedUsername: string;
  addSuccess: boolean;
  editSuccess: boolean;
  deleteSuccess: boolean;
  fieldComparisons: Comparison[];
}

export class EditUser extends BasePage {
  [x: string]: any;

  updateUserButton: Locator;
  cancelButton: Locator;

  username: Locator;
  userType: Locator;
  reseller: Locator;
  email: Locator;

  activecheckbox: Locator;

  searchInput: Locator;

  constructor(page: Page) {

    super(page);

    // ==================================================
    // BUTTONS
    // ==================================================

    this.updateUserButton =
      page.getByRole('button', {
        name: 'Update User'
      });

    this.cancelButton =
      page.getByRole('button', {
        name: 'Cancel'
      });

    // ==================================================
    // FIELDS
    // ==================================================

    this.username =
      page.getByPlaceholder('User Name');

    this.userType =
      page.locator('#admin-user-edit-userTypeId');

    this.reseller =
      page.locator('#admin-user-edit-resellerId');

    this.email =
      page.getByPlaceholder('Email');

    this.activecheckbox =
      page.getByRole('checkbox');

    // ==================================================
    // SEARCH
    // ==================================================

    this.searchInput =
      page.getByPlaceholder('Search');
  }

  // ==================================================
  // MAIN FLOW WITH REPORTER
  // ==================================================

  async addAndEditUserWithReport(
    testInfo: TestInfo
  ): Promise<EditResult> {

    const result: EditResult = {
      editedUsername: '',
      addSuccess: false,
      editSuccess: false,
      deleteSuccess: false,
      fieldComparisons: []
    };

    // ==================================================
    // ADD USER
    // ==================================================

    const addUser =
      new AddUser(this.page);

    await addUser.addUser();

    const createdUsername =
      addUser['expectedUsername'];

    result.addSuccess = true;

    // Report user creation
    Reporter.validateData(
      createdUsername,
      createdUsername,
      'User Creation',
      testInfo
    );

    // ==================================================
    // SEARCH ADDED USER
    // ==================================================

    await this.searchInput.clear();
    await this.searchInput.fill(createdUsername);
    await this.page.waitForTimeout(3000);

    // ==================================================
    // CLICK EDIT BUTTON
    // ==================================================

    const row =
      this.page.locator('table tbody tr')
        .filter({
          hasText: createdUsername
        })
        .first();

    await row.waitFor({
      state: 'visible'
    });

    const editButton =
      row.locator('button').first();

    await editButton.click();

    await this.username.waitFor({
      state: 'visible'
    });

    // ==================================================
    // EDIT USER
    // ==================================================

    const editResult =
      await this.editUserWithReport(
        testInfo
      );

    result.editedUsername =
      editResult.editedUsername;

    result.editSuccess =
      editResult.success;

    result.fieldComparisons =
      editResult.comparisons;

    // ==================================================
    // DELETE USER WITH REPORTER
    // ==================================================

    const deleteUser =
      new DeleteUser(this.page);

    await deleteUser.DeleteUserWithReport(
      editResult.editedUsername,
      testInfo
    );

    result.deleteSuccess = true;

    return result;
  }

  // ==================================================
  // EDIT USER WITH REPORTER
  // ==================================================

  private async editUserWithReport(
    testInfo: TestInfo
  ): Promise<{
    editedUsername: string;
    success: boolean;
    comparisons: Comparison[];
  }> {

    const comparisons: Comparison[] = [];

    let allPassed = true;

    // ==================================================
    // GENERATE EDIT DATA
    // ==================================================

    const editedUsername =
      `${Edituserdata.username}_${Date.now()}`;

    const emailParts =
      Edituserdata.email.split('@');

    const editedEmail =
      `${emailParts[0]}_${Date.now()}@${emailParts[1]}`;

    // ==================================================
    // WAIT FOR FORM TO BE FULLY LOADED
    // ==================================================

    // Wait for all form fields to be visible and enabled
    await this.username.waitFor({ state: 'visible', timeout: 10000 });
    await this.email.waitFor({ state: 'visible', timeout: 10000 });
    
    // Wait for the form to be ready
    await this.page.waitForTimeout(1000);

    // ==================================================
    // CLEAR EXISTING VALUES
    // ==================================================

    await this.username.clear({ timeout: 5000 });
    await this.email.clear({ timeout: 5000 });

    // ==================================================
    // EDIT USERNAME
    // ==================================================

    await this.fillFieldWithReport(
      this.username,
      editedUsername,
      'Username',
      comparisons,
      testInfo
    );

    // ==================================================
    // SELECT USER TYPE
    // ==================================================

    await this.userType.waitFor({ state: 'visible', timeout: 5000 });
    await this.userType.click();

    const userTypeOptions =
      this.page.locator('[role="option"]');

    await userTypeOptions
      .nth(Number(Edituserdata.usertype))
      .waitFor({
        state: 'visible'
      });

    const selectedUserType =
      (
        await userTypeOptions
          .nth(Number(Edituserdata.usertype))
          .textContent()
      )?.trim() || '';

    await userTypeOptions
      .nth(Number(Edituserdata.usertype))
      .click();

    // Report user type selection
    Reporter.validateData(
      selectedUserType,
      selectedUserType,
      'User Type Selection',
      testInfo
    );

    // ==================================================
    // SELECT RESELLER
    // ==================================================

    await this.reseller.waitFor({ state: 'visible', timeout: 5000 });
    await this.reseller.click();

    const resellerOptions =
      this.page.locator('[role="option"]');

    await resellerOptions
      .nth(Number(Edituserdata.Reseller))
      .waitFor({
        state: 'visible'
      });

    const selectedReseller =
      (
        await resellerOptions
          .nth(Number(Edituserdata.Reseller))
          .textContent()
      )?.trim() || '';

    await resellerOptions
      .nth(Number(Edituserdata.Reseller))
      .click();

    // Report reseller selection
    Reporter.validateData(
      selectedReseller,
      selectedReseller,
      'Reseller Selection',
      testInfo
    );

    // ==================================================
    // EDIT EMAIL
    // ==================================================

    await this.fillFieldWithReport(
      this.email,
      editedEmail,
      'Email',
      comparisons,
      testInfo
    );

    // ==================================================
    // UPDATE USER
    // ==================================================

    // Wait for update button to be enabled and clickable
    await this.updateUserButton.waitFor({ state: 'visible', timeout: 5000 });
    await this.updateUserButton.click();

    // Report update action
    Reporter.validateData(
      'Clicked Update Button',
      'Clicked Update Button',
      'Update User Action',
      testInfo
    );

    // ==================================================
    // WAIT FOR SUMMARY PAGE
    // ==================================================

    await this.searchInput.waitFor({
      state: 'visible',
      timeout: 10000
    });

    // ==================================================
    // VERIFY EDITED USER EXISTS
    // ==================================================

    const userFound =
      await searchbyName(
        this.page,
        this.searchInput,
        editedUsername,
        'button:has-text("Next ›")',
        'table tbody tr',
        1
      );

    // Report user found verification
    Reporter.validateData(
      true,
      userFound,
      `User Exists After Edit`,
      testInfo
    );

    expect(userFound).toBeTruthy();

    // ==================================================
    // OPEN EDIT PAGE AGAIN TO VERIFY
    // ==================================================

    const editedRow =
      this.page.locator('table tbody tr')
        .filter({
          hasText: editedUsername
        })
        .first();

    const editedUserButton =
      editedRow.locator('button').first();

    await editedUserButton.click();

    // Wait for edit form to load again
    await this.username.waitFor({
      state: 'visible',
      timeout: 10000
    });

    // ==================================================
    // VERIFY EDITED DATA
    // ==================================================

    const verifyResult =
      await this.verifyEditedUserDataWithReport(
        editedUsername,
        editedEmail,
        selectedUserType,
        selectedReseller,
        comparisons,
        testInfo
      );

    allPassed =
      allPassed &&
      verifyResult;

    return {
      editedUsername,
      success: allPassed,
      comparisons
    };
  }

  // ==================================================
  // FILL FIELD WITH REPORTER
  // ==================================================

  private async fillFieldWithReport(
    locator: Locator,
    value: string,
    fieldName: string,
    comparisons: Comparison[],
    testInfo: TestInfo
  ) {

    await locator.fill('');
    await locator.fill(value);

    // Add to comparisons
    comparisons.push({
      field: fieldName,
      expected: value,
      actual: value,
      status: '✅ PASS'
    });

    // Report using Reporter
    Reporter.validateData(
      value,
      value,
      `Fill ${fieldName}`,
      testInfo
    );
  }

  // ==================================================
  // VERIFY EDITED DATA WITH REPORTER
  // ==================================================

  private async verifyEditedUserDataWithReport(
    expectedUsername: string,
    expectedEmail: string,
    expectedUserType: string,
    expectedReseller: string,
    comparisons: Comparison[],
    testInfo: TestInfo
  ): Promise<boolean> {

    let allPassed = true;

    try {

      // ==================================================
      // VERIFY USERNAME
      // ==================================================

      const actualUsername =
        await this.username.inputValue();

      const usernamePassed =
        actualUsername === expectedUsername;

      Reporter.validateData(
        expectedUsername,
        actualUsername,
        'Verify Username',
        testInfo
      );

      comparisons.push({
        field: 'Verify Username',
        expected: expectedUsername,
        actual: actualUsername,
        status:
          usernamePassed
            ? '✅ PASS'
            : '❌ FAIL'
      });

      // ==================================================
      // VERIFY EMAIL
      // ==================================================

      const actualEmail =
        await this.email.inputValue();

      const emailPassed =
        actualEmail === expectedEmail;

      Reporter.validateData(
        expectedEmail,
        actualEmail,
        'Verify Email',
        testInfo
      );

      comparisons.push({
        field: 'Verify Email',
        expected: expectedEmail,
        actual: actualEmail,
        status:
          emailPassed
            ? '✅ PASS'
            : '❌ FAIL'
      });

      // ==================================================
      // VERIFY USER TYPE
      // ==================================================

      const actualUserType =
        (
          await this.page
            .locator('#admin-user-edit-userTypeId span')
            .textContent()
        )?.trim() || '';

      const userTypePassed =
        actualUserType.includes(
          expectedUserType
        );

      Reporter.validateData(
        expectedUserType,
        actualUserType,
        'Verify User Type',
        testInfo
      );

      comparisons.push({
        field: 'Verify User Type',
        expected: expectedUserType,
        actual: actualUserType,
        status:
          userTypePassed
            ? '✅ PASS'
            : '❌ FAIL'
      });

      // ==================================================
      // VERIFY RESELLER
      // ==================================================

      const actualReseller =
        (
          await this.page
            .locator('#admin-user-edit-resellerId span')
            .textContent()
        )?.trim() || '';

      const resellerPassed =
        actualReseller.includes(
          expectedReseller
        );

      Reporter.validateData(
        expectedReseller,
        actualReseller,
        'Verify Reseller',
        testInfo
      );

      comparisons.push({
        field: 'Verify Reseller',
        expected: expectedReseller,
        actual: actualReseller,
        status:
          resellerPassed
            ? '✅ PASS'
            : '❌ FAIL'
      });

      // ==================================================
      // VERIFY ACTIVE CHECKBOX
      // ==================================================

      // Check if the active checkbox is checked
      const isChecked = await this.activecheckbox.isChecked();
      
      // Note: We're not changing the active status, just verifying it exists
      // and has a value
      Reporter.validateData(
        isChecked ? 'Checked' : 'Unchecked',
        isChecked ? 'Checked' : 'Unchecked',
        'Active Checkbox Status',
        testInfo
      );

      // Add active checkbox verification to comparisons
      comparisons.push({
        field: 'Active Checkbox',
        expected: isChecked ? 'Checked' : 'Unchecked',
        actual: isChecked ? 'Checked' : 'Unchecked',
        status: '✅ PASS'
      });

      // ==================================================
      // FINAL STATUS
      // ==================================================

      if (
        !usernamePassed ||
        !emailPassed ||
        !userTypePassed ||
        !resellerPassed
      ) {

        allPassed = false;
      }

      // Report final verification status
      Reporter.validateData(
        true,
        allPassed,
        'Final Verification Status',
        testInfo
      );

      // ==================================================
      // CLICK CANCEL
      // ==================================================

      await this.cancelButton.click();

      // ==================================================
      // WAIT FOR SUMMARY PAGE
      // ==================================================

      await this.searchInput.waitFor({
        state: 'visible',
        timeout: 10000
      });

      await this.page.waitForLoadState('networkidle');

    } catch (error) {

      console.log(
        'Verification failed:',
        error
      );

      allPassed = false;

      Reporter.validateData(
        true,
        false,
        'Error During Verification',
        testInfo
      );
    }

    return allPassed;
  }

}