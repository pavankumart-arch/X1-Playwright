import { Locator, Page } from '@playwright/test';
import { BasePage } from '../../BasePage';

export class VerifyAddModuleCancelButton extends BasePage {

  SearchBox: Locator;
  AddButton: Locator;
  AddModuleHeading: Locator;
  CancelButton: Locator;
  ModulesHeading: Locator;

  constructor(page: Page) {

    super(page);

    this.SearchBox =
      page.getByPlaceholder('Search...')
        .first();

    this.AddButton =
      page.getByRole('button', {
        name: 'Module',
        exact: true
      });

    this.AddModuleHeading =
      page.getByRole('heading', {
        name: /add.*module/i
      });

    this.CancelButton =
      page.getByRole('button', {
        name: /cancel/i
      });

    this.ModulesHeading =
      page.getByRole('heading', {
        name: /modules/i
      });
  }

  // =========================
  // OPEN ADMIN APP
  // =========================

  async openAdminApp() {

    await this.SearchBox.waitFor({
      state: 'visible'
    });

    await this.SearchBox.clear();

    await this.SearchBox.fill('Admin');

    await this.page.waitForTimeout(2000);

    const adminLink =
      this.page.getByRole('link', {
        name: 'Admin',
        exact: true
      });

    await adminLink.click();

    await this.ModulesHeading.waitFor({
      state: 'visible',
      timeout: 15000
    });

    console.log('✅ Opened Admin Modules Page');
  }

  // =========================
  // VERIFY CANCEL BUTTON
  // =========================

  async VerifyModuleCancelButton(): Promise<boolean> {

    try {

      await this.openAdminApp();

      console.log('📋 Opening Add Module form...');

      await this.AddButton.click();

      await this.AddModuleHeading.waitFor({
        state: 'visible',
        timeout: 10000
      });

      console.log('✅ Add Module form opened');

      console.log('📋 Clicking Cancel button...');

      await this.CancelButton.click();

      await this.ModulesHeading.waitFor({
        state: 'visible',
        timeout: 10000
      });

      const isVisible =
        await this.ModulesHeading.isVisible();

      if (isVisible) {

        console.log(
          '✅ Cancel button working fine - Returned to Modules page'
        );
      }

      return isVisible;

    } catch (error) {

      console.error(
        `❌ Error in Module Cancel Button Verification: ${error}`
      );

      return false;
    }
  }
}