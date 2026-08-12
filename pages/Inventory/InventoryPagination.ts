import { Page, TestInfo, Locator } from '@playwright/test';
import { Reporter } from '../../pages/utils/NewReport';

export class InventoryPagination {
  readonly page: Page;
  private testInfo: TestInfo;
  readonly showCountDropdown: Locator;
  readonly rows: Locator;
  readonly paginationText: Locator;

  constructor(page: Page, testInfo: TestInfo) {
    this.page = page;
    this.testInfo = testInfo;
    this.showCountDropdown = page.locator('select');
    this.rows = page.locator('table tbody tr');
    this.paginationText = page.locator('text=/Showing \\d+-\\d+ of \\d+/');
  }

  async waitForTableLoad(): Promise<void> {
    try {
      await this.rows.first().waitFor({ state: 'visible', timeout: 15000 });
      await this.page.waitForTimeout(500);
    } catch (error) {
      console.log(`⚠️ Warning waiting for table to load:`, error);
    }
  }

  async getTotalFromUI(): Promise<number> {
    try {
      const text = await this.paginationText.textContent();
      console.log(`📊 Pagination Text: ${text}`);
      const total = Number(text?.match(/of (\d+)/)?.[1]);
      return total || 0;
    } catch (error) {
      console.log(`⚠️ Could not get total records: ${error}`);
      return 0;
    }
  }

  async getCurrentPageNumber(): Promise<number> {
    try {
      const text = await this.paginationText.textContent();
      const match = text?.match(/Showing (\d+)-(\d+) of/);
      if (match && match[1] && match[2]) {
        const startRecord = parseInt(match[1]);
        const endRecord = parseInt(match[2]);
        const pageSize = endRecord - startRecord + 1;
        const currentPage = Math.ceil(startRecord / pageSize);
        return currentPage;
      }
    } catch (error) {
      console.log(`⚠️ Could not get current page: ${error}`);
    }
    return 1;
  }

  async getCurrentPageSize(): Promise<number> {
    try {
      const text = await this.paginationText.textContent();
      const match = text?.match(/Showing \d+-(\d+) of/);
      if (match && match[1]) {
        return parseInt(match[1]);
      }
    } catch (error) {
      console.log(`⚠️ Could not get page size: ${error}`);
    }
    return 10;
  }

  private async scrollToPagination(): Promise<void> {
    await this.page.evaluate(() => {
      const paginationArea = document.querySelector('[role="navigation"]') || document.querySelector('.pagination') || document.querySelector('.pagination-container');
      if (paginationArea) {
        (paginationArea as HTMLElement).scrollIntoView({ behavior: 'smooth', block: 'end' });
      } else {
        window.scrollTo(0, document.body.scrollHeight);
      }
    });
    await this.page.waitForTimeout(300);
  }

  async goToFirstPage(): Promise<void> {
    console.log(`📍 Going to first page...`);
    await this.scrollToPagination();
    const pageOneBtn = this.page.locator('button').filter({ hasText: /^1$/ }).first();
    if (await pageOneBtn.isVisible().catch(() => false)) {
      await pageOneBtn.click();
      await this.waitForTableLoad();
    }
  }

  async debugPaginationButtons(pageSize: string): Promise<void> {
    console.log(`\n🔍 DEBUGGING PAGINATION FOR PAGE SIZE: ${pageSize}`);
    console.log(`${'='.repeat(80)}`);
    await this.scrollToPagination();
    const buttons = this.page.locator('button');
    const count = await buttons.count();
    console.log(`📋 Total buttons found: ${count}`);
    for (let i = 0; i < Math.min(count, 15); i++) {
      try {
        const btn = buttons.nth(i);
        const text = await btn.textContent().catch(() => '');
        const ariaLabel = await btn.getAttribute('aria-label').catch(() => '');
        const className = await btn.getAttribute('class').catch(() => '');
        const disabled = await btn.getAttribute('disabled').catch(() => null);
        const isVisible = await btn.isVisible().catch(() => false);
        if (text || ariaLabel) {
          console.log(`Button ${i}: text="${text}" | aria-label="${ariaLabel}" | class="${className}" | disabled=${disabled} | visible=${isVisible}`);
        }
      } catch (error) {
        // Skip
      }
    }
    console.log(`\n🔍 Searching for next button with various selectors:`);
    const selectorsToTry = ['button[aria-label*="next" i]', 'button[aria-label*="Next" i]', 'button:has-text("›")', 'button:has-text(">")', 'button:has-text("Next")', 'button.next', '.pagination-next', '.next-page', 'li.next button', 'button:last-child'];
    for (const selector of selectorsToTry) {
      try {
        const btn = this.page.locator(selector).first();
        const exists = await btn.count() > 0;
        if (exists) {
          const isVisible = await btn.isVisible().catch(() => false);
          const text = await btn.textContent().catch(() => '');
          const disabled = await btn.getAttribute('disabled').catch(() => null);
          console.log(`  Selector "${selector}": exists=${exists}, visible=${isVisible}, text="${text}", disabled=${disabled}`);
        }
      } catch (error) {
        // Skip
      }
    }
    console.log(`${'='.repeat(80)}\n`);
  }

  private async getNextButton(): Promise<Locator | null> {
    await this.scrollToPagination();
    const selectors = ['button[aria-label*="next" i]', 'button[aria-label*="Next" i]', 'button:has-text("›")', 'button:has-text(">")', 'button:has-text("Next")', 'button.next', '.pagination-next', '.next-page', 'li.next button', 'li.next a', 'button:last-child', 'a:last-child'];
    for (const selector of selectors) {
      try {
        const btn = this.page.locator(selector).first();
        const isVisible = await btn.isVisible({ timeout: 500 }).catch(() => false);
        if (isVisible) {
          const disabled = await btn.getAttribute('disabled').catch(() => null);
          const ariaDisabled = await btn.getAttribute('aria-disabled').catch(() => null);
          if (disabled === null && ariaDisabled !== 'true') {
            return btn;
          }
        }
      } catch (error) {
        // Continue
      }
    }
    return null;
  }

  private async isLastPage(): Promise<boolean> {
    const nextBtn = await this.getNextButton();
    if (!nextBtn) return true;
    const disabled = await nextBtn.getAttribute('disabled').catch(() => null);
    const ariaDisabled = await nextBtn.getAttribute('aria-disabled').catch(() => null);
    return disabled !== null || ariaDisabled === 'true';
  }

  async clickNextPage(): Promise<boolean> {
    try {
      const nextBtn = await this.getNextButton();
      if (!nextBtn) {
        return false;
      }
      const disabled = await nextBtn.getAttribute('disabled').catch(() => null);
      if (disabled !== null) {
        return false;
      }
      const currentPageBefore = await this.getCurrentPageNumber();
      const paginationTextBefore = await this.paginationText.textContent().catch(() => '');
      await nextBtn.click();
      await this.page.waitForFunction(({ oldText }) => { const paginationText = document.body.textContent || ''; return paginationText !== oldText; }, { oldText: paginationTextBefore }, { timeout: 10000 }).catch(() => { console.log(`⚠️ Wait for page change timed out`); });
      await this.waitForTableLoad();
      const currentPageAfter = await this.getCurrentPageNumber();
      const pageChanged = currentPageAfter > currentPageBefore;
      return pageChanged;
    } catch (error) {
      console.error(`❌ Error clicking next:`, error);
      return false;
    }
  }

  async verifyInventoryPagination(): Promise<boolean> {
    console.log(`\n${'='.repeat(80)}`);
    console.log(`🧪 STARTING INVENTORY PAGINATION TESTS (FULL TRAVERSAL)`);
    console.log(`${'='.repeat(80)}`);
    try {
      const options = await this.showCountDropdown.locator('option').allTextContents();
      console.log(`\n📌 AVAILABLE PAGE SIZES:\n${options.join(', ')}\n`);
      let allTestsPassed = true;
      const testResults: any[] = [];
      for (const option of options) {
        const pageSize = option.trim();
        console.log(`\n\n${'='.repeat(80)}\n🔍 TESTING PAGE SIZE: ${pageSize} RECORDS PER PAGE (FULL TRAVERSAL)\n${'='.repeat(80)}\n`);
        try {
          await this.showCountDropdown.selectOption({ label: pageSize });
          console.log(`✅ Selected page size: ${pageSize}`);
          await this.waitForTableLoad();
          await this.goToFirstPage();
          const totalRecords = await this.getTotalFromUI();
          const pageSizeNum = parseInt(pageSize.replace(/\D/g, ''));
          const expectedPages = Math.ceil(totalRecords / pageSizeNum);
          console.log(`📊 Total Records: ${totalRecords}`);
          console.log(`📏 Page Size: ${pageSizeNum}`);
          console.log(`📄 Expected Pages: ${expectedPages}`);
          console.log(`\n🔄 Starting FULL PAGE TRAVERSAL through all ${expectedPages} pages...\n`);
          const startTime = Date.now();
          let currentPage = 1;
          let totalRecordsCounted = 0;
          let navigationSuccess = true;
          const firstPageRecords = await this.rows.count();
          totalRecordsCounted += firstPageRecords;
          console.log(`📄 Page 1: ${firstPageRecords} records | Total: ${totalRecordsCounted}/${totalRecords} (${((totalRecordsCounted / totalRecords) * 100).toFixed(1)}%)`);
          while (currentPage < expectedPages) {
            console.log(`➡️ Navigating from page ${currentPage} to ${currentPage + 1}...`);
            const clickSuccess = await this.clickNextPage();
            if (!clickSuccess) {
              console.log(`❌ Failed to navigate to page ${currentPage + 1}`);
              navigationSuccess = false;
              break;
            }
            currentPage++;
            const pageRecords = await this.rows.count();
            totalRecordsCounted += pageRecords;
            console.log(`📄 Page ${currentPage}: ${pageRecords} records | Total: ${totalRecordsCounted}/${totalRecords} (${((totalRecordsCounted / totalRecords) * 100).toFixed(1)}%)`);
            if (currentPage % 50 === 0) {
              const elapsedTime = ((Date.now() - startTime) / 1000).toFixed(1);
              console.log(`\n📊 PROGRESS UPDATE: ${currentPage}/${expectedPages} pages (${((currentPage / expectedPages) * 100).toFixed(1)}%) | Time elapsed: ${elapsedTime}s\n`);
            }
          }
          const endTime = Date.now();
          const duration = ((endTime - startTime) / 1000).toFixed(2);
          const totalMatch = totalRecordsCounted === totalRecords;
          const pagesMatch = currentPage === expectedPages;
          console.log(`\n${'='.repeat(80)}`);
          console.log(`📊 TEST COMPLETE FOR PAGE SIZE: ${pageSize}`);
          console.log(`${'='.repeat(80)}`);
          console.log(`📄 Pages Traversed: ${currentPage}/${expectedPages}`);
          console.log(`📊 Records Counted: ${totalRecordsCounted}/${totalRecords}`);
          console.log(`✅ Pages Match: ${pagesMatch ? 'YES' : 'NO'}`);
          console.log(`✅ Records Match: ${totalMatch ? 'YES' : 'NO'}`);
          console.log(`⏱️  Total Duration: ${duration} seconds`);
          console.log(`📊 Average Page Load: ${(parseFloat(duration) / currentPage).toFixed(2)} seconds/page`);
          console.log(`${'='.repeat(80)}`);
          await this.goToFirstPage();
          const backToFirstPage = await this.getCurrentPageNumber() === 1;
          const pageTestResult = navigationSuccess && totalMatch && pagesMatch && backToFirstPage;
          Reporter.validatePageNavigation(1, 2, navigationSuccess, this.testInfo);
          Reporter.validatePagination(1, expectedPages, pageSizeNum, totalRecords, this.testInfo);
          testResults.push({ pageSize, expectedPages, actualPages: currentPage, expectedRecords: totalRecords, actualRecords: totalRecordsCounted, duration, passed: pageTestResult });
          console.log(`\n${'─'.repeat(80)}\n📋 PAGE SIZE           : ${pageSize}\n📊 EXPECTED RECORDS    : ${totalRecords}\n📊 ACTUAL RECORDS      : ${totalRecordsCounted}\n📄 EXPECTED PAGES      : ${expectedPages}\n📄 ACTUAL PAGES        : ${currentPage}\n✅ RECORDS MATCH       : ${totalMatch ? 'YES ✅' : 'NO ❌'}\n✅ PAGES MATCH         : ${pagesMatch ? 'YES ✅' : 'NO ❌'}\n🔀 NAVIGATION          : ${navigationSuccess ? 'Working ✅' : 'Failed ❌'}\n🔙 BACK TO PAGE 1      : ${backToFirstPage ? 'Working ✅' : 'Failed ❌'}\n⏱️  DURATION           : ${duration} seconds\n🎯 FINAL STATUS        : ${pageTestResult ? 'PASS ✅' : 'FAIL ❌'}\n${'─'.repeat(80)}\n`);
          if (!pageTestResult) {
            allTestsPassed = false;
            console.log(`⚠️ Stopping further tests due to failure with page size ${pageSize}`);
            break;
          }
        } catch (error) {
          console.error(`❌ Error testing page size ${pageSize}:`, error);
          allTestsPassed = false;
          break;
        }
      }
      console.log(`\n\n${'='.repeat(80)}`);
      console.log(`📊 TEST EXECUTION SUMMARY`);
      console.log(`${'='.repeat(80)}`);
      for (const result of testResults) {
        console.log(`${result.pageSize.padEnd(15)}: ${result.passed ? '✅ PASS' : '❌ FAIL'} | Pages: ${result.actualPages}/${result.expectedPages} | Records: ${result.actualRecords}/${result.expectedRecords} | Time: ${result.duration}s`);
      }
      console.log(`\n${'='.repeat(80)}`);
      console.log(`✅ INVENTORY PAGINATION VALIDATION COMPLETED`);
      console.log(`${'='.repeat(80)}`);
      console.log(`Overall Status: ${allTestsPassed ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED'}`);
      console.log(`${'='.repeat(80)}`);
      return allTestsPassed;
    } catch (error) {
      console.error(`❌ Error in verifyInventoryPagination:`, error);
      return false;
    }
  }

  async verifyFirstAndLastPageNavigation(): Promise<{ firstPageNavWorking: boolean; lastPageNavWorking: boolean }> {
    console.log(`\n📄 Testing First and Last Page Navigation`);
    let firstPageNavWorking = false;
    let lastPageNavWorking = false;
    try {
      const expectedTotal = await this.getTotalFromUI();
      const pageSize = await this.getCurrentPageSize();
      const totalPages = Math.ceil(expectedTotal / pageSize);
      console.log(`📄 Total pages: ${totalPages}`);
      if (totalPages > 1) {
        console.log(`📍 Navigating to last page (${totalPages})...`);
        await this.goToFirstPage();
        let currentPage = 1;
        while (currentPage < totalPages) {
          const success = await this.clickNextPage();
          if (!success) {
            console.log(`⚠️ Could not reach page ${totalPages}, stopped at ${currentPage}`);
            break;
          }
          currentPage++;
        }
        lastPageNavWorking = currentPage === totalPages;
        console.log(`Last page navigation: ${lastPageNavWorking ? '✅' : '❌'} (Reached page ${currentPage})`);
        console.log(`📍 Navigating back to first page...`);
        await this.goToFirstPage();
        const backToFirst = await this.getCurrentPageNumber() === 1;
        firstPageNavWorking = backToFirst;
        console.log(`First page navigation: ${firstPageNavWorking ? '✅' : '❌'}`);
      } else {
        console.log(`⚠️ Only 1 page available, skipping first/last tests`);
        firstPageNavWorking = true;
        lastPageNavWorking = true;
      }
    } catch (error) {
      console.error(`❌ Error:`, error);
    }
    return { firstPageNavWorking, lastPageNavWorking };
  }
}