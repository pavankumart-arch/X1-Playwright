// UpdatedUser.ts
import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from '../../BasePage';

export class UpdatedUser extends BasePage {
  // Table locators
  searchInput: Locator;
  rows: Locator;

  // Edit form locators (more stable)
  usernameInput: Locator;
  passwordInput: Locator;
  userTypeSelect: Locator;
  resellerSelect: Locator;
  emailInput: Locator;
  activeCheckbox: Locator;        // custom checkbox – adjust selector as needed
  saveUserButton: Locator;
  cancelButton: Locator;

  constructor(page: Page) {
    super(page);

    // Table
    this.searchInput = page.getByPlaceholder('Search...');
    this.rows = page.locator('table tbody tr');

    // Form – use more reliable selectors (role, name, or data-testid)
    this.usernameInput = page.getByPlaceholder('User Name');
    this.passwordInput = page.getByPlaceholder('Password');
    // Assuming user type is a <select> or a custom dropdown. Adapt to your app.
    this.userTypeSelect = page.locator('select[name="userType"]'); 
    this.resellerSelect = page.locator('select[name="resellerId"]');
    this.emailInput = page.getByPlaceholder('Email');
    // Custom checkbox: assume it has attribute data-state="checked" when active
    this.activeCheckbox = page.locator('[role="checkbox"]');
    this.saveUserButton = page.getByRole('button', { name: 'Save User' });
    this.cancelButton = page.getByRole('button', { name: 'Cancel' });
  }

  async openEditUserView(username: string) {
    await this.searchInput.fill(username);
    await expect(this.rows.first()).toBeVisible();

    const matchedRow = this.rows.filter({
      has: this.page.locator('td:nth-child(2)', { hasText: username })
    });
    const editButton = matchedRow.locator('td:last-child button').first();
    await editButton.click();
    // Wait for form to load – better to wait for a visible element
    await expect(this.usernameInput).toBeVisible();
  }

  async editUser(updates: {
    username?: string;
    password?: string;
    userType?: string;
    reseller?: string;
    email?: string;
    active?: boolean;
  }) {
    if (updates.username !== undefined) await this.usernameInput.fill(updates.username);
    if (updates.password !== undefined) await this.passwordInput.fill(updates.password);
    if (updates.userType !== undefined) await this.userTypeSelect.selectOption(updates.userType);
    if (updates.reseller !== undefined) await this.resellerSelect.selectOption(updates.reseller);
    if (updates.email !== undefined) await this.emailInput.fill(updates.email);
    if (updates.active !== undefined) {
      const isChecked = await this.activeCheckbox.getAttribute('data-state') === 'checked';
      if (isChecked !== updates.active) {
        await this.activeCheckbox.click();
      }
    }
  }

  async saveAndWait() {
    await this.saveUserButton.click();
    // Wait for the table to reappear or a success message
    await expect(this.searchInput).toBeVisible({ timeout: 5000 });
  }

  async verifyUserInTable(expected: {
    username: string;
    email: string;
    userType: string;
    reseller?: string;
    active?: boolean;
  }) {
    await this.searchInput.fill(expected.username);
    await expect(this.rows.first()).toBeVisible();

    const matchedRow = this.rows.filter({
      has: this.page.locator('td:nth-child(2)', { hasText: expected.username })
    });

    // Verify email column (adjust column index)
    const actualEmail = await matchedRow.locator('td:nth-child(3)').textContent();
    expect(actualEmail?.trim()).toBe(expected.email);

    // Verify user type column
    const actualUserType = await matchedRow.locator('td:nth-child(4)').textContent();
    expect(actualUserType?.trim()).toBe(expected.userType);

    // If active status is shown, verify it (e.g., column with icon/text)
    if (expected.active !== undefined) {
      const activeCell = matchedRow.locator('td:nth-child(5)');
      // Adapt based on how active is displayed (e.g., 'Active' text or a checkmark)
      const isActive = await activeCell.getByText('Active').isVisible();
      expect(isActive).toBe(expected.active);
    }
  }
}