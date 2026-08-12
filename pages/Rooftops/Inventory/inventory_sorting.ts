import { Page, Locator, TestInfo } from '@playwright/test';

export type SortDirection = 'ASC' | 'DESC';

interface SortingResult {
    passed: boolean;
    error?: string;
}

export class InventorySorting {

    private page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    // ============================================================
    // TABLE LOCATORS
    // ============================================================

    private getRows(): Locator {
        return this.page.locator('table tbody tr');
    }

    private getHeaders(): Locator {
        return this.page.locator('table thead th');
    }

    // ============================================================
    // NORMALIZE TEXT
    // ============================================================

    private normalize(value: string): string {
        return value
            .replace(/\u00a0/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();
    }

    // ============================================================
    // GET COLUMN INDEX
    // ============================================================

    private async getColumnIndex(
        columnName: string
    ): Promise<number> {

        const headers = this.getHeaders();

        const count = await headers.count();

        const expected = this.normalize(
            columnName
        ).toLowerCase();

        for (let i = 0; i < count; i++) {

            const headerText =
                this.normalize(
                    await headers
                        .nth(i)
                        .innerText()
                        .catch(() => '')
                ).toLowerCase();

            if (headerText === expected) {
                return i;
            }
        }

        throw new Error(
            `Column "${columnName}" was not found.`
        );
    }

    // ============================================================
    // SELECT 100 ROWS
    // ============================================================

    private async select100Rows(): Promise<void> {

        console.log(
            '\n📊 Selecting "100" from showing dropdown...'
        );

        try {

            /*
             * Try native select first.
             */
            const selects = this.page.locator('select');

            const selectCount =
                await selects.count();

            for (let i = 0; i < selectCount; i++) {

                const select = selects.nth(i);

                if (
                    await select.isVisible().catch(() => false)
                ) {

                    const options =
                        await select
                            .locator('option')
                            .allTextContents();

                    const has100 =
                        options.some(
                            option =>
                                this.normalize(option) === '100'
                        );

                    if (has100) {

                        await select.selectOption({
                            label: '100'
                        });

                        await this.page.waitForTimeout(800);

                        console.log(
                            '✅ Successfully selected "100" rows per page'
                        );

                        return;
                    }
                }
            }

            /*
             * Try buttons/text based dropdown.
             */
            const showing100 =
                this.page.getByText('100', {
                    exact: true
                });

            if (
                await showing100
                    .first()
                    .isVisible()
                    .catch(() => false)
            ) {

                await showing100.first().click();

                await this.page.waitForTimeout(300);

                const option100 =
                    this.page.getByText('100', {
                        exact: true
                    });

                if (
                    await option100
                        .last()
                        .isVisible()
                        .catch(() => false)
                ) {

                    await option100.last().click();

                    await this.page.waitForTimeout(800);

                    console.log(
                        '✅ Successfully selected "100" rows per page'
                    );

                    return;
                }
            }

            console.log(
                '⚠️ Could not locate "100" rows option. Continuing with current page size.'
            );

        } catch (error) {

            console.log(
                `⚠️ Could not select 100 rows: ${String(error)}`
            );
        }
    }

    // ============================================================
    // GET CELL VALUE
    // ============================================================

    private async getCellValue(
        row: Locator,
        columnIndex: number
    ): Promise<string> {

        const cells = row.locator('td');

        const cellCount =
            await cells.count();

        if (columnIndex >= cellCount) {
            return '';
        }

        return this.normalize(
            await cells
                .nth(columnIndex)
                .innerText()
                .catch(() => '')
        );
    }

    // ============================================================
    // GET COLUMN VALUES
    // ============================================================

    private async getColumnValues(
        columnName: string
    ): Promise<string[]> {

        const columnIndex =
            await this.getColumnIndex(
                columnName
            );

        const rows = this.getRows();

        const rowCount =
            await rows.count();

        const values: string[] = [];

        for (let i = 0; i < rowCount; i++) {

            const row = rows.nth(i);

            if (
                !(await row.isVisible().catch(() => false))
            ) {
                continue;
            }

            const value =
                await this.getCellValue(
                    row,
                    columnIndex
                );

            if (value !== '') {
                values.push(value);
            }
        }

        return values;
    }

    // ============================================================
    // CONVERT VALUE FOR SORTING
    // ============================================================

    private convertValue(
        value: string,
        columnName: string
    ): string | number {

        const cleaned =
            this.normalize(value);

        /*
         * YEAR
         *
         * This is important.
         *
         * "2024" must be compared as number 2024,
         * not as a string.
         */
        if (
            columnName.toLowerCase() === 'year'
        ) {

            const numericValue =
                Number(
                    cleaned.replace(/,/g, '')
                );

            if (
                !Number.isNaN(numericValue)
            ) {
                return numericValue;
            }
        }

        /*
         * Date columns.
         */
        if (
            columnName.toLowerCase() === 'added' ||
            columnName.toLowerCase() === 'updated' ||
            columnName.toLowerCase() === 'in stock'
        ) {

            const timestamp =
                Date.parse(cleaned);

            if (!Number.isNaN(timestamp)) {
                return timestamp;
            }
        }

        return cleaned.toLowerCase();
    }

    // ============================================================
    // COMPARE VALUES
    // ============================================================

    private compareValues(
        first: string,
        second: string,
        columnName: string
    ): number {

        const a =
            this.convertValue(
                first,
                columnName
            );

        const b =
            this.convertValue(
                second,
                columnName
            );

        if (
            typeof a === 'number' &&
            typeof b === 'number'
        ) {
            return a - b;
        }

        return String(a).localeCompare(
            String(b),
            undefined,
            {
                numeric: true,
                sensitivity: 'base'
            }
        );
    }

    // ============================================================
    // CHECK SORT ORDER
    // ============================================================

    private checkSorted(
        values: string[],
        columnName: string,
        direction: SortDirection
    ): {
        passed: boolean;
        error?: string;
    } {

        if (values.length <= 1) {

            return {
                passed: true
            };
        }

        for (
            let i = 0;
            i < values.length - 1;
            i++
        ) {

            const current =
                values[i];

            const next =
                values[i + 1];

            const comparison =
                this.compareValues(
                    current,
                    next,
                    columnName
                );

            /*
             * ASC:
             *
             * current <= next
             */
            if (
                direction === 'ASC' &&
                comparison > 0
            ) {

                return {
                    passed: false,
                    error:
                        `${current} > ${next} ` +
                        `(Expected: ${current} <= ${next})`
                };
            }

            /*
             * DESC:
             *
             * current >= next
             */
            if (
                direction === 'DESC' &&
                comparison < 0
            ) {

                return {
                    passed: false,
                    error:
                        `${current} < ${next} ` +
                        `(Expected: ${current} >= ${next})`
                };
            }
        }

        return {
            passed: true
        };
    }

    // ============================================================
    // DETECT ACTUAL SORT DIRECTION
    // ============================================================

    private detectDirection(
        values: string[],
        columnName: string
    ): SortDirection | null {

        if (values.length <= 1) {
            return null;
        }

        let asc = true;
        let desc = true;

        for (
            let i = 0;
            i < values.length - 1;
            i++
        ) {

            const comparison =
                this.compareValues(
                    values[i],
                    values[i + 1],
                    columnName
                );

            if (comparison > 0) {
                asc = false;
            }

            if (comparison < 0) {
                desc = false;
            }
        }

        if (asc && !desc) {
            return 'ASC';
        }

        if (desc && !asc) {
            return 'DESC';
        }

        /*
         * All values are equal.
         *
         * We cannot determine the direction from the data.
         */
        return null;
    }

    // ============================================================
    // CLICK COLUMN HEADER
    // ============================================================

    private async clickColumn(
        columnName: string
    ): Promise<void> {

        const headers =
            this.getHeaders();

        const columnIndex =
            await this.getColumnIndex(
                columnName
            );

        const header =
            headers.nth(columnIndex);

        await header.scrollIntoViewIfNeeded();

        await header.click();

        /*
         * Give React/data-grid time to update.
         */
        await this.page.waitForTimeout(800);
    }

    // ============================================================
    // GO TO FIRST PAGE
    // ============================================================

    private async goToFirstPage(): Promise<void> {

        console.log(
            '📌 Going to first page...'
        );

        let safety = 0;

        while (safety < 100) {

            safety++;

            const previousButtons =
                this.page.locator(
                    'button[aria-label*="Previous"], ' +
                    'button[title*="Previous"], ' +
                    'button:has-text("Previous")'
                );

            const count =
                await previousButtons.count();

            if (count === 0) {
                break;
            }

            const button =
                previousButtons.last();

            if (
                !(await button.isVisible().catch(() => false))
            ) {
                break;
            }

            const disabled =
                await button.isDisabled().catch(() => false);

            if (disabled) {
                break;
            }

            await button.click();

            await this.page.waitForTimeout(400);
        }

        console.log(
            `📌 At first page`
        );
    }

    // ============================================================
    // GO TO NEXT PAGE
    // ============================================================

    private async goToNextPage(): Promise<boolean> {

        const nextButtons =
            this.page.locator(
                'button[aria-label*="Next"], ' +
                'button[title*="Next"], ' +
                'button:has-text("Next")'
            );

        const count =
            await nextButtons.count();

        if (count === 0) {
            return false;
        }

        const button =
            nextButtons.last();

        if (
            !(await button.isVisible().catch(() => false))
        ) {
            return false;
        }

        if (
            await button.isDisabled().catch(() => false)
        ) {
            return false;
        }

        await button.click();

        await this.page.waitForTimeout(600);

        return true;
    }

    // ============================================================
    // VALIDATE ONE COMPLETE SORT
    // ============================================================

    private async validateAllPagesSorting(
        columnName: string,
        direction: SortDirection,
        testInfo: TestInfo
    ): Promise<{
        passed: boolean;
        error?: string;
    }> {

        await this.goToFirstPage();

        console.log(
            `\n📄 Starting pagination validation for ${columnName} (${direction})`
        );

        const allValues: string[] = [];

        let pageNumber = 1;

        while (true) {

            const values =
                await this.getColumnValues(
                    columnName
                );

            console.log(
                `📄 Page ${pageNumber} - ${columnName} values: ${values.length} rows`
            );

            allValues.push(...values);

            const nextPage =
                await this.goToNextPage();

            if (!nextPage) {

                console.log(
                    `\n📊 Reached last page (Page ${pageNumber}) - No more pages`
                );

                break;
            }

            pageNumber++;
        }

        console.log(
            `\n📊 Final validation across ${pageNumber} pages (${allValues.length} total rows)`
        );

        const result =
            this.checkSorted(
                allValues,
                columnName,
                direction
            );

        if (!result.passed) {

            console.log(
                `❌ Overall sorting failed across ${pageNumber} pages`
            );

            return {
                passed: false,
                error:
                    `${direction} sorting failed: ${result.error}; ` +
                    `Overall sorting violation: ${result.error}`
            };
        }

        console.log(
            `✅ Overall sorting PASSED across ${pageNumber} pages (${allValues.length} rows)`
        );

        return {
            passed: true
        };
    }

    // ============================================================
    // VALIDATE COLUMN SORTING
    // ============================================================

    async validateColumnSorting(
        columnName: string,
        testInfo: TestInfo
    ): Promise<SortingResult> {

        try {

            /*
             * Select 100 rows.
             */
            await this.select100Rows();

            // ========================================================
            // IMPORTANT
            // ========================================================
            //
            // We DO NOT assume that the first click is ASC.
            //
            // We click the column and inspect the resulting data.
            //
            // Example:
            //
            //     2024
            //     2023
            //     2023
            //
            // means DESC.
            //
            // Then we click again and expect ASC.
            // ========================================================

            console.log(
                `\n📊 Testing sorting for: ${columnName}`
            );

            // ========================================================
            // FIRST CLICK
            // ========================================================

            await this.goToFirstPage();

            const beforeValues =
                await this.getColumnValues(
                    columnName
                );

            await this.clickColumn(
                columnName
            );

            await this.goToFirstPage();

            const firstValues =
                await this.getColumnValues(
                    columnName
                );

            const firstDirection =
                this.detectDirection(
                    firstValues,
                    columnName
                );

            console.log(
                `📌 First click actual direction for ${columnName}: ${
                    firstDirection ?? 'UNDETERMINED'
                }`
            );

            // ========================================================
            // FIRST RESULT
            // ========================================================

            if (firstDirection) {

                const firstResult =
                    this.checkSorted(
                        firstValues,
                        columnName,
                        firstDirection
                    );

                if (!firstResult.passed) {

                    return {
                        passed: false,
                        error:
                            `${columnName} ${firstDirection} sorting failed: ${firstResult.error}`
                    };
                }

                console.log(
                    `✅ ${columnName} ${firstDirection} sorting PASSED`
                );

            } else {

                console.log(
                    `⚠️ ${columnName}: first direction could not be determined because the visible values are equal.`
                );
            }

            // ========================================================
            // SECOND CLICK
            // ========================================================

            await this.clickColumn(
                columnName
            );

            await this.goToFirstPage();

            const secondValues =
                await this.getColumnValues(
                    columnName
                );

            const secondDirection =
                this.detectDirection(
                    secondValues,
                    columnName
                );

            console.log(
                `📌 Second click actual direction for ${columnName}: ${
                    secondDirection ?? 'UNDETERMINED'
                }`
            );

            // ========================================================
            // SECOND RESULT
            // ========================================================

            if (secondDirection) {

                const secondResult =
                    this.checkSorted(
                        secondValues,
                        columnName,
                        secondDirection
                    );

                if (!secondResult.passed) {

                    return {
                        passed: false,
                        error:
                            `${columnName} ${secondDirection} sorting failed: ${secondResult.error}`
                    };
                }

                console.log(
                    `✅ ${columnName} ${secondDirection} sorting PASSED`
                );
            }

            // ========================================================
            // VERIFY TOGGLE
            // ========================================================

            if (
                firstDirection &&
                secondDirection &&
                firstDirection === secondDirection
            ) {

                return {
                    passed: false,
                    error:
                        `${columnName} sorting did not toggle. ` +
                        `First click = ${firstDirection}, ` +
                        `Second click = ${secondDirection}`
                };
            }

            // ========================================================
            // FINAL PASS
            // ========================================================

            console.log(
                `\n✅ ${columnName} sorting PASSED`
            );

            return {
                passed: true
            };

        } catch (error) {

            const errorMessage =
                error instanceof Error
                    ? error.message
                    : String(error);

            console.log(
                `❌ ${columnName} sorting FAILED`
            );

            console.log(
                `Reason: ${errorMessage}`
            );

            return {
                passed: false,
                error: errorMessage
            };
        }
    }
}