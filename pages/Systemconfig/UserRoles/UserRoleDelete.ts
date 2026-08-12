import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from '../../BasePage';

export class UserRoleCRUD extends BasePage {

  // CREATE
  AddUserRoleButton: Locator;
  UserRoleInput: Locator;
  AppTypeDropdown: Locator;
  SaveButton: Locator;

  // LIST
  SearchBox: Locator;

  constructor(page: Page) {
    super(page);

    this.AddUserRoleButton =
      page.locator('button:has-text("Role")').nth(1);

    this.UserRoleInput =
      page.getByPlaceholder('User Role');

    this.AppTypeDropdown =
      page.locator('select');

    this.SaveButton =
      page.getByRole('button', { name: /save role/i });

    this.SearchBox =
      page.locator('input[placeholder="Search..."]').first();
  }

  // =========================
  // ADD USER ROLE
  // =========================
  async addUserRole(roleName: string, appType: string) {

    await this.AddUserRoleButton.click();

    await expect(this.UserRoleInput).toBeVisible();

    await this.UserRoleInput.fill(roleName);

    await this.AppTypeDropdown.selectOption({ label: appType });

    await expect(this.SaveButton).toBeEnabled();

    await this.SaveButton.click();

    const success = this.page.locator('text=/success|saved|created/i');
    await expect(success.first()).toBeVisible({ timeout: 10000 });

    console.log(`✅ Role Created: ${roleName}`);
  }

  // =========================
  // SEARCH USER ROLE
  // =========================
  async searchUserRole(roleName: string) {

    await this.SearchBox.fill(roleName);

    const row = this.page.locator('table tbody tr', {
      hasText: roleName
    });

    await expect(row.first()).toBeVisible({ timeout: 10000 });

    console.log(`🔍 Role Found: ${roleName}`);
  }

  // =========================
  // DELETE USER ROLE
  // =========================
  async deleteUserRole(roleName: string) {

    const row = this.page.locator('table tbody tr', {
      hasText: roleName
    });

    await expect(row.first()).toBeVisible({ timeout: 10000 });

    const deleteBtn = row.locator('button').filter({
      hasText: /delete|trash/i
    }).first();

    await expect(deleteBtn).toBeVisible({ timeout: 10000 });

    await deleteBtn.scrollIntoViewIfNeeded();
    await deleteBtn.click({ force: true });

    // confirm popup (if exists)
    const confirmBtn = this.page.locator(
      'button:has-text("Yes"), button:has-text("Confirm"), button:has-text("OK")'
    ).first();

    if (await confirmBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await confirmBtn.click();
    }

    const success = this.page.locator('text=/deleted|success/i');
    await expect(success.first()).toBeVisible({ timeout: 10000 });

    console.log(`🗑️ Role Deleted: ${roleName}`);
  }
}