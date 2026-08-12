import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from '../../BasePage';

export class UserTypeCRUD extends BasePage {

  // CREATE
  AddUserTypeButton: Locator;
  UserTypeInput: Locator;
  TypeKeyInput: Locator;
  SaveButton: Locator;

  // LIST
  SearchBox: Locator;

  constructor(page: Page) {
    super(page);

    this.AddUserTypeButton =
      page.getByRole('button', { name: /user type/i });

    this.UserTypeInput =
      page.getByPlaceholder(/user type|e\.g\./i).first();

    this.TypeKeyInput =
      page.getByPlaceholder(/type key|unique/i).first();

    this.SaveButton =
      page.getByRole('button', {
        name: /save user type|update user type/i
      });

    this.SearchBox =
      page.locator('input[placeholder="Search..."]').first();
  }

  // =========================
  // CREATE USER TYPE
  // =========================
  async createUserType(userType: string, typeKey: string) {

    await this.AddUserTypeButton.click();

    await expect(this.UserTypeInput).toBeVisible();

    await this.UserTypeInput.fill(userType);
    await this.TypeKeyInput.fill(typeKey);

    await expect(this.SaveButton).toBeEnabled();
    await this.SaveButton.click();

    const success = this.page.locator(
      'text=/success|saved|created/i'
    );

    await expect(success.first()).toBeVisible({ timeout: 10000 });

    console.log(`✅ Created: ${userType}`);
  }

  // =========================
  // SEARCH USER TYPE
  // =========================
  async searchUserType(userType: string) {

    await this.SearchBox.fill(userType);

    const row = this.page.locator('table tbody tr', {
      hasText: userType
    });

    await expect(row.first()).toBeVisible({ timeout: 10000 });

    console.log(`🔍 Found: ${userType}`);
  }

  // =========================
  // DELETE USER TYPE
  // =========================
  async deleteUserType(userType: string) {

    const row = this.page.locator('table tbody tr', {
      hasText: userType
    });

    await expect(row.first()).toBeVisible({ timeout: 10000 });

    const deleteBtn = row.locator('button').filter({
      hasText: /delete|trash/i
    }).first();

    await expect(deleteBtn).toBeVisible({ timeout: 10000 });

    await deleteBtn.scrollIntoViewIfNeeded();
    await deleteBtn.click({ force: true });

    // confirm popup (if present)
    const confirmBtn = this.page.locator(
      'button:has-text("Yes"), button:has-text("Confirm"), button:has-text("OK")'
    ).first();

    if (await confirmBtn.isVisible().catch(() => false)) {
      await confirmBtn.click();
    }

    const success = this.page.locator(
      'text=/success|deleted/i'
    );

    await expect(success.first()).toBeVisible({ timeout: 10000 });

    console.log(`🗑️ Deleted: ${userType}`);
  }
}