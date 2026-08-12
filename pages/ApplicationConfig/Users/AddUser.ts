import { Locator, Page, TestInfo, expect } from '@playwright/test';
import { BasePage } from '../../BasePage';
import Adduserdata from '../../../testdata/AddUser.json';
import { searchbyName } from '../../utils/Searchnew';
import { Reporter } from '../../utils/NewReport';

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

  // Store created user details
  public expectedUsername: string = '';
  public expectedEmail: string = '';

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

    this.searchInput =
      page.getByPlaceholder('Search');
  }

  async addUser(): Promise<void> {

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

    // Store Email
    this.expectedEmail = uniqueEmail;

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

    // Save User
    await this.clickOnElement(
      this.saveUserButton
    );

    // Wait until Save Completes
    await this.addUserButton.waitFor({
      state: 'visible'
    });

    console.log(
      `✅ User Created Successfully: ${this.expectedUsername}`
    );

    console.log(
      `✅ Email Created Successfully: ${this.expectedEmail}`
    );
  }

  async verifyAddedUserIsDisplayed(
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

    const actualUser =
      userFound
        ? this.expectedUsername
        : 'User Not Found';

    Reporter.validateData(
      this.expectedUsername,
      actualUser,
      'Verify Created User',
      testInfo
    );

    expect(
      userFound,
      `User "${this.expectedUsername}" was not found in the table`
    ).toBeTruthy();

    return userFound;
  }
}