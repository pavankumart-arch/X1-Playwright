import { Page } from '@playwright/test';

export class PaginationUtil {

  page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Search for text across multiple pages with pagination
   * Uses URL change detection for reliable page navigation
   */
  async searchAcrossPages(
    rowSelector: string,
    cellIndex: number,
    searchText: string,
    maxPages: number = 50,
    nextButtonSelector: string = 'button:has-text("Next ›")'
  ): Promise<string | null> {

    let pageNum = 1;

    while (pageNum <= maxPages) {
      console.log(`\n📄 Page ${pageNum}`);

      try {
        // Search in current page
        const result = await this.searchInCurrentPage(
          rowSelector,
          cellIndex,
          searchText
        );

        if (result) {
          console.log(`✅ Found on page ${pageNum}: "${result}"`);
          return result;
        }

        console.log(`❌ Not found on page ${pageNum}`);

        // Try to click next button
        const nextBtn = this.page.locator(nextButtonSelector).last();

        if (!(await nextBtn.isVisible())) {
          console.log('🛑 Next button not visible');
          break;
        }

        const disabled = await nextBtn.getAttribute('disabled');

        if (disabled !== null) {
          console.log('🛑 Next button is disabled');
          break;
        }

        // Get current URL and click
        const currentUrl = this.page.url();
        console.log('🖱️ Clicking Next button...');

        await nextBtn.click();

        // Wait for URL to change
        try {
          console.log('⏳ Waiting for page navigation...');
          await this.page.waitForFunction(
            (url) => window.location.href !== url,
            currentUrl,
            { timeout: 5000 }
          );
          console.log('✅ Navigation detected');
        } catch (error) {
          console.log('⚠️ URL did not change, waiting for network idle...');
          await this.page.waitForLoadState('networkidle');
        }

        await this.page.waitForTimeout(800);
        pageNum++;

      } catch (error) {
        console.log(`❌ Error on page ${pageNum}:`, error);
        break;
      }
    }

    console.log(`\n❌ Search text not found across ${pageNum} pages`);
    return null;
  }

  /**
   * Search for text in current page only
   */
  private async searchInCurrentPage(
    rowSelector: string,
    cellIndex: number,
    searchText: string
  ): Promise<string | null> {
    try {
      const rows = this.page.locator(rowSelector);
      const count = await rows.count();

      console.log(`📋 Checking ${count} rows...`);

      for (let i = 0; i < count; i++) {
        const text = (await rows
          .nth(i)
          .locator('td')
          .nth(cellIndex)
          .textContent())?.trim();

        if (text && text.includes(searchText)) {
          return text;
        }
      }

      return null;
    } catch (error) {
      console.log('⚠️ Error searching in current page:', error);
      return null;
    }
  }
}