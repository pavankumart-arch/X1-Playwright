import { Locator, Page } from '@playwright/test';
import { BasePage } from '../../BasePage';

export class VerifyAppTypeCancelButton extends BasePage {

  AddButton: Locator;
  AddAppTypeHeading: Locator;
  CancelButton: Locator;
  AppTypesHeading: Locator;

  constructor(page: Page) {
    super(page);

    this.AddButton = page.locator('text=Add AppType');

    this.AddAppTypeHeading = page.getByRole('heading', {
      name: /add.*app/i
    });

    this.CancelButton = page.getByRole('button', {
      name: /cancel/i
    });

    this.AppTypesHeading = page.getByRole('heading', {
      name: /apps/i
    });
  }

  async VerifyAppTypeCancelButton(): Promise<boolean> {
    try {

      console.log('📋 Opening Add AppType form...');

      await this.AddButton.click();

      await this.AddAppTypeHeading.waitFor({
        state: 'visible',
        timeout: 10000
      });

      console.log('✅ Add AppType form opened');

      console.log('📋 Clicking Cancel button...');

      await this.CancelButton.click();

      await this.page.waitForLoadState('networkidle');

      console.log('📋 Verifying navigation back to Apps page...');

      await this.AppTypesHeading.waitFor({
        state: 'visible',
        timeout: 10000
      });

      const isVisible =
        await this.AppTypesHeading.isVisible();

      if (isVisible) {
        console.log(
          '✅ Cancel button working fine - Returned to Apps page'
        );
      }

      return isVisible;

    } catch (error) {

      console.error(
        `❌ Error in AppType Cancel button verification: ${error}`
      );

      const headings =
        await this.page
          .locator('h1,h2,h3,h4,h5,h6')
          .allTextContents();

      console.log('Available headings:', headings);

      return false;
    }
  }
}