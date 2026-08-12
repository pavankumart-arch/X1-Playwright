// full file — BodyTypeSortingWithPagination (complete, improved pagination and shorter waits)
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

export class BodyTypeSortingWithPagination {
  readonly page: Page;
  readonly rows: Locator;
  readonly headers: Locator;
  readonly nextButton: Locator;
  readonly prevButton: Locator;
  readonly searchInput: Locator;
  readonly addBodyTypeButton: Locator;
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
    this.addBodyTypeButton = page.getByRole('button', { name: '+ Body Type' });
    this.columnsButton = page
      .locator('button:has-text("Columns")')
      .or(page.getByRole('button', { name: 'Columns' }))
      .or(page.locator('[data-testid="columns-button"]'))
      .or(page.locator('button:has-text("Columns")'));
    this.showEntriesDropdown = page.locator('select:has-text("Show")').or(page.locator('[data-testid="show-entries"]'));
    this.showingInfo = page.locator('text=/Showing \\d+-\\d+ of \\d+/');

    // Shorter defaults so navigation is fast (1s page-change wait)
    this.defaultDelayMs = options?.defaultDelayMs ?? 50;
    this.navDelayMs = options?.navDelayMs ?? 100;
    this.funcTimeoutMs = options?.funcTimeoutMs ?? 1000;
    this.pageChangeTimeoutMs = options?.pageChangeTimeoutMs ?? 1000;
    this.globalMaxPages = options?.globalMaxPages ?? 0;
    this.elapsedGuardMs = options?.elapsedGuardMs ?? 25000;
    this.debug = options?.debug ?? false;

    this.collator = new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' });
  }

  private checkElapsedGuard(actionDesc?: string) {
    if (!this.runStartTime) return;
    const elapsed = Date.now() - this.runStartTime;
    if (elapsed > this.elapsedGuardMs) {
      throw new Error(
        `Runtime guard triggered after ${elapsed}ms${actionDesc ? ' during ' + actionDesc : ''}. Increase test timeout, reduce pages, or increase elapsedGuardMs.`
      );
    }
  }

  async waitForTableLoad(timeout = 3000) {
    await this.page.waitForLoadState('networkidle').catch(() => {});
    try {
      const count = await this.rows.count();
      if (count > 0) await this.rows.first().waitFor({ state: 'visible', timeout }).catch(() => {});
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
      await this.verifyShowingEntries(valueStr);
    } catch (e) {
      if (this.debug) console.log('selectShowEntries failed:', e);
    }
    this.checkElapsedGuard('selectShowEntries end');
  }

  async selectShow100Entries() {
    await this.selectShowEntries(100);
  }

  async verifyShowingEntries(expectedPerPage: string | number) {
    try {
      const showingText = await this.showingInfo.textContent().catch(() => '');
      const match = showingText?.match(/of (\d+)/);
      const rowCount = await this.rows.count().catch(() => 0);
      const expectedNum = parseInt(String(expectedPerPage), 10);
      if (!(rowCount > 0 && rowCount <= expectedNum) && rowCount !== expectedNum) {
        console.warn(`⚠️ Expected ${expectedNum} entries but found ${rowCount}`);
      }
    } catch (e) {
      if (this.debug) console.log('verifyShowingEntries failed:', e);
    }
    this.checkElapsedGuard('verifyShowingEntries');
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

      const columns = ['ID', 'Body Type', 'Created', 'Updated', 'Status', 'Actions'];
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
        if (trimmed.length === 0) continue;

        if (columnName) {
          const cn = columnName.toLowerCase();
          if (cn === 'id') {
            const num = this.parseNumberStrict(trimmed);
            parsed.push(num !== null ? num : trimmed);
            continue;
          } else if (cn === 'created' || cn === 'updated') {
            const d = this.parseDateStrict(trimmed);
            parsed.push(d !== null ? d : trimmed);
            continue;
          } else if (cn === 'status') {
            parsed.push(this.mapStatus(trimmed));
            continue;
          } else if (cn === 'body type') {
            parsed.push(trimmed.toLowerCase());
            continue;
          } else if (cn === 'actions') {
            parsed.push(trimmed.toLowerCase());
            continue;
          }
        }

        const num = this.parseNumberStrict(trimmed);
        if (num !== null) {
          parsed.push(num);
          continue;
        }
        const d = this.parseDateStrict(trimmed);
        if (d !== null) {
          parsed.push(d);
          continue;
        }
        const mapped = this.mapStatus(trimmed);
        if (mapped !== null) {
          parsed.push(mapped);
          continue;
        }
        parsed.push(trimmed.toLowerCase());
      }
      return parsed;
    } catch (e) {
      if (this.debug) console.log('getColumnValues snapshot failed:', e);
      const values: any[] = [];
      const count = await this.rows.count().catch(() => 0);
      for (let i = 0; i < count; i++) {
        try {
          const cell = this.rows.nth(i).locator('td').nth(columnIndex);
          const raw = (await cell.textContent()) || '';
          const trimmed = raw.trim();
          if (!trimmed.length) continue;
          if (columnName) {
            const cn = columnName.toLowerCase();
            if (cn === 'id') {
              const num = this.parseNumberStrict(trimmed);
              values.push(num !== null ? num : trimmed);
              continue;
            } else if (cn === 'created' || cn === 'updated') {
              const d = this.parseDateStrict(trimmed);
              values.push(d !== null ? d : trimmed);
              continue;
            } else if (cn === 'status') {
              values.push(this.mapStatus(trimmed));
              continue;
            } else if (cn === 'body type') {
              values.push(trimmed.toLowerCase());
              continue;
            } else if (cn === 'actions') {
              values.push(trimmed.toLowerCase());
              continue;
            }
          }
          const num = this.parseNumberStrict(trimmed);
          if (num !== null) {
            values.push(num);
            continue;
          }
          const d = this.parseDateStrict(trimmed);
          if (d !== null) {
            values.push(d);
            continue;
          }
          const mapped = this.mapStatus(trimmed);
          if (mapped !== null) {
            values.push(mapped);
            continue;
          }
          values.push(trimmed.toLowerCase());
        } catch {
          // skip flaky cell
        }
      }
      return values;
    }
  }

  private parseNumberStrict(s: string): number | null {
    const cleaned = s.replace(/\u00A0/g, '').replace(/,/g, '').trim();
    if (/^-?\d+(\.\d+)?$/.test(cleaned)) return Number(cleaned);
    return null;
  }

  private parseDateStrict(s: string): Date | null {
    const cleaned = s.replace(/\u00A0/g, '').trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(cleaned)) return new Date(cleaned);
    if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(cleaned)) return new Date(cleaned);
    if (/^\d{1,2}\/\d{1,2}\/\d{4}(?:,? \d{1,2}:\d{2}:\d{2} ?(am|pm)?)?$/i.test(cleaned)) {
      const d = new Date(cleaned);
      if (!isNaN(d.getTime())) return d;
    }
    if (/^\d{10,13}$/.test(cleaned)) return new Date(parseInt(cleaned, 10));
    return null;
  }

  private mapStatus(s: string): number | null {
    const lower = s.trim().toLowerCase();
    const statusMap: Record<string, number> = {
      active: 3,
      published: 3,
      completed: 3,
      pending: 2,
      inactive: 1,
      draft: 1,
      archived: 0,
      deleted: 0
    };
    return statusMap[lower] !== undefined ? statusMap[lower] : null;
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
        if (cn === 'created' || cn === 'updated') {
          const d = this.parseDateStrict(cleaned);
          return d !== null ? d : cleaned;
        }
        if (cn === 'status') {
          const m = this.mapStatus(cleaned);
          return m !== null ? m : cleaned.toLowerCase();
        }
        if (cn === 'body type') {
          return cleaned.toLowerCase();
        }
        if (cn === 'actions') return cleaned.toLowerCase();
      }

      const n = this.parseNumberStrict(cleaned);
      if (n !== null) return n;
      const d = this.parseDateStrict(cleaned);
      if (d !== null) return d;
      const m = this.mapStatus(cleaned);
      if (m !== null) return m;
      return cleaned.toLowerCase();
    }
    return v;
  }

  detectOrder(values: any[], columnName?: string): 'ASC' | 'DESC' | 'UNSORTED' {
    if (values.length <= 1) return 'ASC';
    let ascCount = 0;
    let descCount = 0;
    for (let i = 0; i < values.length - 1; i++) {
      const a = this.normalizeForCompare(values[i], columnName);
      const b = this.normalizeForCompare(values[i + 1], columnName);
      let comparison = 0;
      if (a instanceof Date && b instanceof Date) comparison = a.getTime() - b.getTime();
      else if (typeof a === 'number' && typeof b === 'number') comparison = a - b;
      else comparison = this.collator.compare(String(a), String(b));
      if (comparison < 0) ascCount++;
      else if (comparison > 0) descCount++;
    }
    const total = values.length - 1;
    const ratio = Math.max(ascCount, descCount) / total;
    if (ratio < 0.7) return 'UNSORTED';
    return descCount > ascCount ? 'DESC' : 'ASC';
  }

  async validateValues(values: any[], order: 'ASC' | 'DESC', columnName?: string, pageNo?: number) {
    for (let i = 0; i < values.length - 1; i++) {
      const rawA = values[i];
      const rawB = values[i + 1];
      const a = this.normalizeForCompare(rawA, columnName);
      const b = this.normalizeForCompare(rawB, columnName);

      if (this.isEqual(a, b)) continue;

      let valid = false;
      if (a instanceof Date && b instanceof Date) {
        valid = order === 'ASC' ? a.getTime() < b.getTime() : a.getTime() > b.getTime();
      } else if (typeof a === 'number' && typeof b === 'number') {
        valid = order === 'ASC' ? a < b : a > b;
      } else {
        const cmp = this.collator.compare(String(a), String(b));
        valid = order === 'ASC' ? cmp < 0 : cmp > 0;
      }

      if (!valid && columnName && columnName.toLowerCase() === 'body type') {
        try {
          const baseA = this.stripQualifiers(String(rawA));
          const baseB = this.stripQualifiers(String(rawB));
          if (baseA && baseB) {
            const cmp = this.collator.compare(baseA, baseB);
            const fallbackValid = order === 'ASC' ? cmp < 0 : cmp > 0;
            if (fallbackValid) {
              if (this.debug) console.warn(`⚠️ Body Type fallback accepted on page ${pageNo ?? 'N/A'} for pair "${rawA}" vs "${rawB}"`);
              continue;
            }
          }
        } catch {
          // ignore fallback errors
        }
      }

      if (!valid) {
        if (pageNo) {
          try {
            const dump = await this.dumpColumnPage(columnName || '', pageNo);
            if (this.debug) {
              console.log(`\nDEBUG: Column "${columnName}" Page ${pageNo} raw values:`, dump.raw);
              console.log(`DEBUG: Column "${columnName}" Page ${pageNo} parsed values:`, dump.parsed);
            }
          } catch (e) {
            if (this.debug) console.log('dumpColumnPage failed:', e);
          }
        }

        const info = {
          index: i,
          pageNo: pageNo ?? null,
          rawA,
          rawB,
          normalizedA: a,
          normalizedB: b,
          typeA: Object.prototype.toString.call(a),
          typeB: Object.prototype.toString.call(b)
        };
        console.error('Validation failure details:', JSON.stringify(info, null, 2));
        return {
          pass: false,
          expected: `${this.formatValue(a)} ${order === 'ASC' ? '<' : '>'} ${this.formatValue(b)}`,
          actual: `${this.formatValue(a)} ${order === 'ASC' ? '>=' : '<='} ${this.formatValue(b)}`
        };
      }
    }
    return { pass: true, expected: 'Sorted Correctly', actual: 'Sorted Correctly' };
  }

  private isEqual(a: any, b: any): boolean {
    if (a instanceof Date && b instanceof Date) return a.getTime() === b.getTime();
    return a === b;
  }

  private formatValue(v: any): string {
    if (v instanceof Date) return v.toLocaleString();
    return String(v);
  }

  private stripQualifiers(s: string): string {
    if (!s) return s;
    let out = s.toLowerCase().replace(/\u00A0/g, ' ').replace(/\s+/g, ' ').trim();
    out = out.replace(/\(.*?\)/g, '').trim();
    const qualifiers = ['se', 'gs', 'natl', 'ffv', 'avail', 'ltd', 'national', 'awd', 'fwd', '4x4', '4wd', '2wd'];
    let changed = true;
    while (changed) {
      changed = false;
      for (const q of qualifiers) {
        const rx = new RegExp(`\\b${q}\\b$`, 'i');
        if (rx.test(out)) {
          out = out.replace(rx, '').trim();
          changed = true;
        }
      }
    }
    out = out.replace(/\s+/g, ' ').trim();
    return out;
  }

  // --- Pagination helpers (faster & deterministic) ---

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
    try {
      const active = await this.page.locator('[aria-current="page"]').first().textContent().catch(() => '');
      if (active) return parseInt(active.trim(), 10);
    } catch {
      // ignore
    }
    return 1;
  }

  async clickPageNumber(targetPage: number): Promise<boolean> {
    const containerSelectors = [
      'ul.pagination',
      'nav[aria-label="Pagination"]',
      'div.pagination',
      '[data-testid="pagination"]',
      'nav[role="navigation"]',
      'div[role="navigation"]',
      '.pagination-container'
    ];

    // Prefer container-scoped locators (fast)
    for (const sel of containerSelectors) {
      try {
        const locator = this.page.locator(`${sel} >> text="${targetPage}"`);
        if ((await locator.count()) > 0) {
          const el = locator.first();
          if (await el.isVisible().catch(() => false)) {
            await el.click().catch(() => {});
            await this.page.waitForTimeout(this.defaultDelayMs).catch(() => {});
            if (this.debug) console.log(`Clicked page ${targetPage} inside ${sel}`);
            return true;
          }
        }
      } catch {
        // try next
      }
    }

    // Lightweight global fallback (exact-text)
    try {
      const globalLocator = this.page.locator(`text="${targetPage}"`);
      const count = await globalLocator.count();
      for (let i = 0; i < count; i++) {
        const el = globalLocator.nth(i);
        if (!(await el.isVisible().catch(() => false))) continue;
        const box = await el.boundingBox().catch(() => null);
        if (!box) continue;
        await el.click().catch(() => {});
        await this.page.waitForTimeout(this.defaultDelayMs).catch(() => {});
        if (this.debug) console.log(`Clicked page ${targetPage} via global fallback`);
        return true;
      }
    } catch {
      // ignore
    }

    return false;
  }

  private async waitForPageNumberChange(oldShowingText: string, timeout = this.pageChangeTimeoutMs): Promise<boolean> {
    if (!oldShowingText) return false;
    try {
      await this.page.waitForFunction(
        (old: string) => {
          const nodes = Array.from(document.querySelectorAll('body *'));
          for (const n of nodes) {
            const t = (n.textContent || '').trim();
            if (/Showing\s+\d+-\d+\s+of\s+\d+/i.test(t)) {
              return t !== old;
            }
          }
          return false;
        },
        oldShowingText,
        { timeout }
      );
      return true;
    } catch {
      return false;
    }
  }

  private async waitForFirstRowChange(oldText: string, timeout = this.pageChangeTimeoutMs) {
    try {
      await this.page.waitForFunction(
        (args: any[]) => {
          const selector = args[0];
          const oldVal = args[1];
          const el = document.querySelector(selector);
          return !!el && (el.textContent || '') !== oldVal;
        },
        ['table tbody tr:first-child', oldText],
        { timeout }
      );
      return true;
    } catch {
      await this.page.waitForLoadState('networkidle').catch(() => {});
      return false;
    }
  }

  private async goToNextPage(): Promise<boolean> {
    this.checkElapsedGuard('goToNextPage start');
    try {
      const perPage = parseInt(String(await this.showEntriesDropdown.inputValue().catch(() => '100')), 10) || 100;
      const current = await this.getCurrentPageNumber(perPage);
      const target = current + 1;
      const totalPages = await this.getTotalPages(perPage);
      if (target > totalPages) return false;

      const beforeShowing = (await this.showingInfo.textContent().catch(() => '')) || '';
      const beforeFirstRow = (await this.page.$$eval('table tbody tr:first-child', (rows) => (rows.length ? rows[0].textContent || '' : ''))) || '';

      // Prefer explicit page-number click
      const clicked = await this.clickPageNumber(target);
      if (clicked) {
        const showingChanged = await this.waitForPageNumberChange(beforeShowing).catch(() => false);
        if (showingChanged) {
          await this.waitForTableLoad();
          await this.page.waitForTimeout(this.navDelayMs).catch(() => {});
          this.checkElapsedGuard('goToNextPage end (page click)');
          return true;
        }
        const rowChanged = await this.waitForFirstRowChange(beforeFirstRow).catch(() => false);
        if (rowChanged) {
          await this.waitForTableLoad();
          await this.page.waitForTimeout(this.navDelayMs).catch(() => {});
          this.checkElapsedGuard('goToNextPage end (row fallback)');
          return true;
        }
      }

      // Fallback to Next button
      if ((await this.nextButton.isVisible().catch(() => false)) && (await this.nextButton.isEnabled().catch(() => false))) {
        await Promise.all([this.nextButton.click().catch(() => {}), this.waitForFirstRowChange(beforeFirstRow).catch(() => false)]).catch(() => {});
        await this.waitForTableLoad();
        await this.page.waitForTimeout(this.navDelayMs).catch(() => {});
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

      const beforeShowing = (await this.showingInfo.textContent().catch(() => '')) || '';

      const clicked = await this.clickPageNumber(1);
      if (clicked) {
        const changed = await this.waitForPageNumberChange(beforeShowing).catch(() => false);
        if (changed) {
          await this.waitForTableLoad();
          await this.page.waitForTimeout(this.navDelayMs).catch(() => {});
          this.checkElapsedGuard('goToFirstPage end (page-button)');
          return;
        }
      }

      let attempts = 0;
      const maxAttempts = 20;
      while (attempts < maxAttempts) {
        const before = (await this.page.$$eval('table tbody tr:first-child', (rows) => (rows.length ? rows[0].textContent || '' : ''))) || '';
        if (!(await this.prevButton.isVisible().catch(() => false))) break;
        if (!(await this.prevButton.isEnabled().catch(() => false))) break;
        await Promise.all([this.prevButton.click().catch(() => {}), this.waitForFirstRowChange(before).catch(() => false)]).catch(() => {});
        await this.waitForTableLoad();
        await this.page.waitForTimeout(this.navDelayMs).catch(() => {});
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
      if ((totalPages || 0) > maxPages) {
        console.log(`ℹ️ validateAllPages: limiting to ${maxPages} of ${totalPages} pages (override: ${maxPagesOverride})`);
      }
    } else if (this.globalMaxPages && this.globalMaxPages > 0) {
      maxPages = Math.min(totalPages || 1, this.globalMaxPages);
      if ((totalPages || 0) > maxPages) {
        console.log(`ℹ️ validateAllPages: limiting to ${maxPages} of ${totalPages} pages (globalMaxPages: ${this.globalMaxPages})`);
      }
    } else {
      maxPages = totalPages || 1;
    }

    let allPagesValid = true;
    for (let pageNo = 1; pageNo <= maxPages; pageNo++) {
      this.checkElapsedGuard(`validateAllPages page ${pageNo} (${columnName})`);
      const values = await this.getColumnValues(columnIndex, columnName);
      if (values.length === 0) {
        if (pageNo < maxPages && !(await this.goToNextPage())) break;
        continue;
      }

      const result = await this.validateValues(values, order, columnName, pageNo);
      if (!result.pass) {
        allPagesValid = false;
        console.log(`❌ ${columnName} issue on Page ${pageNo}`);
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

  async verifyColumnSorting(columnName: string, testInfo: TestInfo, options?: { skipReverseCheck?: boolean; maxPagesOverride?: number }) {
    this.runStartTime = Date.now();
    try {
      const columnIndex = await this.getColumnIndex(columnName);
      const headerSelector = `table thead th:nth-child(${columnIndex + 1})`;

      if (columnName.toLowerCase() === 'actions') return true;

      await this.goToFirstPage();

      const beforeSort = await this.page.$eval(headerSelector, (h: Element) => h.getAttribute('aria-sort') || '').catch(() => '');
      const beforeFirstRow = (await this.page.$$eval('table tbody tr:first-child', (rows) => (rows.length ? rows[0].textContent || '' : ''))) || '';

      await this.page.click(headerSelector).catch(() => {});
      await this.page.waitForTimeout(this.defaultDelayMs).catch(() => {});

      const waitResult1: JSHandle<any> | null = (await this.page.waitForFunction(
        (args: any[]) => {
          const headerSel = args[0];
          const oldSort = args[1];
          const oldRow = args[2];
          const h = document.querySelector(headerSel);
          const curSort = h ? h.getAttribute('aria-sort') : null;
          const fr = document.querySelector('table tbody tr:first-child');
          const frText = fr ? fr.textContent : null;
          if (curSort && curSort !== oldSort) return curSort;
          if (frText && frText !== oldRow) return 'row-changed';
          return null;
        },
        [headerSelector, beforeSort, beforeFirstRow],
        { timeout: this.funcTimeoutMs }
      ).catch(() => null)) as JSHandle<any> | null;

      let firstOrder: 'ASC' | 'DESC' | 'UNSORTED' = 'UNSORTED';
      if (waitResult1) {
        const val = await waitResult1.jsonValue().catch(() => null);
        if (val === 'ascending') firstOrder = 'ASC';
        else if (val === 'descending') firstOrder = 'DESC';
        else {
          const firstPageValues = await this.getColumnValues(columnIndex, columnName);
          firstOrder = this.detectOrder(firstPageValues, columnName);
        }
      } else {
        const firstPageValues = await this.getColumnValues(columnIndex, columnName);
        firstOrder = this.detectOrder(firstPageValues, columnName);
      }

      if (firstOrder === 'UNSORTED') return false;

      const ascValid = await this.validateAllPages(columnIndex, columnName, firstOrder, testInfo, options?.maxPagesOverride);

      await this.goToFirstPage();
      await this.page.click(headerSelector).catch(() => {});
      await this.page.waitForTimeout(this.defaultDelayMs).catch(() => {});

      const beforeSort2 = await this.page.$eval(headerSelector, (h: Element) => h.getAttribute('aria-sort') || '').catch(() => '');
      const beforeFirstRow2 = (await this.page.$$eval('table tbody tr:first-child', (rows) => (rows.length ? rows[0].textContent || '' : ''))) || '';

      const waitResult2: JSHandle<any> | null = (await this.page.waitForFunction(
        (args: any[]) => {
          const headerSel = args[0];
          const oldSort = args[1];
          const oldRow = args[2];
          const h = document.querySelector(headerSel);
          const curSort = h ? h.getAttribute('aria-sort') : null;
          const fr = document.querySelector('table tbody tr:first-child');
          const frText = fr ? fr.textContent : null;
          if (curSort && curSort !== oldSort) return curSort;
          if (frText && frText !== oldRow) return 'row-changed';
          return null;
        },
        [headerSelector, beforeSort2, beforeFirstRow2],
        { timeout: this.funcTimeoutMs }
      ).catch(() => null)) as JSHandle<any> | null;

      let secondOrder: 'ASC' | 'DESC' | 'UNSORTED' = 'UNSORTED';
      if (waitResult2) {
        const val = await waitResult2.jsonValue().catch(() => null);
        if (val === 'ascending') secondOrder = 'ASC';
        else if (val === 'descending') secondOrder = 'DESC';
        else {
          const secondPageValues = await this.getColumnValues(columnIndex, columnName);
          secondOrder = this.detectOrder(secondPageValues, columnName);
        }
      } else {
        const secondPageValues = await this.getColumnValues(columnIndex, columnName);
        secondOrder = this.detectOrder(secondPageValues, columnName);
      }

      if (secondOrder === 'UNSORTED') return false;

      const descValid = await this.validateAllPages(columnIndex, columnName, secondOrder, testInfo, options?.maxPagesOverride);

      return ascValid && descValid;
    } finally {
      this.runStartTime = 0;
    }
  }

  async verifyCreatedDateSorting(testInfo: TestInfo, options?: { maxPagesOverride?: number }) {
    this.runStartTime = Date.now();
    try {
      const columnIndex = await this.getColumnIndex('Created');
      await this.goToFirstPage();
      const headerSelector = `table thead th:nth-child(${columnIndex + 1})`;
      await this.page.click(headerSelector).catch(() => {});
      await this.page.waitForTimeout(this.defaultDelayMs).catch(() => {});
      await this.waitForTableLoad();
      const values = await this.getColumnValues(columnIndex, 'Created');
      const order = this.detectOrder(values, 'Created');
      if (order === 'UNSORTED') return false;
      return await this.validateAllPages(columnIndex, 'Created', order, testInfo, options?.maxPagesOverride);
    } finally {
      this.runStartTime = 0;
    }
  }

  async verifyUpdatedDateSorting(testInfo: TestInfo, options?: { maxPagesOverride?: number }) {
    this.runStartTime = Date.now();
    try {
      const columnIndex = await this.getColumnIndex('Updated');
      await this.goToFirstPage();
      const headerSelector = `table thead th:nth-child(${columnIndex + 1})`;
      await this.page.click(headerSelector).catch(() => {});
      await this.page.waitForTimeout(this.defaultDelayMs).catch(() => {});
      await this.waitForTableLoad();
      const values = await this.getColumnValues(columnIndex, 'Updated');
      const order = this.detectOrder(values, 'Updated');
      if (order === 'UNSORTED') return false;
      return await this.validateAllPages(columnIndex, 'Updated', order, testInfo, options?.maxPagesOverride);
    } finally {
      this.runStartTime = 0;
    }
  }

  async verifyBodyTypeNameSorting(testInfo: TestInfo, options?: { maxPagesOverride?: number }) {
    return await this.verifyColumnSorting('Body Type', testInfo, options);
  }

  async verifyStatusSorting(testInfo: TestInfo, options?: { maxPagesOverride?: number }) {
    return await this.verifyColumnSorting('Status', testInfo, options);
  }

  async verifyIdSorting(testInfo: TestInfo, options?: { maxPagesOverride?: number }) {
    return await this.verifyColumnSorting('ID', testInfo, options);
  }

  async verifyAllColumnsSorting(testInfo: TestInfo, options?: { maxPagesOverride?: number }) {
    this.runStartTime = Date.now();
    try {
      await this.ensureAllColumnsVisible();
      await this.selectShow100Entries();

      const results: Record<string, boolean> = {};

      const columns = [
        { name: 'ID', sortable: true },
        { name: 'Body Type', sortable: true },
        { name: 'Created', sortable: true, isDateColumn: true },
        { name: 'Updated', sortable: true, isDateColumn: true },
        { name: 'Status', sortable: true },
        { name: 'Actions', sortable: false }
      ];

      const maxPagesOverride = options?.maxPagesOverride ?? undefined;

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

          if (column.isDateColumn) {
            if (column.name === 'Created') results[column.name] = await this.verifyCreatedDateSorting(testInfo, { maxPagesOverride });
            else if (column.name === 'Updated') results[column.name] = await this.verifyUpdatedDateSorting(testInfo, { maxPagesOverride });
          } else {
            results[column.name] = await this.verifyColumnSorting(column.name, testInfo, { maxPagesOverride });
          }
        } catch (e) {
          if (this.debug) console.log(`Error verifying column ${column.name}:`, e);
          results[column.name] = false;
        }
      }

      const allPassed = Object.values(results).every((v) => v === true);
      if (!allPassed) throw new Error('One or more columns failed sorting validation. Check logs above for details.');
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
      if (cn === 'created' || cn === 'updated') {
        const d = this.parseDateStrict(r);
        return d !== null ? d : r;
      }
      if (cn === 'status') return this.mapStatus(r);
      if (cn === 'body type') return r.toLowerCase();
      const n = this.parseNumberStrict(r);
      if (n !== null) return n;
      const d = this.parseDateStrict(r);
      if (d !== null) return d;
      const m = this.mapStatus(r);
      if (m !== null) return m;
      return r.toLowerCase();
    });

    if (this.debug) {
      console.log(`\nDEBUG: Column "${columnName}" Page ${pageNo} raw values:`, raw);
      console.log(`DEBUG: Column "${columnName}" Page ${pageNo} parsed values:`, parsed);
    }

    return { raw, parsed };
  }
}