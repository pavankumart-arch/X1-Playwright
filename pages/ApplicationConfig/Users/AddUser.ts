import { Locator, Page, TestInfo, expect } from '@playwright/test';
import { BasePage } from '../../BasePage';
import { logAndValidate } from '../../utils/reportUtil';
import Adduserdata from '../../../testdata/AddUser.json';
import { searchbyName } from '../../utils/Searchnew';


export class AddUser extends BasePage {

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

  // Store latest created username
  private expectedUsername: string = '';

  constructor(page: Page) {

    super(page);

    this.saveUserButton =
      page.getByRole('button', { name: 'Save User' });

    this.cancelButton =
      page.getByRole('button', { name: 'Cancel' });

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
      page.locator('svg.lucide-check');

    // Search Box

    this.searchInput =
      page.getByPlaceholder('Search');
  }

  async addUser() {

    // Open Add User Form

    await this.addUserButton.click();

    // Wait for Form

    await this.username.waitFor({
      state: 'visible'
    });

    // Generate Unique Username

    const uniqueUsername =
      `${Adduserdata.username}_${Date.now()}`;

    // Store Username

    this.expectedUsername = uniqueUsername;

    // Generate Unique Email

    const emailParts =
      Adduserdata.email.split('@');

    const uniqueEmail =
      `${emailParts[0]}_${Date.now()}@${emailParts[1]}`;

    // Fill Username

    await this.fillElement(
      this.username,
      uniqueUsername
    );

    // Fill Password

    await this.fillElement(
      this.password,
      Adduserdata.password
    );

    // Select User Type

    await this.userType.click();

    const userTypeOptions =
      this.page.locator('[role="option"]');

    await userTypeOptions
      .nth(Number(Adduserdata.usertype))
      .click();

    // Select Reseller

    await this.reseller.click();

    const resellerOptions =
      this.page.locator('[role="option"]');

    await resellerOptions
      .nth(Number(Adduserdata.Reseller))
      .click();

    // Fill Email

    await this.fillElement(
      this.email,
      uniqueEmail
    );

    // Click Save User

    await this.clickOnElement(
      this.saveUserButton
    );

    // Wait Until User Saved

    await this.addUserButton.waitFor({
      state: 'visible'
    });

    console.log(
      `✅ User Created Successfully: ${this.expectedUsername}`
    );
  }

  // Verify Added User in Table

  async verifyAddedUserIsDisplayed(
    testInfo: TestInfo
  ): Promise<boolean> {

    // Search User in Table

    const userFound =
      await searchbyName(
        this.page,
        this.searchInput,
        this.expectedUsername,
        'button:has-text("Next ›")',
        'table tbody tr',
        1
      );

    // Log Validation

    logAndValidate(
      {
        step:
          'Verify added user appears in summary table',

        expected: this.expectedUsername,

        actual:
          userFound
            ? this.expectedUsername
            : '(not found)',
      },
      testInfo
    );

    // Assertion

    expect(userFound).toBeTruthy();

    return userFound;
  }
}