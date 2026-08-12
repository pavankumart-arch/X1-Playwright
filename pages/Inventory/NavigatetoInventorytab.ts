import { Page, Locator } from '@playwright/test';
import { BasePage } from '../BasePage';
import { LeftsideNavigation } from '../Navigations/LeftSideNavigation';
import InventoryNavigation from '../../testdata/Inventory/InventoryNavigation.json';
import { Reporter } from '../utils/NewReport';

export class NavtoInventorytab extends BasePage {
  page: Page;
  searchInput: Locator;
  Reellerheading: Locator;

  constructor(page: Page) {
    super(page);
    this.page = page;
    this.searchInput = page.getByPlaceholder('Search...');
    this.Reellerheading = page.locator('[class="text-sm font-semibold text-foreground"]');
  }

  async navigateToInventoryTab(page: Page, testInfo: any) {
    const leftsideNavigation = new LeftsideNavigation(page);
    await leftsideNavigation.goToDashboard();
    await page.waitForLoadState('networkidle');
    await leftsideNavigation.goToResellers();
    await page.waitForLoadState('networkidle');
    await this.searchInput.waitFor({ state: 'visible', timeout: 5000 });
    await this.searchInput.clear();
    await this.searchInput.fill(InventoryNavigation.ReselleName);
    await this.searchInput.press('Enter');
    await page.waitForTimeout(2000);
    await page.getByText(InventoryNavigation.ReselleName, { exact: true }).first().click();
    console.log('Clicked Reseller:', InventoryNavigation.ReselleName);
    await page.waitForTimeout(2000);
    const rooftopSearchInput = page.getByPlaceholder('Search...');
    await rooftopSearchInput.waitFor({ state: 'visible', timeout: 5000 });
    await rooftopSearchInput.clear();
    await rooftopSearchInput.fill(InventoryNavigation.RooftopName);
    await rooftopSearchInput.press('Enter');
    await page.waitForTimeout(2000);
    const rooftopLink = page.getByText(InventoryNavigation.RooftopName, { exact: true }).first();
    await rooftopLink.waitFor({ state: 'visible', timeout: 10000 });
    await rooftopLink.click();
    console.log('Clicked Rooftop:', InventoryNavigation.RooftopName);
    console.log('Waiting for inventory table to load (will continue immediately when ready, max 60 seconds)...');
    const startTime = Date.now();
    try {
      await page.waitForTimeout(2000);
      await page.waitForFunction(() => {
        const headers = Array.from(document.querySelectorAll('table thead th'));
        const headerTexts = headers.map(th => th.textContent || '');
        return headerTexts.some(text => text.includes('Photos') || text.includes('VIN') || text.includes('Year') || text.includes('Make/Model') || text.includes('Added') || text.includes('Trim') || text.includes('Stock ID'));
      }, { timeout: 60000 });
      const loadTime = ((Date.now() - startTime) / 1000).toFixed(1);
      console.log(`✅ Inventory table detected after ${loadTime} seconds!`);
    } catch (error) {
      const elapsedTime = ((Date.now() - startTime) / 1000).toFixed(1);
      console.log(`⚠️ Inventory table not detected after ${elapsedTime} seconds`);
      try {
        const currentHeaders = await page.locator('table thead th').allTextContents();
        console.log('Current table headers:', currentHeaders.filter(h => h.trim()));
        if (await page.isClosed() === false) {
          await page.screenshot({ path: 'inventory-not-loaded.png' });
        }
      } catch (screenshotError) {
        console.log('Could not capture debug info:', screenshotError);
      }
      throw new Error(`Inventory table failed to load within 60 seconds`);
    }
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    const finalHeaders = await page.locator('table thead th').allTextContents();
    const normalizedHeaders = finalHeaders.filter(h => h.trim());
    console.log('✅ Inventory table successfully loaded with columns:', normalizedHeaders.slice(0, 8).join(', ') + (normalizedHeaders.length > 8 ? '...' : ''));
    console.log('Successfully navigated to inventory tab for rooftop:', InventoryNavigation.RooftopName);
    
Reporter.validateData(
    'Inventory Table Loaded',
    'Inventory Table Loaded',
    'Navigation to Inventory Tab',
    testInfo
);
  }
}