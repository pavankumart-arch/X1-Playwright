import { expect, Locator, Page, TestInfo } from '@playwright/test';
import { BasePage } from '../BasePage';
import { Reporter } from '../utils/NewReport';


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

  async VerifyRooftopCancelButton(testInfo: TestInfo): Promise<boolean> {
    Reporter.startTest();

    try {
      console.log('\n' + '='.repeat(80));
      console.log('VERIFY ROOFTOP CANCEL BUTTON');
      console.log('='.repeat(80));

      // Step 1: Wait for Add Rooftop button to be visible
      console.log('\n📍 Step 1: Checking Add Rooftop button visibility');
      await this.AddRooftopButton.waitFor({ state: 'visible', timeout: 10000 });
      const isAddButtonVisible = await this.AddRooftopButton.isVisible();
      
      Reporter.validateData(
        true,
        isAddButtonVisible,
        'Add Rooftop Button Visibility',
        testInfo
      );
      console.log(`  Add Rooftop button visible: ${isAddButtonVisible ? '✅' : '❌'}`);

      // Step 2: Click Add Rooftop button to open form
      console.log('\n📍 Step 2: Opening Add Rooftop form');
      await this.AddRooftopButton.click();
      await this.page.waitForTimeout(1000);
      Reporter.validateData(
        'Clicked',
        'Clicked',
        'Click Add Rooftop Button',
        testInfo
      );
      console.log('  ✅ Add Rooftop button clicked');

      // Step 3: Verify Add Rooftop form is opened
      console.log('\n📍 Step 3: Verifying Add Rooftop form opened');
      await this.AddRooftopHeading.waitFor({ state: 'visible', timeout: 5000 });
      const isFormOpen = await this.AddRooftopHeading.isVisible();
      
      Reporter.validateData(
        true,
        isFormOpen,
        'Add Rooftop Form Opened',
        testInfo
      );
      console.log(`  Add Rooftop form opened: ${isFormOpen ? '✅' : '❌'}`);

      // Step 4: Click Cancel button
      console.log('\n📍 Step 4: Clicking Cancel button');
      await this.CancelButton.click();
      Reporter.validateData(
        'Clicked',
        'Clicked',
        'Click Cancel Button',
        testInfo
      );
      console.log('  ✅ Cancel button clicked');

      // Step 5: Wait for navigation back to summary page
      console.log('\n📍 Step 5: Verifying navigation back to summary page');
      await this.SummaryPageHeading.waitFor({ state: 'visible', timeout: 5000 });
      const isSummaryPageVisible = await this.SummaryPageHeading.isVisible();
      
      Reporter.validateData(
        true,
        isSummaryPageVisible,
        'Summary Page Displayed After Cancel',
        testInfo
      );
      console.log(`  Summary page visible: ${isSummaryPageVisible ? '✅' : '❌'}`);

      // Step 6: Verify Add Rooftop button is visible on summary page
      console.log('\n📍 Step 6: Verifying Add Rooftop button on summary page');
      const isBackOnSummaryPage = await this.AddRooftopButton.isVisible();
      
      Reporter.validateData(
        true,
        isBackOnSummaryPage,
        'Add Rooftop Button Visible After Cancel',
        testInfo
      );
      console.log(`  Add Rooftop button visible: ${isBackOnSummaryPage ? '✅' : '❌'}`);

      // Final validation
      const success = isBackOnSummaryPage && isSummaryPageVisible && isFormOpen && isAddButtonVisible;
      
      Reporter.validateData(
        true,
        success,
        'Rooftop Cancel Button Functionality',
        testInfo
      );

      const summary = Reporter.endTest(testInfo);
      
      console.log('\n' + '='.repeat(80));
      console.log(success ? '✅ TEST PASSED: Cancel button working fine' : '❌ TEST FAILED: Cancel button not working');
      console.log('='.repeat(80));
      console.log(`📊 Pass Rate: ${summary.passRate}\n`);

      return success;

    } catch (error) {
      console.error(`\n❌ Error in Cancel button verification: ${error}`);
      Reporter.validateData(
        'Success',
        `Failed: ${error}`,
        'Rooftop Cancel Button Functionality',
        testInfo
      );
      Reporter.endTest(testInfo);
      return false;
    }
  }
}