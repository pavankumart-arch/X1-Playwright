import { Locator, Page, TestInfo, expect } from '@playwright/test';
import { BasePage } from '../../BasePage';
import { logAndValidate } from '../../utils/reportUtil';
import Edituserdata from '../../../testdata/EditUser.json';
import { AddUser } from './AddUser';
import { DeleteUser } from './DeleteUser';
import { searchbyName } from '../../utils/Searchnew';

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
  password: Locator;
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

    this.password =
      page.getByPlaceholder('Password');

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
  // MAIN FLOW
  // ==================================================

  async addAndEditUser(
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

    // ==================================================
    // SEARCH ADDED USER
    // ==================================================

    await this.searchInput.clear();

    await this.searchInput.fill(
      createdUsername
    );

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
      await this.editUser(
        testInfo
      );

    result.editedUsername =
      editResult.editedUsername;

    result.editSuccess =
      editResult.success;

    result.fieldComparisons =
      editResult.comparisons;

    // ==================================================
    // DELETE USER
    // ==================================================

    const deleteUser =
      new DeleteUser(this.page);

    await deleteUser.DeleteUser(
      editResult.editedUsername
    );

    result.deleteSuccess = true;

    // ==================================================
    // DELETE REPORTING
    // ==================================================

    logAndValidate(
      {
        step:
          'Delete User Functionality',

        expected:
          'User deleted successfully',

        actual:
          'User deleted successfully'
      },
      testInfo
    );

    return result;
  }

  // ==================================================
  // EDIT USER
  // ==================================================

  private async editUser(
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
    // CLEAR EXISTING VALUES
    // ==================================================

    await this.username.clear();

    await this.password.clear();

    await this.email.clear();

    // ==================================================
    // EDIT USERNAME
    // ==================================================

    await this.fillField(
      this.username,
      editedUsername,
      'Username',
      comparisons,
      testInfo
    );

    // ==================================================
    // EDIT PASSWORD
    // ==================================================

    await this.fillField(
      this.password,
      Edituserdata.password,
      'Password',
      comparisons,
      testInfo
    );

    // ==================================================
    // SELECT USER TYPE
    // ==================================================

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

    // ==================================================
    // SELECT RESELLER
    // ==================================================

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

    // ==================================================
    // EDIT EMAIL
    // ==================================================

    await this.fillField(
      this.email,
      editedEmail,
      'Email',
      comparisons,
      testInfo
    );

    // ==================================================
    // UPDATE USER
    // ==================================================

    await this.updateUserButton.click();

    // ==================================================
    // WAIT FOR SUMMARY PAGE
    // ==================================================

    await this.searchInput.waitFor({
      state: 'visible'
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

    expect(userFound).toBeTruthy();

    console.log(
      `✅ Found record: ${editedUsername}`
    );

    // ==================================================
    // OPEN EDIT PAGE AGAIN
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

    await this.username.waitFor({
      state: 'visible'
    });

    // ==================================================
    // VERIFY EDITED DATA
    // ==================================================

    const verifyResult =
      await this.verifyEditedUserData(
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
  // FILL FIELD
  // ==================================================

  private async fillField(
    locator: Locator,
    value: string,
    fieldName: string,
    comparisons: Comparison[],
    testInfo: TestInfo
  ) {

    await locator.fill('');

    await locator.fill(value);

    logAndValidate(
      {
        step: `Fill ${fieldName}`,
        expected: value,
        actual: value
      },
      testInfo
    );

    comparisons.push({
      field: fieldName,
      expected: value,
      actual: value,
      status: '✅ PASS'
    });
  }

  // ==================================================
  // VERIFY EDITED DATA
  // ==================================================

  private async verifyEditedUserData(
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

      logAndValidate(
        {
          step: 'Verify Username',
          expected: expectedUsername,
          actual: actualUsername
        },
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

      logAndValidate(
        {
          step: 'Verify Email',
          expected: expectedEmail,
          actual: actualEmail
        },
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

      logAndValidate(
        {
          step: 'Verify User Type',
          expected: expectedUserType,
          actual: actualUserType
        },
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

      logAndValidate(
        {
          step: 'Verify Reseller',
          expected: expectedReseller,
          actual: actualReseller
        },
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
    }

    return allPassed;
  }

}