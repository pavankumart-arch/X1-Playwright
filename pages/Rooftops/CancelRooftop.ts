import { expect, Locator, Page, test } from '@playwright/test';
import { BasePage } from '../BasePage';

export class VerifyRooftopCancelButton extends BasePage {

  AddRooftopButton: Locator;
  CancelButton: Locator;
  AddRooftopHeading: Locator;
  SummaryPageHeading: Locator;

  constructor(page: Page) {
    super(page);

  this.AddRooftopButton = page.locator('[class="flex items-center gap-2"]');
    this.CancelButton = page.getByRole('button', { name: 'Cancel' });
    this.AddRooftopHeading = page.getByRole('heading', { name: 'Add Rooftop' });
    this.SummaryPageHeading = page.getByRole('heading', { name: 'Premier Auto Group Rooftops' });
  }

  async VerifyRooftopCancelButton(): Promise<boolean> {
    try {
      // Step 1: Wait for Add Rooftop button to be visible
      console.log('📋 Waiting for Add Rooftop button...');
      await this.AddRooftopButton.waitFor({ state: 'visible', timeout: 10000 });
      
      // Step 2: Click Add Rooftop button to open form
      console.log('📋 Clicking Add Rooftop button...');
      await this.AddRooftopButton.click();
      await this.page.waitForTimeout(1000);
      
      // Step 3: Verify Add Rooftop form is opened
      console.log('📋 Verifying Add Rooftop form opened...');
      await this.AddRooftopHeading.waitFor({ state: 'visible', timeout: 5000 });
      console.log('✅ Add Rooftop form opened');

      // Step 4: Click Cancel button
      console.log('📋 Clicking Cancel button...');
      await this.CancelButton.click();
      console.log('✅ Cancel button clicked');

      // Step 5: Wait for navigation back to summary page
      console.log('📋 Waiting for navigation back to summary page...');
      await this.SummaryPageHeading.waitFor({ state: 'visible', timeout: 5000 });
      console.log('✅ Navigated back to summary page');

      // Step 6: Verify Add Rooftop button is visible on summary page
      const isBackOnSummaryPage = await this.AddRooftopButton.isVisible();

      // Step 7: Business Message
      const message = isBackOnSummaryPage
        ? '✅ Cancel button working fine - Navigated back to summary page'
        : '❌ Cancel button is not working fine - Did not navigate to summary page';

      console.log(message);

      return isBackOnSummaryPage;

    } catch (error) {
      console.error(`❌ Error in Cancel button verification: ${error}`);
      return false;
    }
  }
}