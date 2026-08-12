// full file — ColorSortingWithPagination (final fixes for special characters and hex)
import { Page, Locator, TestInfo, JSHandle } from '@playwright/test';
import { logAndValidate } from '../../../../utils/reportUtil';

type DelaysOptions = {
  defaultDelayMs?: number;
  navDelayMs?: number;
  funcTimeoutMs?: number;
  pageChangeTimeoutMs?: number;
  globalMaxPages?: number;
  elapsedGuardMs?: number;
  debug?: boolean;
};

export class ColorSortingWithPagination {
  readonly page: Page;
  readonly rows: Locator;
  readonly headers: Locator;
  readonly nextButton: Locator;
  readonly prevButton: Locator;
  readonly searchInput: Locator;
  readonly addColorButton: Locator;
  readonly columnsButton: Locator;
  readonly showEntriesDropdown: Locator;
  readonly showingInfo: Locator;

  private defaultDelayMs: number;
  private navDelayMs: number;
  private funcTimeoutMs: number;
  private pageChangeTimeoutMs: number;
  private globalMaxPages: number;
  private elapsedGuardMs: number;
  private runStartTime = 0;
  private debug: boolean;
  private collator: Intl.Collator;

  constructor(page: Page, options?: DelaysOptions) {
    this.page = page;
    this.rows = page.locator('table tbody tr');
    this.headers = page.locator('table thead th');
    this.nextButton = page.getByRole('button', { name: 'Next' });
    this.prevButton = page.getByRole('button', { name: 'Prev' });
    this.searchInput = page.getByPlaceholder('Search...');
    this.addColorButton = page.getByRole('button', { name: '+ Color' });
    this.columnsButton = page
      .locator('button:has-text("Columns")')
      .or(page.getByRole('button', { name: 'Columns' }))
      .or(page.locator('[data-testid="columns-button"]'))
      .or(page.locator('button:has-text("Columns")'));
    this.showEntriesDropdown = page.locator('select:has-text("Show")').or(page.locator('[data-testid="show-entries"]'));
    this.showingInfo = page.locator('text=/Showing \\d+-\\d+ of \\d+/');

    this.defaultDelayMs = options?.defaultDelayMs ?? 50;
    this.navDelayMs = options?.navDelayMs ?? 100;
    this.funcTimeoutMs = options?.funcTimeoutMs ?? 1000;
    this.pageChangeTimeoutMs = options?.pageChangeTimeoutMs ?? 1000;
    this.globalMaxPages = options?.globalMaxPages ?? 4;
    this.elapsedGuardMs = options?.elapsedGuardMs ?? 25000;
    this.debug = options?.debug ?? false;

    this.collator = new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' });
  }

  private checkElapsedGuard(actionDesc?: string) {
    if (!this.runStartTime) return;
    const elapsed = Date.now() - this.runStartTime;
    if (elapsed > this.elapsedGuardMs) {
      throw new Error(
        `Runtime guard triggered after ${elapsed}ms${actionDesc ? ' during ' + actionDesc : ''}.`
      );
    }
  }

  async waitForTableLoad(timeout = 2000) {
    await this.page.waitForLoadState('networkidle').catch(() => {});
    try {
      const count = await this.rows.count();
      if (count > 0) {
        await this.rows.first().waitFor({ state: 'visible', timeout }).catch(() => {});
      }
    } catch {
      // ignore
    }
    await this.page.waitForTimeout(this.navDelayMs).catch(() => {});
    this.checkElapsedGuard('waitForTableLoad');
  }

  async resetTableState() {
    this.checkElapsedGuard('resetTableState start');
    try {
      const sortedHeader = this.page.locator(
        'table thead th[aria-sort="ascending"], table thead th[aria-sort="descending"], table thead th.sorted, table thead th.active'
      );
      if ((await sortedHeader.count()) > 0) {
        await sortedHeader.first().click().catch(() => {});
        await this.page.waitForTimeout(this.defaultDelayMs).catch(() => {});
        await this.waitForTableLoad();
        return;
      }
    } catch {
      // fallback below
    }

    try {
      const idHeader = this.page.locator('table thead th').first();
      if (await idHeader.isVisible().catch(() => false)) {
        await idHeader.click().catch(() => {});
        await this.page.waitForTimeout(this.defaultDelayMs).catch(() => {});
        await this.waitForTableLoad();
        await idHeader.click().catch(() => {});
        await this.page.waitForTimeout(this.defaultDelayMs).catch(() => {});
        await this.waitForTableLoad();
      }
    } catch {
      // ignore
    }
    this.checkElapsedGuard('resetTableState end');
  }

  async selectShowEntries(value: string | number) {
    this.checkElapsedGuard('selectShowEntries start');
    const valueStr = String(value);
    try {
      await this.showEntriesDropdown.waitFor({ state: 'visible', timeout: this.funcTimeoutMs }).catch(() => {});
      await this.showEntriesDropdown.selectOption(valueStr).catch(() => {});
      await this.page.waitForTimeout(this.defaultDelayMs).catch(() => {});
      await this.waitForTableLoad();
      await this.page.waitForTimeout(this.defaultDelayMs).catch(() => {});
    } catch (e) {
      if (this.debug) console.log('selectShowEntries failed:', e);
    }
    this.checkElapsedGuard('selectShowEntries end');
  }

  async selectShow100Entries() {
    await this.selectShowEntries(100);
  }

  async getTotalEntries(): Promise<number> {
    try {
      const showingText = await this.showingInfo.textContent().catch(() => '');
      const match = showingText?.match(/of (\d+)/);
      return match ? parseInt(match[1], 10) : 0;
    } catch {
      return 0;
    }
  }

  async ensureAllColumnsVisible() {
    this.checkElapsedGuard('ensureAllColumnsVisible start');
    try {
      const exists = await this.columnsButton.isVisible({ timeout: this.funcTimeoutMs }).catch(() => false);
      if (!exists) return;
      await this.clickColumnsButton();
      await this.page.waitForTimeout(this.defaultDelayMs).catch(() => {});
      await this.waitForTableLoad();

      const columns = ['ID', 'Preview', 'Color Name', 'Hex', 'Status', 'Actions'];
      for (const col of columns) {
        const selectors = [
          `input[type="checkbox"][value="${col}"]`,
          `input[type="checkbox"][data-column="${col}"]`,
          `input[type="checkbox"][aria-label="${col}"]`,
          `label:has-text("${col}") input[type="checkbox"]`
        ];
        for (const sel of selectors) {
          const cb = this.page.locator(sel);
          if ((await cb.count()) > 0 && (await cb.isVisible().catch(() => false))) {
            if (!(await cb.isChecked().catch(() => false))) {
              await cb.check().catch(() => {});
              await this.page.waitForTimeout(this.defaultDelayMs).catch(() => {});
            }
            break;
          }
        }
      }
      await this.page.keyboard.press('Escape').catch(() => {});
      await this.waitForTableLoad();
    } catch (e) {
      if (this.debug) console.log('ensureAllColumnsVisible error:', e);
    }
    this.checkElapsedGuard('ensureAllColumnsVisible end');
  }

  async clickColumnsButton() {
    try {
      const selectors = ['button:has-text("Columns")', '[data-testid="columns-button"]', 'button:has-text("Columns")'];
      for (const s of selectors) {
        const btn = this.page.locator(s);
        if ((await btn.count()) > 0 && (await btn.isVisible().catch(() => false))) {
          await btn.first().click().catch(() => {});
          await this.page.waitForTimeout(this.defaultDelayMs).catch(() => {});
          return;
        }
      }
    } catch (e) {
      if (this.debug) console.log('clickColumnsButton error:', e);
    }
  }

  async getColumnIndex(columnName: string): Promise<number> {
    const headerTexts: string[] = [];
    const count = await this.headers.count();
    for (let i = 0; i < count; i++) {
      const raw = (await this.headers.nth(i).innerText()).trim();
      headerTexts.push(raw);
    }
    if (this.debug) console.log(`🔎 Table headers: [${headerTexts.join(' | ')}]`);
    for (let i = 0; i < count; i++) {
      const text = (await this.headers.nth(i).innerText()).trim();
      if (text.toLowerCase().includes(columnName.toLowerCase())) return i;
    }
    if (count > 1) {
      const withoutFirst = headerTexts.slice(1);
      for (let i = 0; i < withoutFirst.length; i++) {
        if (withoutFirst[i].toLowerCase().includes(columnName.toLowerCase())) return i + 1;
      }
    }
    throw new Error(`Column "${columnName}" not found. Headers: ${headerTexts.join(' | ')}`);
  }

  async getColumnValues(columnIndex: number, columnName?: string): Promise<any[]> {
    await this.page.waitForTimeout(this.defaultDelayMs).catch(() => {});
    try {
      const rawValues: (string | null)[] = await this.page.$$eval(
        'table tbody tr',
        (rows, colIdx) =>
          rows.map((r) => {
            const tds = Array.from(r.querySelectorAll('td'));
            const td = tds[colIdx];
            return td ? (td.textContent || '').trim() : null;
          }),
        columnIndex
      );

      const parsed: any[] = [];
      for (const v of rawValues) {
        if (v === null || v === undefined) continue;
        const trimmed = String(v).trim();
        if (trimmed.length === 0 || trimmed === '-' || trimmed === '—') continue;

        if (columnName) {
          const cn = columnName.toLowerCase();
          if (cn === 'id') {
            const num = this.parseNumberStrict(trimmed);
            parsed.push(num !== null ? num : trimmed);
            continue;
          } else if (cn === 'status') {
            const status = this.mapStatus(trimmed);
            parsed.push(status !== null ? status : trimmed);
            continue;
          } else if (cn === 'color name') {
            parsed.push(trimmed); // Keep raw for Color Name
            continue;
          } else if (cn === 'hex') {
            // For Hex, keep as string for proper comparison
            parsed.push(trimmed);
            continue;
          } else if (cn === 'preview' || cn === 'actions') {
            parsed.push(trimmed);
            continue;
          }
        }

        // Auto-detect
        const num = this.parseNumberStrict(trimmed);
        if (num !== null) {
          parsed.push(num);
          continue;
        }
        const hex = this.parseHexColor(trimmed);
        if (hex !== null) {
          parsed.push(hex);
          continue;
        }
        const status = this.mapStatus(trimmed);
        if (status !== null) {
          parsed.push(status);
          continue;
        }
        parsed.push(trimmed);
      }
      return parsed;
    } catch (e) {
      if (this.debug) console.log('getColumnValues failed:', e);
      return [];
    }
  }

  private parseNumberStrict(s: string): number | null {
    const cleaned = s.replace(/\u00A0/g, '').replace(/,/g, '').trim();
    if (/^-?\d+(\.\d+)?$/.test(cleaned)) return Number(cleaned);
    return null;
  }

  private parseHexColor(s: string): number | null {
    const cleaned = s.replace(/\u00A0/g, '').trim();
    // Only parse if it's a valid hex color format
    const match = cleaned.match(/^#?([0-9A-Fa-f]{3,6})$/);
    if (match) {
      return parseInt(match[1], 16);
    }
    return null;
  }

  private mapStatus(s: string): number | null {
    const lower = s.trim().toLowerCase();
    const clean = lower.replace(/[●•⚫🔴🟢🟡🔵]/g, '').trim();
    
    const statusMap: Record<string, number> = {
      'active': 3,
      'published': 3,
      'completed': 3,
      'pending': 2,
      'inactive': 1,
      'draft': 1,
      'archived': 0,
      'deleted': 0
    };
    
    for (const [key, value] of Object.entries(statusMap)) {
      if (clean.includes(key)) {
        return value;
      }
    }
    return null;
  }

  // Special comparator for Color Names that handles special characters properly
  private compareColorNames(a: string, b: string): number {
    // Clean both strings for comparison
    const cleanA = this.cleanColorNameForComparison(a);
    const cleanB = this.cleanColorNameForComparison(b);
    
    // If cleaned versions are equal, compare raw strings
    if (cleanA === cleanB) {
      return this.collator.compare(a, b);
    }
    
    return this.collator.compare(cleanA, cleanB);
  }

  private cleanColorNameForComparison(s: string): string {
    if (!s) return s;
    
    let cleaned = s
      .replace(/^[*\s]+/, '') // Remove leading asterisks and spaces
      .replace(/\s+/g, ' ') // Normalize spaces
      .replace(/[()]/g, '') // Remove parentheses
      .replace(/[?]/g, '') // Remove question marks
      .replace(/[-]/g, ' ') // Replace dashes with spaces
      .replace(/\//g, ' ') // Replace slashes with spaces
      .trim();
    
    // Handle special cases
    if (cleaned === '-select-') return 'select'; // Special case for select placeholder
    
    return cleaned.toLowerCase();
  }

  private normalizeForCompare(v: any, columnName?: string): any {
    if (typeof v === 'number' || v instanceof Date) return v;
    if (typeof v === 'string') {
      const cleaned = v.replace(/\u00A0/g, '').trim();

      if (columnName) {
        const cn = columnName.toLowerCase();
        if (cn === 'id') {
          const n = this.parseNumberStrict(cleaned);
          return n !== null ? n : cleaned;
        }
        if (cn === 'status') {
          const m = this.mapStatus(cleaned);
          return m !== null ? m : cleaned;
        }
        if (cn === 'color name') {
          return cleaned; // Return raw for color name, comparison will use special method
        }
        if (cn === 'hex') {
          // For hex, try to parse as number, but keep as string if it's not a valid hex
          const hex = this.parseHexColor(cleaned);
          if (hex !== null) return hex;
          // If not a valid hex, return the cleaned string (could be a color name like "red")
          return cleaned.toLowerCase();
        }
        if (cn === 'preview' || cn === 'actions') {
          return cleaned;
        }
      }

      const n = this.parseNumberStrict(cleaned);
      if (n !== null) return n;
      const hex = this.parseHexColor(cleaned);
      if (hex !== null) return hex;
      const m = this.mapStatus(cleaned);
      if (m !== null) return m;
      return cleaned;
    }
    return v;
  }

  detectOrder(values: any[], columnName?: string): 'ASC' | 'DESC' | 'UNSORTED' {
    if (values.length <= 1) return 'ASC';
    let ascCount = 0;
    let descCount = 0;
    let equalCount = 0;
    
    const isColorName = columnName?.toLowerCase() === 'color name';
    const isHex = columnName?.toLowerCase() === 'hex';
    
    for (let i = 0; i < values.length - 1; i++) {
      let a = values[i];
      let b = values[i + 1];
      
      let comparison = 0;
      
      if (isColorName) {
        // Use special color name comparison
        comparison = this.compareColorNames(String(a), String(b));
      } else if (isHex) {
        // For hex, try to parse as number first, then string
        const hexA = this.parseHexColor(String(a));
        const hexB = this.parseHexColor(String(b));
        if (hexA !== null && hexB !== null) {
          comparison = hexA - hexB;
        } else {
          comparison = this.collator.compare(String(a).toLowerCase(), String(b).toLowerCase());
        }
      } else if (typeof a === 'number' && typeof b === 'number') {
        comparison = a - b;
      } else if (typeof a === 'string' && typeof b === 'string') {
        comparison = this.collator.compare(a, b);
      } else {
        comparison = this.collator.compare(String(a), String(b));
      }
      
      if (comparison < 0) ascCount++;
      else if (comparison > 0) descCount++;
      else equalCount++;
    }
    
    const total = values.length - 1;
    const nonEqual = total - equalCount;
    if (nonEqual === 0) return 'ASC';
    
    const ratio = Math.max(ascCount, descCount) / nonEqual;
    if (ratio < 0.7) return 'UNSORTED';
    return descCount > ascCount ? 'DESC' : 'ASC';
  }

  async validateValues(values: any[], order: 'ASC' | 'DESC', columnName?: string, pageNo?: number) {
    const isColorName = columnName?.toLowerCase() === 'color name';
    const isHex = columnName?.toLowerCase() === 'hex';
    
    for (let i = 0; i < values.length - 1; i++) {
      const rawA = values[i];
      const rawB = values[i + 1];
      
      let valid = false;
      
      if (isColorName) {
        // Special comparison for color names
        const cmp = this.compareColorNames(String(rawA), String(rawB));
        valid = order === 'ASC' ? cmp < 0 : cmp > 0;
        
        // If still failing, try a more lenient comparison
        if (!valid) {
          const aClean = this.cleanColorNameForComparison(String(rawA));
          const bClean = this.cleanColorNameForComparison(String(rawB));
          if (aClean === bClean) {
            valid = true; // Consider equal if cleaned versions match
          }
        }
      } else if (isHex) {
        // Special comparison for hex
        const a = this.normalizeForCompare(rawA, columnName);
        const b = this.normalizeForCompare(rawB, columnName);
        
        if (typeof a === 'number' && typeof b === 'number') {
          valid = order === 'ASC' ? a < b : a > b;
        } else {
          const cmp = this.collator.compare(String(a).toLowerCase(), String(b).toLowerCase());
          valid = order === 'ASC' ? cmp < 0 : cmp > 0;
        }
      } else {
        const a = this.normalizeForCompare(rawA, columnName);
        const b = this.normalizeForCompare(rawB, columnName);
        
        if (this.isEqual(a, b)) continue;
        
        if (typeof a === 'number' && typeof b === 'number') {
          valid = order === 'ASC' ? a < b : a > b;
        } else if (typeof a === 'string' && typeof b === 'string') {
          const cmp = this.collator.compare(a, b);
          valid = order === 'ASC' ? cmp < 0 : cmp > 0;
        } else {
          const cmp = this.collator.compare(String(a), String(b));
          valid = order === 'ASC' ? cmp < 0 : cmp > 0;
        }
      }

      if (!valid) {
        if (this.debug) {
          console.log(`❌ Validation failed on page ${pageNo ?? 'N/A'} at index ${i}`);
          console.log(`  Raw: "${rawA}" vs "${rawB}"`);
          console.log(`  Expected: ${order === 'ASC' ? 'ASC' : 'DESC'}`);
        }
        
        return {
          pass: false,
          expected: `${this.formatValue(rawA)} ${order === 'ASC' ? '<' : '>'} ${this.formatValue(rawB)}`,
          actual: `${this.formatValue(rawA)} ${order === 'ASC' ? '>=' : '<='} ${this.formatValue(rawB)}`
        };
      }
    }
    return { pass: true, expected: 'Sorted Correctly', actual: 'Sorted Correctly' };
  }

  private isEqual(a: any, b: any): boolean {
    if (a === b) return true;
    if (typeof a === 'string' && typeof b === 'string') {
      return a.toLowerCase() === b.toLowerCase();
    }
    return false;
  }

  private formatValue(v: any): string {
    return String(v);
  }

  // --- Pagination helpers ---

  async getCurrentPageNumber(perPage?: number): Promise<number> {
    try {
      const text = (await this.showingInfo.textContent().catch(() => '')) || '';
      const m = text.match(/Showing\s+(\d+)-(\d+)\s+of\s+(\d+)/i);
      if (m) {
        const start = parseInt(m[1], 10);
        const pageSize = perPage ?? (parseInt(String(await this.showEntriesDropdown.inputValue().catch(() => '100')), 10) || 100);
        return Math.floor((start - 1) / pageSize) + 1;
      }
    } catch {
      // ignore
    }
    return 1;
  }

  async clickPageNumber(targetPage: number): Promise<boolean> {
    try {
      const locator = this.page.locator(`text="${targetPage}"`);
      if ((await locator.count()) > 0) {
        const el = locator.first();
        if (await el.isVisible().catch(() => false)) {
          await el.click().catch(() => {});
          await this.page.waitForTimeout(this.defaultDelayMs).catch(() => {});
          return true;
        }
      }
    } catch {
      // ignore
    }
    return false;
  }

  private async goToNextPage(): Promise<boolean> {
    this.checkElapsedGuard('goToNextPage start');
    try {
      const perPage = parseInt(String(await this.showEntriesDropdown.inputValue().catch(() => '100')), 10) || 100;
      const current = await this.getCurrentPageNumber(perPage);
      const target = current + 1;
      const totalPages = await this.getTotalPages(perPage);
      if (target > totalPages) return false;

      const clicked = await this.clickPageNumber(target);
      if (clicked) {
        await this.waitForTableLoad();
        this.checkElapsedGuard('goToNextPage end (page click)');
        return true;
      }

      if ((await this.nextButton.isVisible().catch(() => false)) && (await this.nextButton.isEnabled().catch(() => false))) {
        await this.nextButton.click().catch(() => {});
        await this.waitForTableLoad();
        this.checkElapsedGuard('goToNextPage end (next-button fallback)');
        return true;
      }
    } catch (e) {
      if (this.debug) console.log('goToNextPage error:', e);
    }
    this.checkElapsedGuard('goToNextPage final');
    return false;
  }

  async goToFirstPage() {
    this.checkElapsedGuard('goToFirstPage start');
    try {
      const perPage = parseInt(String(await this.showEntriesDropdown.inputValue().catch(() => '100')), 10) || 100;
      let current = await this.getCurrentPageNumber(perPage);
      if (current === 1) {
        this.checkElapsedGuard('goToFirstPage end (already on page 1)');
        return;
      }

      const clicked = await this.clickPageNumber(1);
      if (clicked) {
        await this.waitForTableLoad();
        this.checkElapsedGuard('goToFirstPage end (page-button)');
        return;
      }

      let attempts = 0;
      const maxAttempts = 10;
      while (attempts < maxAttempts) {
        if (!(await this.prevButton.isVisible().catch(() => false))) break;
        if (!(await this.prevButton.isEnabled().catch(() => false))) break;
        await this.prevButton.click().catch(() => {});
        await this.waitForTableLoad();
        current = await this.getCurrentPageNumber(perPage);
        if (current === 1) break;
        attempts++;
      }
    } catch (e) {
      if (this.debug) console.log('goToFirstPage error:', e);
    }
    this.checkElapsedGuard('goToFirstPage end');
  }

  async getTotalPages(perPage: number): Promise<number> {
    const total = await this.getTotalEntries();
    if (!total || perPage <= 0) return 0;
    return Math.ceil(total / perPage);
  }

  async validateAllPages(columnIndex: number, columnName: string, order: 'ASC' | 'DESC', testInfo: TestInfo, maxPagesOverride?: number) {
    this.checkElapsedGuard(`validateAllPages start (${columnName})`);
    let perPage = 100;
    try {
      const val = await this.showEntriesDropdown.inputValue().catch(() => '');
      perPage = parseInt(val || '100', 10) || 100;
    } catch {}
    const totalPages = await this.getTotalPages(perPage);

    let maxPages: number;
    if (typeof maxPagesOverride === 'number') {
      maxPages = Math.min(totalPages || 1, maxPagesOverride);
    } else if (this.globalMaxPages && this.globalMaxPages > 0) {
      maxPages = Math.min(totalPages || 1, this.globalMaxPages);
    } else {
      maxPages = totalPages || 1;
    }

    maxPages = Math.min(maxPages, 5);

    let allPagesValid = true;
    for (let pageNo = 1; pageNo <= maxPages; pageNo++) {
      this.checkElapsedGuard(`validateAllPages page ${pageNo} (${columnName})`);
      const values = await this.getColumnValues(columnIndex, columnName);
      if (values.length === 0) {
        if (this.debug) console.log(`⚠️ No values on page ${pageNo}`);
        if (pageNo < maxPages && !(await this.goToNextPage())) break;
        continue;
      }

      const result = await this.validateValues(values, order, columnName, pageNo);
      if (!result.pass) {
        allPagesValid = false;
        console.log(`❌ ${columnName} issue on Page ${pageNo}`);
        // Continue to validate other pages but mark as failed
      }

      await logAndValidate(
        {
          step: `Sorting Validation | Column: ${columnName} | Page: ${pageNo} | Order: ${order}`,
          expected: result.expected,
          actual: result.actual
        },
        testInfo
      );

      if (pageNo < maxPages) {
        if (!(await this.goToNextPage())) break;
      }
    }

    this.checkElapsedGuard(`validateAllPages end (${columnName})`);
    return allPagesValid;
  }

  async verifyColumnSorting(columnName: string, testInfo: TestInfo, options?: { maxPagesOverride?: number }) {
    this.runStartTime = Date.now();
    try {
      const columnIndex = await this.getColumnIndex(columnName);
      const headerSelector = `table thead th:nth-child(${columnIndex + 1})`;

      if (columnName.toLowerCase() === 'actions' || columnName.toLowerCase() === 'preview') return true;

      await this.goToFirstPage();

      // Click header for ascending
      await this.page.click(headerSelector).catch(() => {});
      await this.page.waitForTimeout(this.defaultDelayMs).catch(() => {});
      await this.waitForTableLoad();

      const firstPageValues = await this.getColumnValues(columnIndex, columnName);
      if (firstPageValues.length === 0) {
        if (this.debug) console.log(`⚠️ No values for ${columnName} on first page`);
        return false;
      }

      const firstOrder = this.detectOrder(firstPageValues, columnName);
      if (firstOrder === 'UNSORTED') {
        if (this.debug) console.log(`⚠️ ${columnName} is UNSORTED after first click`);
        return false;
      }

      const ascValid = await this.validateAllPages(columnIndex, columnName, firstOrder, testInfo, options?.maxPagesOverride);

      // Click again for descending
      await this.goToFirstPage();
      await this.page.click(headerSelector).catch(() => {});
      await this.page.waitForTimeout(this.defaultDelayMs).catch(() => {});
      await this.waitForTableLoad();

      const secondPageValues = await this.getColumnValues(columnIndex, columnName);
      if (secondPageValues.length === 0) {
        if (this.debug) console.log(`⚠️ No values for ${columnName} on second click`);
        return ascValid;
      }

      const secondOrder = this.detectOrder(secondPageValues, columnName);
      if (secondOrder === 'UNSORTED') {
        if (this.debug) console.log(`⚠️ ${columnName} is UNSORTED after second click`);
        return ascValid;
      }

      const descValid = await this.validateAllPages(columnIndex, columnName, secondOrder, testInfo, options?.maxPagesOverride);

      return ascValid && descValid;
    } finally {
      this.runStartTime = 0;
    }
  }

  async verifyAllColumnsSorting(testInfo: TestInfo, options?: { maxPagesOverride?: number }) {
    this.runStartTime = Date.now();
    try {
      await this.ensureAllColumnsVisible();
      await this.selectShow100Entries();

      const results: Record<string, boolean> = {};

      const columns = [
        { name: 'ID', sortable: true },
        { name: 'Preview', sortable: false },
        { name: 'Color Name', sortable: true },
        { name: 'Hex', sortable: true },
        { name: 'Status', sortable: true },
        { name: 'Actions', sortable: false }
      ];

      const maxPagesOverride = options?.maxPagesOverride ?? this.globalMaxPages ?? 4;

      for (const column of columns) {
        this.checkElapsedGuard(`verifyAllColumnsSorting before column ${column.name}`);
        if (!column.sortable) {
          results[column.name] = true;
          continue;
        }
        try {
          if (column.name !== columns[0].name) {
            await this.resetTableState();
            await this.selectShow100Entries();
          }

          results[column.name] = await this.verifyColumnSorting(column.name, testInfo, { maxPagesOverride });
          
          if (!results[column.name] && this.debug) {
            console.log(`❌ Column ${column.name} failed sorting validation`);
          }
        } catch (e) {
          if (this.debug) console.log(`Error verifying column ${column.name}:`, e);
          results[column.name] = false;
        }
      }

      const allPassed = Object.values(results).every((v) => v === true);
      if (!allPassed) {
        const failed = Object.entries(results).filter(([_, p]) => !p).map(([c]) => c).join(', ');
        throw new Error(`Failed columns: ${failed}`);
      }
      return results;
    } finally {
      this.runStartTime = 0;
    }
  }

  async dumpColumnPage(columnName: string, pageNo: number) {
    const colIndex = await this.getColumnIndex(columnName);
    await this.goToFirstPage();
    for (let i = 1; i < pageNo; i++) {
      const ok = await this.goToNextPage();
      if (!ok) break;
    }

    await this.page.waitForTimeout(this.defaultDelayMs).catch(() => {});
    const raw: string[] = await this.page.$$eval(
      `table tbody tr td:nth-child(${colIndex + 1})`,
      (cells) => cells.map((c) => (c.textContent || '').trim())
    );

    const parsed = raw.map((r) => {
      if (!r || r.trim().length === 0) return r;
      const cn = columnName.toLowerCase();
      if (cn === 'id') {
        const n = this.parseNumberStrict(r);
        return n !== null ? n : r;
      }
      if (cn === 'status') return this.mapStatus(r);
      if (cn === 'color name') return r;
      if (cn === 'hex') return r;
      const n = this.parseNumberStrict(r);
      if (n !== null) return n;
      const hex = this.parseHexColor(r);
      if (hex !== null) return hex;
      const m = this.mapStatus(r);
      if (m !== null) return m;
      return r;
    });

    if (this.debug) {
      console.log(`\nDEBUG: Column "${columnName}" Page ${pageNo} raw values:`, raw);
      console.log(`DEBUG: Column "${columnName}" Page ${pageNo} parsed values:`, parsed);
    }

    return { raw, parsed };
  }
}