import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from '../../BasePage';
import EditUserdata from '../../../testdata/EditUser.json';

export class UpdatedUser extends BasePage {
  searchInput: Locator;
  rows: Locator;

  username: Locator;
  password: Locator;
  userType: Locator;
  reseller: Locator;
  email: Locator;
  activeCheckbox: Locator;
  saveUserButton: Locator;
  cancelButton: Locator;

  constructor(page: Page) {
    super(page);

    this.searchInput = page.getByPlaceholder('Search...');
    this.rows = page.locator('table tbody tr');

    this.username = page.getByPlaceholder('User Name');
    this.password = page.getByPlaceholder('Password');
    this.userType = page.locator('[id="react-aria3225870461-_r_fh_"]');
    this.reseller = page.locator('[id="admin-User-create-resellerId"]');
    this.email = page.getByPlaceholder('Email');
    this.activeCheckbox = page.locator('svg.lucide-check');
    this.saveUserButton = page.getByRole('button', { name: 'Save User' });
    this.cancelButton = page.getByRole('button', { name: 'Cancel' });
  }

  async openEditUserView(username: string) {
    await this.searchInput.fill(username);
    await expect(this.rows.first()).toBeVisible();

    const matchedRow = this.rows.filter({
      has: this.page.locator('td:nth-child(2)', { hasText: username })
    });

    // Click Edit button (first button in Actions column)
    const editButton = matchedRow.locator('td:last-child button').first();
    await editButton.click();
    await this.page.waitForTimeout(1000);
  }

  async verifyUpdatedUserDetails(): Promise<void> {
    let allPassed = true;

    // Helper to safely convert any value to string
    const asString = (value: any): string => String(value ?? '');

    try {
      // --- Username ---
      const actualUsername = await this.username.inputValue();
      const expectedUsername = asString(EditUserdata.username);
      console.log(`Username – Expected: ${expectedUsername}, Actual: ${actualUsername}`);
      if (actualUsername !== expectedUsername) allPassed = false;
      expect.soft(actualUsername).toBe(expectedUsername);

      // --- Password (visibility only) ---
      await expect.soft(this.password).toBeVisible();

      // --- User Type (dropdown) ---
      let actualUserType = '';
      try {
        actualUserType = (await this.userType.locator('option:checked').textContent()) || '';
      } catch {
        actualUserType = (await this.userType.getAttribute('value')) || '';
      }
      const expectedUserType = asString(EditUserdata.usertype);
      console.log(`User Type – Expected: ${expectedUserType}, Actual: ${actualUserType}`);
      if (actualUserType !== expectedUserType) allPassed = false;
      expect.soft(actualUserType).toBe(expectedUserType);

      // --- Reseller (dropdown) ---
      let actualReseller = '';
      try {
        actualReseller = (await this.reseller.locator('option:checked').textContent()) || '';
      } catch {
        actualReseller = (await this.reseller.getAttribute('value')) || '';
      }
      const expectedReseller = asString(EditUserdata.Reseller);
      console.log(`Reseller – Expected: ${expectedReseller}, Actual: ${actualReseller}`);
      if (actualReseller !== expectedReseller) allPassed = false;
      expect.soft(actualReseller).toBe(expectedReseller);

      // --- Email ---
      const actualEmail = await this.email.inputValue();
      const expectedEmail = asString(EditUserdata.email);
      console.log(`Email – Expected: ${expectedEmail}, Actual: ${actualEmail}`);
      if (actualEmail !== expectedEmail) allPassed = false;
      expect.soft(actualEmail).toBe(expectedEmail);

      // --- Active checkbox (only if present in JSON) ---
      if (EditUserdata.active !== undefined) {
        const isChecked = await this.activeCheckbox.isVisible();
        const expectedActive = EditUserdata.active === 'true';
        console.log(`Active – Expected: ${expectedActive}, Actual: ${isChecked}`);
        if (isChecked !== expectedActive) allPassed = false;
        expect.soft(isChecked).toBe(expectedActive);
      } else {
        console.log('⚠️ "active" not found in EditUser.json – skipping checkbox verification');
      }

      // Cancel to return to summary
      await this.cancelButton.click();

    } catch (error) {
      console.error('❌ Error during verification:', error);
      allPassed = false;
    }

    if (allPassed) {
      console.log('✅ Updated User data verified successfully');
    } else {
      console.log('❌ Updated User verification failed – one or more fields did not match');
    }
  }
}