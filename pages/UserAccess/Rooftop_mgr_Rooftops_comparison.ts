import { Page } from '@playwright/test';

export class rooftopmgr_rooftopverification {

    private page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    /**
     * Get only Reseller IDs from all pagination pages.
     *
     * This method does NOT check:
     * - Action column
     * - Edit button
     * - Edit URL
     *
     * It is specifically used for reseller permission validation.
     */
    async getAllIdsFromPagination(): Promise<string[]> {

        const allIds: string[] = [];

        let currentPage = 1;

        while (true) {

            console.log(`📄 Reading Reseller page ${currentPage}`);

            // ---------------------------------------------------------
            // Wait for table
            // ---------------------------------------------------------

            const table = this.page.locator('table').first();

            await table.waitFor({
                state: 'visible',
                timeout: 30000
            });

            // ---------------------------------------------------------
            // Get table headers
            // ---------------------------------------------------------

            const headers = table.locator('thead tr th');

            const headerCount = await headers.count();

            let idColumnIndex = -1;

            // ---------------------------------------------------------
            // Find ID column
            // ---------------------------------------------------------

            for (let i = 0; i < headerCount; i++) {

                const headerText =
                    (await headers.nth(i).innerText())
                        .trim()
                        .toLowerCase();

                console.log(
                    `Header ${i}: "${headerText}"`
                );

                if (
                    headerText === 'id' ||
                    headerText === 'reseller id' ||
                    headerText.includes('id')
                ) {

                    idColumnIndex = i;

                    break;
                }
            }

            if (idColumnIndex === -1) {

                throw new Error(
                    'ID column was not found in the Reseller table'
                );
            }

            console.log(
                `✅ ID column found at index: ${idColumnIndex}`
            );

            // ---------------------------------------------------------
            // Get rows
            // ---------------------------------------------------------

            const rows = table.locator('tbody tr');

            const rowCount = await rows.count();

            console.log(
                `Resellers found on page ${currentPage}: ${rowCount}`
            );

            // ---------------------------------------------------------
            // No records
            // ---------------------------------------------------------

            if (rowCount === 0) {

                console.log(
                    'ℹ️ No reseller records found.'
                );

                break;
            }

            // ---------------------------------------------------------
            // Read IDs
            // ---------------------------------------------------------

            for (let i = 0; i < rowCount; i++) {

                const cells =
                    rows.nth(i).locator('td');

                const cellCount =
                    await cells.count();

                if (idColumnIndex >= cellCount) {
                    continue;
                }

                const id =
                    (
                        await cells
                            .nth(idColumnIndex)
                            .innerText()
                    ).trim();

                if (
                    id &&
                    id !== '-' &&
                    id.toLowerCase() !== 'n/a'
                ) {

                    allIds.push(id);

                    console.log(
                        `   Reseller ID: ${id}`
                    );
                }
            }

            // ---------------------------------------------------------
            // Find Next button
            // ---------------------------------------------------------

            const nextButton = this.page.locator(
                'button:has-text("Next"), ' +
                'button[aria-label*="Next"], ' +
                'button[title*="Next"], ' +
                'a:has-text("Next")'
            ).last();

            // ---------------------------------------------------------
            // Next button does not exist
            // ---------------------------------------------------------

            if (await nextButton.count() === 0) {

                console.log(
                    'ℹ️ Next button not found.'
                );

                break;
            }

            // ---------------------------------------------------------
            // Check disabled state
            // ---------------------------------------------------------

            const disabled =
                await nextButton
                    .isDisabled()
                    .catch(() => false);

            const ariaDisabled =
                await nextButton.getAttribute(
                    'aria-disabled'
                );

            if (
                disabled ||
                ariaDisabled === 'true'
            ) {

                console.log(
                    'ℹ️ Last page reached.'
                );

                break;
            }

            // ---------------------------------------------------------
            // Save first row before clicking Next
            // ---------------------------------------------------------

            const firstRowBefore =
                (
                    await rows
                        .first()
                        .innerText()
                ).trim();

            // ---------------------------------------------------------
            // Click Next
            // ---------------------------------------------------------

            await nextButton.click();

            // ---------------------------------------------------------
            // Wait for table to update
            // ---------------------------------------------------------

            try {

                await this.page.waitForFunction(
                    (previousText) => {

                        const row =
                            document.querySelector(
                                'table tbody tr'
                            );

                        return (
                            row &&
                            row.textContent?.trim() !==
                            previousText
                        );

                    },
                    firstRowBefore,
                    {
                        timeout: 10000
                    }
                );

            } catch {

                // Fallback wait in case table update
                // is not detected by text comparison.

                await this.page.waitForTimeout(1000);
            }

            currentPage++;
        }

        // ---------------------------------------------------------
        // Remove duplicate IDs
        // ---------------------------------------------------------

        const uniqueIds =
            [...new Set(allIds)];

        console.log(
            `✅ Total Reseller IDs collected: ${uniqueIds.length}`
        );

        return uniqueIds;
    }

    /**
     * Compare two ID lists and return common IDs.
     */
    getCommonIds(
        firstIds: string[],
        secondIds: string[]
    ): string[] {

        const secondIdSet =
            new Set(secondIds);

        return firstIds.filter(
            id => secondIdSet.has(id)
        );
    }
}