import { Locator, Page } from '@playwright/test';

import { BasePage } from '../../BasePage';

export class VerifyNavGroupCancelButton extends BasePage {

  AddNavGroupButton: Locator;

  CancelButton: Locator;

  AddNavGroupHeading: Locator;

  SummaryPageHeading: Locator;

  constructor(page: Page) {

    super(page);

    // Add Nav Group Button
    this.AddNavGroupButton = page
      .locator('button')
      .filter({ hasText: 'Nav Group' })
      .last();

    // Cancel Button
    this.CancelButton = page.getByRole('button', {
      name: /cancel/i
    });

    // Add Form Heading
    this.AddNavGroupHeading = page.getByRole('heading', {
      name: /add nav group/i
    });

    // Summary Page Heading
    this.SummaryPageHeading = page.getByRole('heading', {
      name: /nav groups/i
    });
  }

  async VerifyNavGroupCancelButton(): Promise<boolean> {

    try {

      console.log('\n' + '='.repeat(60));
      console.log('VERIFY NAV GROUP CANCEL BUTTON');
      console.log('='.repeat(60));

      // ============================
      // STEP 1 : Open Add Nav Group Form
      // ============================
      console.log('\n📋 Opening Add Nav Group Form');

      await this.AddNavGroupButton.waitFor({
        state: 'visible',
        timeout: 10000
      });

      await this.AddNavGroupButton.click();

      await this.page.waitForTimeout(2000);

      // ============================
      // STEP 2 : Verify Form Opened
      // ============================
      console.log('📋 Verifying Add Nav Group Form');

      await this.AddNavGroupHeading.waitFor({
        state: 'visible',
        timeout: 5000
      });

      console.log('✅ Add Nav Group Form Opened');

      // ============================
      // STEP 3 : Click Cancel Button
      // ============================
      console.log('📋 Clicking Cancel Button');

      await this.CancelButton.click();

      await this.page.waitForTimeout(2000);

      console.log('✅ Cancel Button Clicked');

      // ============================
      // STEP 4 : Verify Navigation Back
      // ============================
      console.log('📋 Verifying Navigation Back');

      await this.SummaryPageHeading.waitFor({
        state: 'visible',
        timeout: 5000
      });

      console.log('✅ Navigated Back To Nav Groups Page');

      // ============================
      // STEP 5 : Final Validation
      // ============================
      const isBackOnSummaryPage =
        await this.AddNavGroupButton.isVisible();

      const message = isBackOnSummaryPage
        ? '✅ Cancel button working fine'
        : '❌ Cancel button failed';

      console.log(message);

      return isBackOnSummaryPage;

    } catch (error) {

      console.log(`❌ Error : ${error}`);

      return false;
    }
  }
}