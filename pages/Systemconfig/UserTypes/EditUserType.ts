import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from '../../BasePage';

export class UserTypeCRUD extends BasePage {

  // CREATE / EDIT FORM
  AddUserTypeButton: Locator;
  UserTypeInput: Locator;
  TypeKeyInput: Locator;
  ActiveCheckbox: Locator;
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

    this.ActiveCheckbox =
      page.locator('input[type="checkbox"]').first();

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

    console.log(`✅ UserType Created: ${userType}`);
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

    console.log(`🔍 UserType Found: ${userType}`);
  }

  // =========================
  // EDIT USER TYPE
  // =========================
  async editUserType(
    oldName: string,
    newName: string,
    newKey: string
  ) {

    const row = this.page.locator('table tbody tr', {
      hasText: oldName
    });

    await expect(row.first()).toBeVisible({ timeout: 10000 });

    const editBtn = row.locator('button').first();

    await editBtn.click();

    await expect(this.UserTypeInput).toBeVisible();

    await this.UserTypeInput.fill('');
    await this.UserTypeInput.fill(newName);

    await this.TypeKeyInput.fill('');
    await this.TypeKeyInput.fill(newKey);

    await this.SaveButton.click();

    const success = this.page.locator(
      'text=/success|updated|saved/i'
    );

    await expect(success.first()).toBeVisible({ timeout: 10000 });

    console.log(`✏️ UserType Updated: ${newName}`);
  }

  // =========================
  // VALIDATE UPDATED USER TYPE
  // =========================
  async validateUserType(updatedName: string) {

    await this.SearchBox.fill(updatedName);

    const row = this.page.locator('table tbody tr', {
      hasText: updatedName
    });

    await expect(row.first()).toBeVisible({ timeout: 10000 });

    console.log(`✅ Validation Passed: ${updatedName}`);
  }
}