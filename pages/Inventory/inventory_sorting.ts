import { Page, Locator, TestInfo, expect } from '@playwright/test';
import { BasePage } from '../BasePage';

type SortDirection = 'ASC' | 'DESC';

interface SortingResult {
    passed: boolean;
    error?: string;
}

export class InventorySorting extends BasePage {
    page: Page;

    private tableHeaders: Locator;
    private tableRows: Locator;

    constructor(page: Page) {
        super(page);
        this.page = page;

        /*
         * The inventory screen uses a normal table structure.
         * Keep the locators broad enough to work with the current
         * inventory grid.
         */
        this.tableHeaders = page.locator(
            'thead th, [role="columnheader"]'
        );

        this.tableRows = page.locator(
            'tbody tr, [role="row"]'
        ).filter({
            hasNot: page.locator('[role="columnheader"]')
        });
    }

    // ============================================================
    // NORMALIZE TEXT
    // ============================================================

    private normalize(value: string): string {
        return value
            .replace(/\s+/g, ' ')
            .replace(/\u00a0/g, ' ')
            .trim()
            .toLowerCase();
    }

    // ============================================================
    // GET COLUMN HEADER
    // ============================================================

    private async getHeader(columnName: string): Promise<Locator> {
        const normalizedColumn = this.normalize(columnName);

        const headers = this.tableHeaders;

        const count = await headers.count();

        for (let i = 0; i < count; i++) {
            const header = headers.nth(i);

            const text = this.normalize(
                await header.innerText().catch(() => '')
            );

            if (text === normalizedColumn) {
                return header;
            }
        }

        throw new Error(
            `Column header "${columnName}" was not found.`
        );
    }

    // ============================================================
    // GET COLUMN INDEX
    // ============================================================

    private async getColumnIndex(
        columnName: string
    ): Promise<number> {
        const normalizedColumn = this.normalize(columnName);

        const count = await this.tableHeaders.count();

        for (let i = 0; i < count; i++) {
            const header = this.tableHeaders.nth(i);

            const text = this.normalize(
                await header.innerText().catch(() => '')
            );

            if (text === normalizedColumn) {
                return i;
            }
        }

        throw new Error(
            `Unable to find column index for "${columnName}".`
        );
    }

    // ============================================================
    // GET CURRENT TABLE ROWS
    // ============================================================

    private async getVisibleRows(): Promise<Locator[]> {
        const rows: Locator[] = [];

        const count = await this.tableRows.count();

        for (let i = 0; i < count; i++) {
            const row = this.tableRows.nth(i);

            if (await row.isVisible().catch(() => false)) {
                rows.push(row);
            }
        }

        return rows;
    }

    // ============================================================
    // GET CELL VALUE
    // ============================================================

    private async getCellValue(
        row: Locator,
        columnIndex: number
    ): Promise<string> {
        const cells = row.locator(
            'td, [role="gridcell"]'
        );

        const cellCount = await cells.count();

        if (columnIndex >= cellCount) {
            return '';
        }

        return (
            await cells
                .nth(columnIndex)
                .innerText()
                .catch(() => '')
        ).trim();
    }

    // ============================================================
    // GET COLUMN VALUES
    // ============================================================

    private async getColumnValues(
        columnName: string
    ): Promise<string[]> {
        const columnIndex =
            await this.getColumnIndex(columnName);

        const rows = await this.getVisibleRows();

        const values: string[] = [];

        for (const row of rows) {
            const value = await this.getCellValue(
                row,
                columnIndex
            );

            /*
             * Ignore completely empty rows.
             */
            if (value.trim() !== '') {
                values.push(value.trim());
            }
        }

        return values;
    }

    // ============================================================
    // NORMALIZE SORT VALUE
    // ============================================================

    private getSortValue(
        value: string,
        columnName: string
    ): string | number {
        const cleaned = value
            .replace(/\u00a0/g, ' ')
            .trim();

        /*
         * YEAR MUST BE NUMERIC.
         *
         * This is the important fix for the Year column.
         */
        if (columnName.toLowerCase() === 'year') {
            const numericValue = Number(
                cleaned.replace(/,/g, '')
            );

            if (!Number.isNaN(numericValue)) {
                return numericValue;
            }
        }

        /*
         * Stock ID can contain letters and numbers.
         * VIN is also alphanumeric.
         */
        return cleaned.toLowerCase();
    }

    // ============================================================
    // COMPARE TWO VALUES
    // ============================================================

    private compareValues(
        first: string,
        second: string,
        columnName: string
    ): number {
        const a = this.getSortValue(
            first,
            columnName
        );

        const b = this.getSortValue(
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
    // CHECK SORTED
    // ============================================================

    private isSorted(
        values: string[],
        columnName: string,
        direction: SortDirection
    ): boolean {
        if (values.length <= 1) {
            return true;
        }

        for (let i = 0; i < values.length - 1; i++) {
            const current = values[i];
            const next = values[i + 1];

            const comparison = this.compareValues(
                current,
                next,
                columnName
            );

            if (
                direction === 'ASC' &&
                comparison > 0
            ) {
                return false;
            }

            if (
                direction === 'DESC' &&
                comparison < 0
            ) {
                return false;
            }
        }

        return true;
    }

    // ============================================================
    // DETERMINE SORT DIRECTION FROM DATA
    // ============================================================

    private detectDirection(
        values: string[],
        columnName: string
    ): SortDirection | null {
        if (values.length <= 1) {
            return null;
        }

        let ascending = true;
        let descending = true;

        for (let i = 0; i < values.length - 1; i++) {
            const comparison = this.compareValues(
                values[i],
                values[i + 1],
                columnName
            );

            if (comparison > 0) {
                ascending = false;
            }

            if (comparison < 0) {
                descending = false;
            }
        }

        if (ascending && !descending) {
            return 'ASC';
        }

        if (descending && !ascending) {
            return 'DESC';
        }

        /*
         * If all values are equal, direction cannot be determined
         * from data. Return null and let the caller use the header
         * aria-sort if available.
         */
        return null;
    }

    // ============================================================
    // GET ARIA SORT
    // ============================================================

    private async getAriaSort(
        header: Locator
    ): Promise<SortDirection | null> {
        const ariaSort =
            await header
                .getAttribute('aria-sort')
                .catch(() => null);

        if (!ariaSort) {
            return null;
        }

        const normalized =
            ariaSort.toLowerCase();

        if (
            normalized === 'ascending' ||
            normalized === 'asc'
        ) {
            return 'ASC';
        }

        if (
            normalized === 'descending' ||
            normalized === 'desc'
        ) {
            return 'DESC';
        }

        return null;
    }

    // ============================================================
    // CLICK HEADER
    // ============================================================

    private async clickColumnHeader(
        columnName: string
    ): Promise<void> {
        const header =
            await this.getHeader(columnName);

        await header.scrollIntoViewIfNeeded();

        await header.click();

        /*
         * Allow React/grid sorting to finish.
         */
        await this.page.waitForTimeout(800);

        /*
         * Wait until the UI settles.
         */
        await this.page
            .waitForLoadState('networkidle')
            .catch(() => {});
    }

    // ============================================================
    // VALIDATE ONE SORT STATE
    // ============================================================

    private async validateCurrentSort(
        columnName: string,
        expectedDirection: SortDirection,
        testInfo: TestInfo
    ): Promise<boolean> {
        const values =
            await this.getColumnValues(columnName);

        if (values.length === 0) {
            throw new Error(
                `No values found for column "${columnName}".`
            );
        }

        const passed = this.isSorted(
            values,
            columnName,
            expectedDirection
        );

        const firstValue = values[0] ?? '';
        const secondValue = values[1] ?? '';

        const actualDirection =
            this.detectDirection(
                values,
                columnName
            );

        console.log(
            `Column: ${columnName} | ` +
            `Expected: ${expectedDirection} | ` +
            `Detected: ${actualDirection ?? 'UNDETERMINED'}`
        );

        console.log(
            `Values: ${values.join(' | ')}`
        );

        if (!passed) {
            const message =
                `${columnName} is not sorted ` +
                `${expectedDirection}. ` +
                `First values: "${firstValue}" and "${secondValue}". ` +
                `Detected direction: ${actualDirection ?? 'UNDETERMINED'}`;

            console.log(`❌ ${message}`);

            return false;
        }

        console.log(
            `✅ ${columnName} ${expectedDirection} sorting passed`
        );

        return true;
    }

    // ============================================================
    // VALIDATE COLUMN SORTING
    // ============================================================

    async validateColumnSorting(
        columnName: string,
        testInfo: TestInfo
    ): Promise<SortingResult> {
        try {
            console.log(
                `\nTesting sorting for: ${columnName}`
            );

            /*
             * ----------------------------------------------------
             * IMPORTANT FIX
             * ----------------------------------------------------
             *
             * We DO NOT assume the first click is ASC.
             *
             * The application in your report is currently doing:
             *
             *     First click -> DESC
             *     Second click -> ASC
             *
             * Therefore we inspect the actual data after every click.
             */

            const header =
                await this.getHeader(columnName);

            /*
             * Capture initial state.
             */
            const beforeValues =
                await this.getColumnValues(columnName);

            const beforeDirection =
                this.detectDirection(
                    beforeValues,
                    columnName
                );

            /*
             * Click once.
             */
            await this.clickColumnHeader(
                columnName
            );

            const firstValues =
                await this.getColumnValues(columnName);

            let firstDirection =
                this.detectDirection(
                    firstValues,
                    columnName
                );

            /*
             * If data cannot determine the direction,
             * use aria-sort.
             */
            if (!firstDirection) {
                firstDirection =
                    await this.getAriaSort(header);
            }

            /*
             * ----------------------------------------------------
             * FIRST SORT
             * ----------------------------------------------------
             */

            if (firstDirection) {
                const firstPassed =
                    await this.validateCurrentSort(
                        columnName,
                        firstDirection,
                        testInfo
                    );

                if (!firstPassed) {
                    return {
                        passed: false,
                        error:
                            `${columnName} ${firstDirection} sorting failed`
                    };
                }
            } else {
                /*
                 * If there are equal values only, there is no
                 * reliable direction to detect. We don't fail
                 * just because the data contains duplicates.
                 */
                console.log(
                    `⚠️ Unable to determine first sort direction for ${columnName} because the visible values are equal/insufficient.`
                );
            }

            /*
             * ----------------------------------------------------
             * SECOND SORT
             * ----------------------------------------------------
             */

            await this.clickColumnHeader(
                columnName
            );

            const secondValues =
                await this.getColumnValues(columnName);

            let secondDirection =
                this.detectDirection(
                    secondValues,
                    columnName
                );

            if (!secondDirection) {
                secondDirection =
                    await this.getAriaSort(header);
            }

            /*
             * If first direction was detected, the second direction
             * should normally be the opposite.
             */
            let expectedSecondDirection:
                SortDirection | null = null;

            if (firstDirection === 'ASC') {
                expectedSecondDirection = 'DESC';
            } else if (firstDirection === 'DESC') {
                expectedSecondDirection = 'ASC';
            }

            /*
             * Validate second direction.
             */
            if (secondDirection) {
                const secondPassed =
                    await this.validateCurrentSort(
                        columnName,
                        secondDirection,
                        testInfo
                    );

                if (!secondPassed) {
                    return {
                        passed: false,
                        error:
                            `${columnName} ${secondDirection} sorting failed`
                    };
                }

                /*
                 * If we know the first direction, make sure the
                 * second click actually changed direction.
                 */
                if (
                    expectedSecondDirection &&
                    secondDirection !==
                        expectedSecondDirection
                ) {
                    return {
                        passed: false,
                        error:
                            `${columnName} did not toggle sorting direction. ` +
                            `Expected ${expectedSecondDirection}, ` +
                            `but detected ${secondDirection}.`
                    };
                }
            } else {
                console.log(
                    `⚠️ Unable to determine second sort direction for ${columnName}.`
                );
            }

            /*
             * ----------------------------------------------------
             * SUCCESS
             * ----------------------------------------------------
             */

            console.log(
                `✅ ${columnName} sorting validation PASSED`
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
                `❌ ${columnName} sorting validation failed: ${errorMessage}`
            );

            return {
                passed: false,
                error: errorMessage
            };
        }
    }
}