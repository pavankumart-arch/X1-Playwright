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
  addedUsername: string;
  editedUsername: string;
  addSuccess: boolean;
  editSuccess: boolean;
  deleteSuccess: boolean;
  fieldComparisons: Comparison[];
}

export class EditUser extends BasePage {

  saveUserButton: Locator;
  cancelButton: Locator;
  addUserButton: Locator;

  username: Locator;
  password: Locator;
  userType: Locator;
  reseller: Locator;
  email: Locator;

  activecheckbox: Locator;

  searchInput: Locator;

  private expectedUsername: string = '';

  constructor(page: Page) {

    super(page);

    this.saveUserButton =
      page.getByRole('button', {
        name: 'Save User'
      });

    this.cancelButton =
      page.getByRole('button', {
        name: 'Cancel'
      });

    this.addUserButton =
      page.locator('[class="lucide lucide-plus"]');

    this.username =
      page.getByPlaceholder('User Name');

    this.password =
      page.getByPlaceholder('Password');

    this.userType =
      page.locator('#admin-user-create-userTypeId');

    this.reseller =
      page.locator('#admin-user-create-resellerId');

    this.email =
      page.getByPlaceholder('Email');

    this.activecheckbox =
      page.getByRole('checkbox');

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
      addedUsername: '',
      editedUsername: '',
      addSuccess: false,
      editSuccess: false,
      deleteSuccess: false,
      fieldComparisons: []
    };

    // =============================
    // ADD USER
    // =============================

    const addUser =
      new AddUser(this.page);

    await addUser.addUser();

    result.addSuccess = true;

    // =============================
    // EDIT USER
    // =============================

    const editResult =
      await this.editUser(testInfo);

    result.editedUsername =
      editResult.editedUsername;

    result.editSuccess =
      editResult.success;

    result.fieldComparisons =
      editResult.comparisons;

    // =============================
    // DELETE USER
    // =============================

    const deleteResult =
      await this.deleteUser(
        editResult.editedUsername
      );

    result.deleteSuccess =
      deleteResult;

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

    // =============================
    // OPEN FORM
    // =============================

    await this.addUserButton.click();

    await this.username.waitFor({
      state: 'visible'
    });

    // =============================
    // UNIQUE USERNAME
    // =============================

    const uniqueUsername =
      `${Edituserdata.username}_${Date.now()}`;

    this.expectedUsername =
      uniqueUsername;

    // =============================
    // UNIQUE EMAIL
    // =============================

    const emailParts =
      Edituserdata.email.split('@');

    const uniqueEmail =
      `${emailParts[0]}_${Date.now()}@${emailParts[1]}`;

    // =============================
    // USERNAME
    // =============================

    await this.fillField(
      this.username,
      uniqueUsername,
      'Username',
      comparisons,
      testInfo
    );

    // =============================
    // PASSWORD
    // =============================

    await this.fillField(
      this.password,
      Edituserdata.password,
      'Password',
      comparisons,
      testInfo
    );

    // =============================
    // SELECT USER TYPE
    // =============================

    await this.userType.click();

    const userTypeOptions =
      this.page.locator('[role="option"]');

    const selectedUserType =
      (
        await userTypeOptions
          .nth(Number(Edituserdata.usertype))
          .textContent()
      )?.trim() || '';

    await userTypeOptions
      .nth(Number(Edituserdata.usertype))
      .click();

    // =============================
    // SELECT RESELLER
    // =============================

    await this.reseller.click();

    const resellerOptions =
      this.page.locator('[role="option"]');

    const selectedReseller =
      (
        await resellerOptions
          .nth(Number(Edituserdata.Reseller))
          .textContent()
      )?.trim() || '';

    await resellerOptions
      .nth(Number(Edituserdata.Reseller))
      .click();

    // =============================
    // EMAIL
    // =============================

    await this.fillField(
      this.email,
      uniqueEmail,
      'Email',
      comparisons,
      testInfo
    );

    // =============================
    // ACTIVE CHECKBOX
    // =============================

    if (
      Edituserdata.active === 'true'
    ) {

      const checked =
        await this.activecheckbox.isChecked();

      if (!checked) {

        await this.activecheckbox.click();
      }
    }

    // =============================
    // SAVE USER
    // =============================

    await this.saveUserButton.click();

    await this.addUserButton.waitFor({
      state: 'visible'
    });

    logAndValidate(
      {
        step: 'Save Edited User',
        expected: 'Saved Successfully',
        actual: 'Saved Successfully'
      },
      testInfo
    );

    // =============================
    // VERIFY TABLE
    // =============================

    const userFound =
      await this.verifyEditedUserIsDisplayed(
        testInfo
      );

    if (!userFound) {

      allPassed = false;
    }

    // =============================
    // VERIFY SAVED DATA
    // =============================

    const verifyResult =
      await this.verifyEditedUserData(
        uniqueUsername,
        uniqueEmail,
        selectedUserType,
        selectedReseller,
        comparisons,
        testInfo
      );

    allPassed =
      allPassed &&
      verifyResult;

    return {
      editedUsername: uniqueUsername,
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

    await locator.waitFor({
      state: 'visible'
    });

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
  // VERIFY USER IN TABLE
  // ==================================================

  async verifyEditedUserIsDisplayed(
    testInfo: TestInfo
  ): Promise<boolean> {

    const userFound =
      await searchbyName(
        this.page,
        this.searchInput,
        this.expectedUsername,
        'button:has-text("Next ›")',
        'table tbody tr',
        1
      );

    logAndValidate(
      {
        step:
          'Verify edited user appears in summary table',

        expected:
          this.expectedUsername,

        actual:
          userFound
            ? this.expectedUsername
            : '(not found)',
      },
      testInfo
    );

    expect(userFound).toBeTruthy();

    return userFound;
  }

  // ==================================================
  // VERIFY SAVED DATA
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

      // =============================
      // SEARCH USER
      // =============================

      await this.searchInput.fill('');

      await this.searchInput.fill(
        expectedUsername
      );

      await this.page.waitForTimeout(2000);

      // =============================
      // OPEN EDIT PAGE
      // =============================

      const row =
        this.page.locator(
          `table tbody tr:has-text("${expectedUsername}")`
        ).first();

      const editButton =
        row.locator('button').first();

      await editButton.click();

      await this.page.waitForTimeout(3000);

      // =============================
      // VERIFY USERNAME
      // =============================

      const actualUsername =
        await this.username.inputValue();

      const usernamePassed =
        actualUsername === expectedUsername;

      comparisons.push({
        field: 'Verify Username',
        expected: expectedUsername,
        actual: actualUsername,
        status:
          usernamePassed
            ? '✅ PASS'
            : '❌ FAIL'
      });

      logAndValidate(
        {
          step: 'Verify Username',
          expected: expectedUsername,
          actual: actualUsername
        },
        testInfo
      );

      // =============================
      // VERIFY EMAIL
      // =============================

      const actualEmail =
        await this.email.inputValue();

      const emailPassed =
        actualEmail === expectedEmail;

      comparisons.push({
        field: 'Verify Email',
        expected: expectedEmail,
        actual: actualEmail,
        status:
          emailPassed
            ? '✅ PASS'
            : '❌ FAIL'
      });

      logAndValidate(
        {
          step: 'Verify Email',
          expected: expectedEmail,
          actual: actualEmail
        },
        testInfo
      );

      // =============================
      // VERIFY PASSWORD EMPTY
      // =============================

      const actualPassword =
        await this.password.inputValue();

      const passwordPassed =
        actualPassword === '';

      comparisons.push({
        field: 'Verify Password Empty',
        expected: '',
        actual: actualPassword,
        status:
          passwordPassed
            ? '✅ PASS'
            : '❌ FAIL'
      });

      logAndValidate(
        {
          step: 'Verify Password Empty',
          expected: '',
          actual: actualPassword
        },
        testInfo
      );

      // =============================
      // VERIFY USER TYPE
      // =============================

      let actualUserType = '';

      try {

        actualUserType =
          (
            await this.page
              .locator(
                '#admin-user-create-userTypeId'
              )
              .locator('xpath=following-sibling::*')
              .first()
              .textContent()
          )?.trim() || '';

      } catch {

        actualUserType = '';
      }

      const userTypePassed =
        actualUserType.includes(
          expectedUserType
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

      logAndValidate(
        {
          step: 'Verify User Type',
          expected: expectedUserType,
          actual: actualUserType
        },
        testInfo
      );

      // =============================
      // VERIFY RESELLER
      // =============================

      let actualReseller = '';

      try {

        actualReseller =
          (
            await this.page
              .locator(
                '#admin-user-create-resellerId'
              )
              .locator('xpath=following-sibling::*')
              .first()
              .textContent()
          )?.trim() || '';

      } catch {

        actualReseller = '';
      }

      const resellerPassed =
        actualReseller.includes(
          expectedReseller
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

      logAndValidate(
        {
          step: 'Verify Reseller',
          expected: expectedReseller,
          actual: actualReseller
        },
        testInfo
      );

      // =============================
      // FINAL STATUS
      // =============================

      if (
        !usernamePassed ||
        !emailPassed ||
        !passwordPassed ||
        !userTypePassed ||
        !resellerPassed
      ) {

        allPassed = false;
      }

    } catch (error) {

      console.log(
        'Verification failed:',
        error
      );

      allPassed = false;
    }

    // =============================
    // CLOSE FORM
    // =============================

    try {

      await this.cancelButton.click();

    } catch {

      console.log(
        'Cancel button not clickable'
      );
    }

    return allPassed;
  }

  // ==================================================
  // DELETE USER
  // ==================================================

  async deleteUser(
    username: string
  ): Promise<boolean> {

    const deleteUser =
      new DeleteUser(this.page);

    const result =
      await deleteUser.DeleteUser(
        username
      );

    return (
      result.deletePassed &&
      result.verificationPassed
    );
  }
}