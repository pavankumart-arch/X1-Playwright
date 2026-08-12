import { Locator, Page, TestInfo } from '@playwright/test';
import { logAndValidate } from '../../utils/reportUtil';

export class RooftopShow {
  private page: Page;
  private showDropdown: Locator;
  private nextButton: Locator;
  private previousButton: Locator;
  private tableRows: Locator;
  private totalRecordsInfo: Locator;

  constructor(page: Page) {
    this.page = page;
    
    this.showDropdown = page.locator('select').filter({ hasText: 'Show' }).or(
      page.locator('.items-per-page select').or(
        page.locator('select[aria-label="Items per page"]')
      )
    );
    
    this.nextButton = page.getByRole('button', { name: 'Next' }).or(
      page.locator('button[aria-label="Next page"]')
    );
    
    this.previousButton = page.getByRole('button', { name: 'Previous' }).or(
      page.locator('button[aria-label="Previous page"]')
    );
    
    this.tableRows = page.locator('table tbody tr');
    this.totalRecordsInfo = page.locator('text=/Showing \\d+-\\d+ of \\d+/');
  }

  async selectItemsPerPage(itemsCount: number): Promise<void> {
    await this.showDropdown.selectOption(itemsCount.toString());
    await this.page.waitForTimeout(1000);
    await this.showDropdown.dispatchEvent('change');
    await this.page.waitForTimeout(1000);
    await this.showDropdown.press('Enter');
    await this.page.waitForTimeout(1000);
    
    await this.page.waitForLoadState('networkidle');
    await this.page.waitForTimeout(2000);
    await this.totalRecordsInfo.waitFor({ state: 'visible', timeout: 5000 });
  }

  async getTotalRecordsCount(): Promise<number> {
    const infoText = await this.totalRecordsInfo.textContent();
    const match = infoText?.match(/of\s+(\d+)/);
    return match ? parseInt(match[1]) : 0;
  }

  async getCurrentPageRowCount(): Promise<number> {
    await this.tableRows.first().waitFor({ state: 'visible', timeout: 5000 });
    return await this.tableRows.count();
  }

  async isNextEnabled(): Promise<boolean> {
    return await this.nextButton.isEnabled();
  }

  async clickNext(): Promise<void> {
    await this.nextButton.click();
    await this.page.waitForLoadState('networkidle');
    await this.page.waitForTimeout(1000);
  }

  async forceRefresh(): Promise<void> {
    await this.page.reload();
    await this.page.waitForLoadState('networkidle');
    await this.page.waitForTimeout(2000);
  }

  async verifyPaginationForSize(recordsPerPage: number, testInfo: TestInfo, isFirstTest: boolean = false): Promise<{
    success: boolean;
    totalRecords: number;
    pagesVerified: number;
    failures: string[];
  }> {
    const failures: string[] = [];
    
    if (!isFirstTest) {
      await this.forceRefresh();
    }
    
    await this.selectItemsPerPage(recordsPerPage);
    
    const totalRecords = await this.getTotalRecordsCount();
    
    if (totalRecords === 0) {
      const errorMsg = `No records found to test for ${recordsPerPage} records per page`;
      console.error(`❌ ${errorMsg}`);
      failures.push(errorMsg);
      return { success: false, totalRecords: 0, pagesVerified: 0, failures };
    }
    
    const expectedPages = Math.ceil(totalRecords / recordsPerPage);
    let currentPage = 1;
    let totalRecordsVerified = 0;
    
    console.log(`Total Records: ${totalRecords}`);
    console.log(`Records per page: ${recordsPerPage}`);
    console.log(`Expected Pages: ${expectedPages}`);
    console.log(`${"-".repeat(60)}`);
    
    let rowCount = await this.getCurrentPageRowCount();
    
    while (true) {
      const isLastPage = currentPage === expectedPages;
      const expectedRows = isLastPage && totalRecords % recordsPerPage !== 0 
        ? totalRecords % recordsPerPage 
        : recordsPerPage;
      
      logAndValidate({
        step: `Show ${recordsPerPage} - Page ${currentPage} Records`,
        expected: expectedRows,
        actual: rowCount,
        isSummary: false
      }, testInfo);
      
      if (rowCount !== expectedRows) {
        const errorMsg = `Page ${currentPage}: Expected ${expectedRows} records, but found ${rowCount}`;
        failures.push(errorMsg);
        console.error(`❌ ${errorMsg}`);
      }
      
      totalRecordsVerified += rowCount;
      
      const isNextEnabled = await this.isNextEnabled();
      if (isNextEnabled && currentPage < expectedPages) {
        await this.clickNext();
        currentPage++;
        rowCount = await this.getCurrentPageRowCount();
      } else {
        break;
      }
    }
    
    logAndValidate({
      step: `Show ${recordsPerPage} - Total Records`,
      expected: totalRecords,
      actual: totalRecordsVerified,
      isSummary: true
    }, testInfo);
    
    if (totalRecordsVerified !== totalRecords) {
      const errorMsg = `Total records mismatch: Expected ${totalRecords}, but verified ${totalRecordsVerified}`;
      failures.push(errorMsg);
      console.error(`❌ ${errorMsg}`);
    }
    
    const success = failures.length === 0;
    
    console.log(`${"-".repeat(60)}`);
    if (success) {
      console.log(`✅ Verified ${currentPage} pages with ${totalRecordsVerified} total records`);
    } else {
      console.log(`❌ Verification FAILED for ${recordsPerPage} records per page`);
      console.log(`📋 Error Details:`);
      failures.forEach((failure, index) => {
        console.log(`   ${index + 1}. ${failure}`);
      });
    }
    
    return {
      success,
      totalRecords,
      pagesVerified: currentPage,
      failures
    };
  }

  async testAllShowOptions(navigation: any, testInfo: TestInfo): Promise<{
    success: boolean;
    results: Array<{
      option: number;
      success: boolean;
      totalRecords: number;
      pagesVerified: number;
      failures: string[];
    }>;
  }> {
    const showOptions = [10, 20, 50, 100];
    const results = [];
    let allSuccess = true;
    const failedTests: string[] = [];
    
    for (let i = 0; i < showOptions.length; i++) {
      const option = showOptions[i];
      
      console.log(`\n${"=".repeat(60)}`);
      console.log(`Testing Show = ${option}`);
      console.log(`${"=".repeat(60)}`);
      
      const isFirstTest = i === 0;
      
      if (!isFirstTest) {
        await this.page.reload();
        await this.page.waitForLoadState('networkidle');
        await this.page.waitForTimeout(2000);
        await navigation.goToListofRooftops();
        await this.page.waitForLoadState('networkidle');
        await this.page.waitForTimeout(2000);
      }
      
      const result = await this.verifyPaginationForSize(option, testInfo, isFirstTest);
      
      results.push({
        option: option,
        success: result.success,
        totalRecords: result.totalRecords,
        pagesVerified: result.pagesVerified,
        failures: result.failures
      });
      
      if (!result.success) {
        allSuccess = false;
        failedTests.push(`${option} records per page`);
      }
      
      console.log(`\n✅ Completed testing for ${option} records per page\n`);
    }
    
    // Summary with detailed error reporting
    console.log(`\n${"=".repeat(60)}`);
    console.log(`📊 SHOW DROPDOWN & PAGINATION TEST SUMMARY`);
    console.log(`${"=".repeat(60)}`);
    
    let hasErrors = false;
    for (const result of results) {
      const status = result.success ? '✅ PASS' : '❌ FAIL';
      console.log(`${result.option.toString().padEnd(10)} records: ${status}`);
      
      if (!result.success && result.failures.length > 0) {
        hasErrors = true;
        console.log(`   └─ Error Details for ${result.option} records:`);
        result.failures.forEach((failure, idx) => {
          console.log(`      ${idx + 1}. ${failure}`);
        });
      }
      
      logAndValidate({
        step: `Show ${result.option} records per page - Overall Result`,
        expected: "PASS",
        actual: result.success ? "PASS" : "FAIL",
        isSummary: true
      }, testInfo);
    }
    console.log(`${"=".repeat(60)}`);
    
    // Final error summary
    if (!allSuccess) {
      console.log(`\n${"❌".repeat(30)}`);
      console.log(`TEST FAILURE SUMMARY`);
      console.log(`${"❌".repeat(30)}`);
      console.log(`Failed test(s): ${failedTests.join(', ')}`);
      console.log(`Total failures: ${failedTests.length} out of ${showOptions.length}`);
      console.log(`\nPlease check the detailed errors above for each failed test case.`);
      console.log(`${"❌".repeat(30)}`);
    } else {
      console.log(`\n${"✅".repeat(30)}`);
      console.log(`ALL TESTS PASSED SUCCESSFULLY!`);
      console.log(`${"✅".repeat(30)}`);
    }
    
    return {
      success: allSuccess,
      results
    };
  }

  async verifyNextPreviousButtons(testInfo: TestInfo): Promise<boolean> {
    console.log('\n📋 Verifying Next/Previous buttons');
    
    await this.selectItemsPerPage(10);
    await this.page.waitForTimeout(1000);
    
    const totalRecords = await this.getTotalRecordsCount();
    const recordsPerPage = 10;
    const totalPages = Math.ceil(totalRecords / recordsPerPage);
    
    console.log(`Total Pages: ${totalPages}`);
    
    let currentPage = 1;
    let allPassed = true;
    const errors: string[] = [];
    
    for (let i = 1; i < totalPages; i++) {
      const isNextEnabled = await this.isNextEnabled();
      
      logAndValidate({
        step: `Next Button - Page ${currentPage}`,
        expected: true,
        actual: isNextEnabled,
        isSummary: false
      }, testInfo);
      
      if (!isNextEnabled) {
        const errorMsg = `Next button is disabled on page ${currentPage} but should be enabled`;
        errors.push(errorMsg);
        console.error(`❌ ${errorMsg}`);
        allPassed = false;
        break;
      }
      
      await this.clickNext();
      currentPage++;
    }
    
    const isNextEnabled = await this.isNextEnabled();
    logAndValidate({
      step: `Next Button - Last Page`,
      expected: false,
      actual: isNextEnabled,
      isSummary: false
    }, testInfo);
    
    if (isNextEnabled) {
      const errorMsg = `Next button is enabled on last page but should be disabled`;
      errors.push(errorMsg);
      console.error(`❌ ${errorMsg}`);
      allPassed = false;
    }
    
    for (let i = totalPages; i > 1; i--) {
      const isPrevEnabled = await this.previousButton.isEnabled();
      
      logAndValidate({
        step: `Previous Button - Page ${currentPage}`,
        expected: true,
        actual: isPrevEnabled,
        isSummary: false
      }, testInfo);
      
      if (!isPrevEnabled) {
        const errorMsg = `Previous button is disabled on page ${currentPage} but should be enabled`;
        errors.push(errorMsg);
        console.error(`❌ ${errorMsg}`);
        allPassed = false;
        break;
      }
      
      await this.previousButton.click();
      await this.page.waitForLoadState('networkidle');
      currentPage--;
    }
    
    const isPrevEnabled = await this.previousButton.isEnabled();
    logAndValidate({
      step: `Previous Button - First Page`,
      expected: false,
      actual: isPrevEnabled,
      isSummary: false
    }, testInfo);
    
    if (isPrevEnabled) {
      const errorMsg = `Previous button is enabled on first page but should be disabled`;
      errors.push(errorMsg);
      console.error(`❌ ${errorMsg}`);
      allPassed = false;
    }
    
    if (allPassed) {
      console.log('✅ Next/Previous buttons verified successfully');
    } else {
      console.log(`\n❌ Next/Previous buttons verification FAILED`);
      console.log(`📋 Error Details:`);
      errors.forEach((error, index) => {
        console.log(`   ${index + 1}. ${error}`);
      });
    }
    
    return allPassed;
  }
}