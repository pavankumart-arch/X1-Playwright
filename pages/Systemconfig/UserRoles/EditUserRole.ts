import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from '../../BasePage';

export class UserRoleFlow extends BasePage {

  // CREATE
  AddUserRoleButton: Locator;
  UserRole: Locator;
  AppTypeDropdown: Locator;
  SaveUserRoleButton: Locator;

  // LIST
  SearchBox: Locator;

  constructor(page: Page) {
    super(page);

    this.AddUserRoleButton =
      page.locator('button:has-text("Role")').nth(1);

    this.UserRole =
      page.getByPlaceholder('User Role');

    this.AppTypeDropdown =
      page.locator('select');

    this.SaveUserRoleButton =
      page.getByRole('button', { name: /save role/i });

    this.SearchBox =
      page.locator('input[placeholder="Search..."]').first();
  }

  // ==============================
  // CREATE USER ROLE
  // ==============================
  async createUserRole(roleName: string, appType: string) {

    await this.AddUserRoleButton.click();

    await expect(this.UserRole).toBeVisible();

    await this.UserRole.fill(roleName);

    await this.AppTypeDropdown.selectOption({ label: appType });

    await expect(this.SaveUserRoleButton).toBeEnabled();

    await this.SaveUserRoleButton.click();

    // validate creation (simple UI check)
    const successToast = this.page.locator(
      'text=/success|saved|created/i'
    );

    await expect(successToast.first()).toBeVisible({ timeout: 10000 });

    console.log(`✅ Role Created: ${roleName}`);
  }

  // ==============================
  // SEARCH ROLE
  // ==============================
  async searchUserRole(roleName: string) {

    await this.SearchBox.fill(roleName);

    const row = this.page.locator('table tbody tr', {
      hasText: roleName
    });

    await expect(row.first()).toBeVisible({ timeout: 10000 });

    console.log(`✅ Role Found in list: ${roleName}`);
  }

  // ==============================
  // CLICK EDIT
  // ==============================
  async clickEdit(roleName: string) {

    const row = this.page.locator('table tbody tr', {
      hasText: roleName
    });

    const editButton = row.locator('button').first();

    await expect(editButton).toBeVisible({ timeout: 10000 });

    await editButton.scrollIntoViewIfNeeded();

    await editButton.click({ force: true });

    await expect(this.UserRole).toBeVisible({ timeout: 10000 });

    console.log(`✏️ Edit opened for: ${roleName}`);
  }

  // ==============================
  // UPDATE ROLE
  // ==============================
  async updateUserRole(updatedRole: string) {

    await this.UserRole.fill('');
    await this.UserRole.fill(updatedRole);

    await expect(this.SaveUserRoleButton).toBeEnabled();

    await this.SaveUserRoleButton.click();

    const successToast = this.page.locator(
      'text=/success|saved|updated/i'
    );

    await expect(successToast.first()).toBeVisible({ timeout: 10000 });

    console.log(`✅ Role Updated: ${updatedRole}`);
  }

  // ==============================
  // VALIDATE UPDATE
  // ==============================
  async validateUpdatedRole(updatedRole: string) {

    await this.SearchBox.fill(updatedRole);

    const row = this.page.locator('table tbody tr', {
      hasText: updatedRole
    });

    await expect(row.first()).toBeVisible({ timeout: 10000 });

    console.log(`🎯 Updated Role Verified: ${updatedRole}`);
  }

  // ==============================
  // FULL FLOW
  // ==============================
  async createSearchEditFlow(appType: string) {

    const roleName = `Role_${Date.now()}`;
    const updatedRole = `Updated_${Date.now()}`;

    console.log("\n========== USER ROLE FLOW START ==========");

    // CREATE
    await this.createUserRole(roleName, appType);

    // SEARCH
    await this.searchUserRole(roleName);

    // EDIT
    await this.clickEdit(roleName);

    await this.updateUserRole(updatedRole);

    // VALIDATE
    await this.validateUpdatedRole(updatedRole);

    console.log("========== USER ROLE FLOW COMPLETE ==========\n");
  }
}