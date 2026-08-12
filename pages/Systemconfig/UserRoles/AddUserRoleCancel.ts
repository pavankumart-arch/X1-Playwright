import { Page, Locator, expect } from '@playwright/test';

export class AddUserRoleCancel {

  readonly page: Page;

  readonly cancelButton: Locator;
  AddUserRoleButton: Locator;

  constructor(page: Page) {

    this.page = page;
    this.AddUserRoleButton =
      page.locator('button:has-text("Role")').nth(1);
    this.cancelButton =
      page.getByRole('button', {
        name: /cancel/i
      });
  }

  async verifyUserRoleCancelButton(): Promise<boolean> {
    await this.AddUserRoleButton.click();

    try {

      console.log('📋 Clicking Cancel button...');

      await this.cancelButton.waitFor({
        state: 'visible',
        timeout: 10000
      });

      await this.cancelButton.click();

      console.log('✅ Cancel button clicked');

      await this.page.waitForLoadState('networkidle');

      await this.page.waitForTimeout(2000);

      console.log(
        '📋 Verifying navigation back to Roles page...'
      );

      await expect(
        this.page
          .getByRole('button', {
            name: 'Role',
            exact: true
          })
      ).toBeVisible({
        timeout: 10000
      });

      console.log(
        '✅ Successfully navigated back to User Roles page'
      );

      return true;

    } catch (error) {

      console.log(
        `❌ Error in User Role Cancel button verification: ${error}`
      );

      return false;
    }
  }
}