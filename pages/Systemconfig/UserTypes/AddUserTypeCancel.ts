import { expect, Locator, Page } from '@playwright/test';
import { BasePage } from '../../BasePage';

export class VerifyUserTypeCancelButton extends BasePage {

  AddUserTypeButton: Locator;
  CancelButton: Locator;
  AddUserTypeHeading: Locator;
  SummaryPageHeading: Locator;

  constructor(page: Page) {

    super(page);

    // =========================================
    // LOCATORS
    // =========================================

    this.AddUserTypeButton =
      this.page.getByRole('button', {
        name: 'User Type',
        exact: true
    });

    this.CancelButton =
      page.getByRole('button', {
        name: 'Cancel'
      });

    this.AddUserTypeHeading =
      page.getByRole('heading', {
        name: 'Add User Type'
      });

    this.SummaryPageHeading =
      page.getByRole('heading', {
        name: 'User Types'
      });
  }

  async VerifyUserTypeCancelButton(): Promise<boolean> {

    try {

      // =========================================
      // WAIT FOR BUTTON
      // =========================================

      console.log(
        '📋 Waiting for Add User Type button...'
      );

      await this.AddUserTypeButton.waitFor({
        state: 'visible',
        timeout: 10000
      });

      // =========================================
      // CLICK ADD USER TYPE
      // =========================================

      console.log(
        '📋 Clicking Add User Type button...'
      );

      await this.AddUserTypeButton.click({
        force: true
      });

      await this.page.waitForTimeout(1000);

      // =========================================
      // VERIFY FORM OPENED
      // =========================================

      console.log(
        '📋 Verifying Add User Type form opened...'
      );

      await this.AddUserTypeHeading.waitFor({
        state: 'visible',
        timeout: 5000
      });

      console.log(
        '✅ Add User Type form opened'
      );

      // =========================================
      // CLICK CANCEL
      // =========================================

      console.log(
        '📋 Clicking Cancel button...'
      );

      await this.CancelButton.click();

      console.log(
        '✅ Cancel button clicked'
      );

      // =========================================
      // WAIT FOR SUMMARY PAGE
      // =========================================

      console.log(
        '📋 Waiting for navigation back to summary page...'
      );

      await this.SummaryPageHeading.waitFor({
        state: 'visible',
        timeout: 5000
      });

      console.log(
        '✅ Navigated back to summary page'
      );

      // =========================================
      // VERIFY SUMMARY PAGE
      // =========================================

      const isBackOnSummaryPage =
        await this.AddUserTypeButton.isVisible();

      const message =
        isBackOnSummaryPage
          ? '✅ Cancel button working fine - Navigated back to summary page'
          : '❌ Cancel button not working fine';

      console.log(message);

      return isBackOnSummaryPage;

    } catch (error) {

      console.error(
        `❌ Error in Cancel button verification: ${error}`
      );

      return false;
    }
  }
}