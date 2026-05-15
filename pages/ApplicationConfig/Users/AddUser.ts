import { expect, Locator, Page, TestInfo } from '@playwright/test';
import { BasePage } from '../../BasePage';
import { PaginationUtil } from '../../utils/pagination';
import { logAndValidate } from '../../utils/reportUtil';
import Adduserdata from '../../../testdata/AddUser.json' 
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

  // Store the expected username from the last addition
  private expectedUsername: string = '';

  constructor(page: Page) {
    super(page);
    this.saveUserButton = page.getByRole('button', { name: 'Save User' });
    this.cancelButton = page.getByRole('button', { name: 'Cancel' });
    this.addUserButton = page.locator('[class="lucide lucide-plus"]');
    this.username = page.getByPlaceholder('User Name');
    this.password = page.getByPlaceholder('Password');
    this.userType = page.locator('[id="react-aria3225870461-_r_fh_"]');
    this.reseller = page.locator('[id="admin-User-create-resellerId"]');
    this.email = page.getByPlaceholder('Email');
    this.activecheckbox = page.locator('svg.lucide-check');
  }

  async addUser() {
    await this.fillElement(this.username, Adduserdata.username);
    await this.fillElement(this.password, Adduserdata.password);
    await this.selectOption(this.userType, Adduserdata.usertype);
    await this.selectOption(this.reseller, Adduserdata.Reseller);
    await this.fillElement(this.email, Adduserdata.email);
    await this.clickOnElement(this.saveUserButton);
    await this.addUserButton.waitFor({ state: 'visible' });

    // Store the username we just added for later verification
    this.expectedUsername = Adduserdata.username;
  }

  /**
   * Verifies that the added user appears in the summary table.
   * Uses pagination utility to search across all pages.
   * @param testInfo - Playwright TestInfo object for logging
   * @returns true if found, false otherwise (soft assertion)
   */
  async verifyAddedUserIsDisplayed(testInfo: TestInfo): Promise<boolean> {
    const paginationUtil = new PaginationUtil(this.page);

    // Adjust selectors to match your actual summary table structure
    const rowSelector = 'table tbody tr';   // e.g., "table tbody tr"
    const usernameColumnIndex = 1;          // Username is the 2nd column (0-based)
    const nextButtonSelector = 'button:has-text("Next ›")';

    console.log(`🔍 Searching for user: "${this.expectedUsername}"`);

    const actualUsername = await paginationUtil.searchAcrossPages(
      rowSelector,
      usernameColumnIndex,
      this.expectedUsername,
      50,                    // max pages
      nextButtonSelector
    );

    // Log and validate using the helper
    logAndValidate(
      {
        step: 'Verify added user appears in summary table',
        expected: this.expectedUsername,
        actual: actualUsername ?? '(not found)',
      },
      testInfo
    );
    // Return true if found, false otherwise
    return actualUsername !== null && actualUsername === this.expectedUsername;
  }

}