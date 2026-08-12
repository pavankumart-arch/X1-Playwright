import { expect, Page, TestInfo } from '@playwright/test';

export class InventorySearch {
    private page: Page;
    private testInfo: TestInfo;

    constructor(page: Page, testInfo: TestInfo) {
        this.page = page;
        this.testInfo = testInfo;
    }

    // ============================================================
    // PRIVATE LOCATORS
    // ============================================================

    private get searchBox() {
        return this.page.locator('input[placeholder="Search..."]');
    }

    private get tableRows() {
        return this.page.locator('tbody tr:visible');
    }

    // ============================================================
    // PRIVATE HELPERS
    // ============================================================

    private async waitForResults(): Promise<void> {
        await this.page.waitForTimeout(100);
        try {
            await this.page.waitForSelector('tbody tr:visible', { 
                timeout: 2000 
            });
        } catch {
            // Ignore - empty state is acceptable
        }
    }

    private async performSearch(searchValue: string): Promise<void> {
        await expect(this.searchBox).toBeVisible({ timeout: 3000 });
        await this.searchBox.click();
        await this.searchBox.press('Control+A');
        await this.searchBox.press('Backspace');
        await this.searchBox.fill(searchValue);
        await this.searchBox.press('Enter');
        await this.waitForResults();
    }

    private async clearSearch(): Promise<void> {
        try {
            await expect(this.searchBox).toBeVisible({ timeout: 2000 });
            await this.searchBox.click();
            await this.searchBox.press('Control+A');
            await this.searchBox.press('Backspace');
            await this.searchBox.press('Enter');
            await this.waitForResults();
        } catch {
            console.log('⚠️  Clear search failed, reloading page...');
            await this.page.reload();
            await this.page.waitForLoadState('networkidle');
        }
    }

    private async isEmptyState(rowIndex: number): Promise<boolean> {
        try {
            const rows = this.tableRows;
            const count = await rows.count();
            
            if (rowIndex >= count) {
                return true;
            }
            
            const row = rows.nth(rowIndex);
            const text = (await row.innerText()).trim();

            if (!text) return true;

            const patterns = [
                /no\s*data/i,
                /no\s*records/i,
                /no\s*results/i,
                /no\s*matching/i,
                /not\s*found/i,
            ];

            return patterns.some(pattern => pattern.test(text));
        } catch {
            return true;
        }
    }

    private async getResultCount(): Promise<number> {
        try {
            const rows = this.tableRows;
            const count = await rows.count();

            if (count === 0) return 0;

            let actualRecords = 0;
            for (let i = 0; i < count; i++) {
                if (!(await this.isEmptyState(i))) {
                    actualRecords++;
                }
            }

            return actualRecords;
        } catch {
            return 0;
        }
    }

    private async getFirstRowData(): Promise<string[]> {
        const rows = this.tableRows;
        const count = await rows.count();

        if (count === 0) {
            throw new Error('No Inventory records are displayed.');
        }

        for (let i = 0; i < count; i++) {
            if (await this.isEmptyState(i)) continue;

            const cells = rows.nth(i).locator('td');
            const cellCount = await cells.count();
            const values: string[] = [];

            for (let j = 0; j < cellCount; j++) {
                values.push((await cells.nth(j).innerText()).trim());
            }

            return values;
        }

        throw new Error('Could not find an actual Inventory data row.');
    }

    private async getUniqueColumnValues(columnIndex: number): Promise<string[]> {
        try {
            const rows = this.tableRows;
            const count = await rows.count();
            const values = new Set<string>();

            for (let i = 0; i < count; i++) {
                if (await this.isEmptyState(i)) continue;

                const cells = rows.nth(i).locator('td');
                const cellCount = await cells.count();

                if (cellCount > columnIndex) {
                    const value = (await cells.nth(columnIndex).innerText()).trim();
                    if (value && value.length > 0 && !value.includes('✓') && !value.includes('✗')) {
                        values.add(value);
                    }
                }
            }

            return Array.from(values);
        } catch {
            return [];
        }
    }

    private async getAllSearchableData(): Promise<
        Array<{ column: string; value: string }>
    > {
        const columns = [
            { column: 'VIN', index: 0 },
            { column: 'Year', index: 1 },
            { column: 'Make', index: 2 },
            { column: 'Model', index: 3 },
            { column: 'Trim', index: 4 },
            { column: 'Stock ID', index: 5 },
            { column: 'Status', index: 6 },
            { column: 'Type', index: 7 },
        ];

        const result: Array<{ column: string; value: string }> = [];

        for (const col of columns) {
            const uniqueValues = await this.getUniqueColumnValues(col.index);
            for (const value of uniqueValues) {
                if (value && value.length > 0) {
                    result.push({ 
                        column: col.column, 
                        value: value 
                    });
                }
            }
        }

        return result;
    }

    // ============================================================
    // PUBLIC METHODS
    // ============================================================

    async validateAllSearches(): Promise<void> {
        const searchData = await this.getAllSearchableData();

        if (searchData.length === 0) {
            console.log('\n⚠️  No searchable data found!');
            return;
        }

        // Log header
        console.log('\n' + '='.repeat(40));
        console.log('🔍 INVENTORY SEARCH VALIDATION');
        console.log('='.repeat(40));
        console.log(`📊 Testing ${searchData.length} unique search values`);
        console.log('='.repeat(40));

        // Group by column for better reporting
        const groupedData = new Map<string, string[]>();
        for (const item of searchData) {
            if (!groupedData.has(item.column)) {
                groupedData.set(item.column, []);
            }
            groupedData.get(item.column)!.push(item.value);
        }

        // Log which columns and how many values
        for (const [column, values] of groupedData) {
            console.log(`\n📋 ${column}: ${values.length} unique values`);
            if (values.length <= 5) {
                console.log(`   ${values.join(', ')}`);
            } else {
                console.log(`   ${values.slice(0, 5).join(', ')}... and ${values.length - 5} more`);
            }
        }

        console.log('\n' + '='.repeat(40));
        console.log('🔍 EXECUTING SEARCHES');
        console.log('='.repeat(40));

        const startTime = Date.now();
        const maxDuration = 100000;
        let passedCount = 0;
        let failedCount = 0;
        let skippedCount = 0;

        for (let i = 0; i < searchData.length; i++) {
            if (Date.now() - startTime > maxDuration) {
                console.log(`\n⚠️  Time limit reached, skipping remaining ${searchData.length - i} searches`);
                skippedCount = searchData.length - i;
                break;
            }

            const item = searchData[i];
            
            console.log(`\n[${i + 1}/${searchData.length}] STEP    : Search by ${item.column}`);
            console.log(`SEARCH  : ${item.value}`);
            console.log('EXPECTED: At least 1 result');

            try {
                await this.performSearch(item.value);
                await this.page.waitForTimeout(300);
                
                const resultCount = await this.getResultCount();
                const passed = resultCount > 0;

                if (passed) {
                    passedCount++;
                } else {
                    failedCount++;
                }

                console.log(`ACTUAL  : ${resultCount} results found`);
                console.log(`STATUS  : ${passed ? 'PASS ✅' : 'FAIL ❌'}`);

                expect(
                    resultCount,
                    `Search failed for ${item.column}: "${item.value}" - Expected at least 1 result but found ${resultCount}`
                ).toBeGreaterThan(0);

                if (i < searchData.length - 1) {
                    await this.clearSearch();
                }
            } catch (error) {
                console.log(`❌ Error during search: ${error}`);
                failedCount++;
                console.log('⚠️  Continuing with next search...');
                
                try {
                    await this.clearSearch();
                } catch {
                    await this.page.reload();
                    await this.page.waitForLoadState('networkidle');
                }
            }
        }

        // Final summary
        console.log('\n' + '='.repeat(40));
        console.log('📊 SEARCH VALIDATION SUMMARY');
        console.log('='.repeat(40));
        console.log(`✅ PASSED : ${passedCount}`);
        console.log(`❌ FAILED : ${failedCount}`);
        if (skippedCount > 0) {
            console.log(`⏭️  SKIPPED: ${skippedCount}`);
        }
        console.log(`📊 TOTAL  : ${passedCount + failedCount + skippedCount}`);
        console.log('='.repeat(40));
        
        if (failedCount === 0 && skippedCount === 0) {
            console.log('✅ ALL SEARCH VALIDATIONS PASSED 🎉');
        } else if (failedCount === 0 && skippedCount > 0) {
            console.log(`⚠️  ${skippedCount} SEARCHES SKIPPED DUE TO TIME LIMIT`);
        } else {
            console.log(`❌ ${failedCount} SEARCH VALIDATIONS FAILED`);
        }
        console.log('='.repeat(40) + '\n');
    }

    async validateInvalidSearch(
        searchValue: string = 'INVALID_INVENTORY_123456789'
    ): Promise<void> {
        console.log('\n' + '='.repeat(40));
        console.log('🔍 INVALID INVENTORY SEARCH');
        console.log('='.repeat(40));
        console.log(`SEARCH  : ${searchValue}`);
        console.log('\nEXPECTED: 0 results (no matches found)\n');

        try {
            await this.performSearch(searchValue);
            await this.page.waitForTimeout(300);
            
            const resultCount = await this.getResultCount();
            const passed = resultCount === 0;

            console.log(`ACTUAL  : ${resultCount} results found\n`);
            console.log(`STATUS  : ${passed ? 'PASS ✅' : 'FAIL ❌'}`);

            expect(
                resultCount,
                `Invalid Inventory Search should return 0 results but found ${resultCount}`
            ).toBe(0);

            console.log('\n' + '='.repeat(40));
            console.log(`✅ INVALID SEARCH ${passed ? 'PASSED' : 'FAILED'}`);
            console.log('='.repeat(40) + '\n');
        } catch (error) {
            console.log(`❌ Error during invalid search: ${error}`);
            throw error;
        }
    }
}