import { Locator, Page, expect } from '@playwright/test';

export interface UserPermissionData {
    ids: string[];
    editUrls: string[];
}

export class ResellerPermission {

    private readonly page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    // ============================================================
    // GET ALL USER IDs AND EDIT URLs
    // ============================================================

    async getAllIdsAndEditUrlsFromPagination(): Promise<UserPermissionData> {

        const ids: string[] = [];
        const editUrls: string[] = [];

        let pageNumber = 1;

        while (true) {

            console.log(`📄 Reading Users page ${pageNumber}`);

            /*
             * Wait for table/list to be available.
             *
             * We intentionally do not fail when there are no records.
             * This is important for Reseller_Admin2.
             */

            await this.page.waitForLoadState('domcontentloaded');

            // --------------------------------------------------------
            // Find table rows
            // --------------------------------------------------------

            const rows = this.page.locator('table tbody tr');

            const rowCount = await rows.count();

            /*
             * If there are no table rows, this user simply has
             * no records.
             */

            if (rowCount === 0) {

                console.log(
                    `ℹ️ No User records found on page ${pageNumber}`
                );

                break;
            }

            // --------------------------------------------------------
            // Check whether table contains "No data"
            // --------------------------------------------------------

            const pageText = (
                await this.page.locator('body').innerText()
            ).toLowerCase();

            if (
                pageText.includes('no data') ||
                pageText.includes('no records') ||
                pageText.includes('no users found')
            ) {

                console.log(
                    `ℹ️ No User records available for this reseller`
                );

                break;
            }

            console.log(
                `Users found on page ${pageNumber}: ${rowCount}`
            );

            // --------------------------------------------------------
            // Find ID column
            // --------------------------------------------------------

            const headerCells = this.page.locator(
                'table thead tr th'
            );

            const headerCount = await headerCells.count();

            let idColumnIndex = -1;

            for (let i = 0; i < headerCount; i++) {

                const headerText = (
                    await headerCells.nth(i).innerText()
                ).trim().toLowerCase();

                if (
                    headerText === 'id' ||
                    headerText.includes('user id')
                ) {

                    idColumnIndex = i;
                    break;
                }
            }

            /*
             * If ID column cannot be found, do not immediately fail.
             *
             * Some pages can have an empty/no-record state.
             */

            if (idColumnIndex === -1) {

                const currentRows = await rows.count();

                if (currentRows === 0) {
                    break;
                }

                throw new Error(
                    'ID column was not found in the Users table'
                );
            }

            // --------------------------------------------------------
            // Read each row
            // --------------------------------------------------------

            for (let i = 0; i < rowCount; i++) {

                const row = rows.nth(i);

                const cells = row.locator('td');

                const cellCount = await cells.count();

                if (idColumnIndex >= cellCount) {
                    continue;
                }

                const idText = (
                    await cells.nth(idColumnIndex).innerText()
                ).trim();

                /*
                 * Ignore empty IDs.
                 */

                if (
                    !idText ||
                    idText.toLowerCase() === 'no data'
                ) {
                    continue;
                }

                /*
                 * Store unique IDs.
                 */

                if (!ids.includes(idText)) {
                    ids.push(idText);
                }

                // ----------------------------------------------------
                // Find Edit button/link
                // ----------------------------------------------------

                const editButton = row.locator(
                    'a[href*="/users/update"], ' +
                    'button:has-text("Edit"), ' +
                    'a:has-text("Edit")'
                ).first();

                if (await editButton.count() > 0) {

                    /*
                     * Try to get href directly.
                     */

                    const href = await editButton.getAttribute('href');

                    if (href) {

                        const editUrl = new URL(
                            href,
                            this.page.url()
                        ).href;

                        if (!editUrls.includes(editUrl)) {
                            editUrls.push(editUrl);
                        }

                    } else {

                        /*
                         * If there is no href, click Edit and capture
                         * the resulting URL.
                         */

                        const currentUrl = this.page.url();

                        try {

                            await editButton.click();

                            await this.page.waitForLoadState(
                                'domcontentloaded'
                            );

                            const editUrl = this.page.url();

                            if (
                                editUrl !== currentUrl &&
                                !editUrls.includes(editUrl)
                            ) {
                                editUrls.push(editUrl);
                            }

                            /*
                             * Return to Users list.
                             */

                            await this.page.goBack();

                            await this.page.waitForLoadState(
                                'domcontentloaded'
                            );

                        } catch {

                            console.log(
                                `⚠️ Could not capture Edit URL for User ID ${idText}`
                            );
                        }
                    }
                }
            }

            // --------------------------------------------------------
            // Pagination
            // --------------------------------------------------------

            const nextButton = this.page.locator(
                'button[aria-label="Next"], ' +
                'button:has-text("Next"), ' +
                'a[aria-label="Next"]'
            ).first();

            /*
             * If Next button does not exist, pagination is finished.
             */

            if (await nextButton.count() === 0) {
                break;
            }

            /*
             * If Next is disabled, pagination is finished.
             */

            const isDisabled =
                await nextButton.isDisabled().catch(() => true);

            if (isDisabled) {
                break;
            }

            /*
             * Capture current first row so we can verify that the
             * next page actually loaded.
             */

            const firstRowBefore =
                rowCount > 0
                    ? await rows.first().innerText()
                    : '';

            await nextButton.click();

            try {

                await this.page.waitForFunction(
                    (oldRowText) => {

                        const firstRow =
                            document.querySelector(
                                'table tbody tr'
                            );

                        return (
                            firstRow &&
                            firstRow.textContent !== oldRowText
                        );

                    },
                    firstRowBefore,
                    { timeout: 10000 }
                );

            } catch {

                /*
                 * If page content did not change, stop pagination.
                 */

                break;
            }

            pageNumber++;
        }

        console.log(
            `✅ Total Users IDs collected: ${ids.length}`
        );

        console.log(
            `✅ Total Edit URLs collected: ${editUrls.length}`
        );

        return {
            ids,
            editUrls
        };
    }


    // ============================================================
    // COMPARE USER IDS
    // ============================================================

    getCommonIds(
        admin1Ids: string[],
        admin2Ids: string[]
    ): string[] {

        const admin2Set = new Set(admin2Ids);

        return admin1Ids.filter(
            id => admin2Set.has(id)
        );
    }


    // ============================================================
    // COMPARE EDIT URLs
    // ============================================================

    getCommonEditUrls(
        admin1Urls: string[],
        admin2Urls: string[]
    ): string[] {

        const admin2Set = new Set(admin2Urls);

        return admin1Urls.filter(
            url => admin2Set.has(url)
        );
    }


    // ============================================================
    // FINAL USER ACCESS VALIDATION
    // ============================================================

    validateNoCommonAccess(
        admin1Data: UserPermissionData,
        admin2Data: UserPermissionData
    ): {
        passed: boolean;
        commonIds: string[];
        commonEditUrls: string[];
    } {

        const commonIds = this.getCommonIds(
            admin1Data.ids,
            admin2Data.ids
        );

        const commonEditUrls = this.getCommonEditUrls(
            admin1Data.editUrls,
            admin2Data.editUrls
        );

        /*
         * ----------------------------------------------------------
         * IMPORTANT BUSINESS LOGIC
         * ----------------------------------------------------------
         *
         * Admin 2 having ZERO records is a PASS.
         *
         * Admin 1 having ZERO records is also a PASS because
         * Admin 2 cannot access a record that Admin 1 does not have.
         *
         * If Admin 2 has records, compare them with Admin 1.
         *
         * Any common ID OR common Edit URL = FAIL.
         */

        const passed =
            commonIds.length === 0 &&
            commonEditUrls.length === 0;

        return {
            passed,
            commonIds,
            commonEditUrls
        };
    }


    // ============================================================
    // PRINT RESULT
    // ============================================================

    printComparisonResult(
        admin1Data: UserPermissionData,
        admin2Data: UserPermissionData
    ): void {

        const result = this.validateNoCommonAccess(
            admin1Data,
            admin2Data
        );

        console.log('');
        console.log('========================================');

        console.log(
            '🔍 STEP: Verify Reseller Admin 2 cannot access Reseller Admin 1 Users'
        );

        console.log('========================================');

        console.log('');
        console.log(
            `Reseller_Admin1 User IDs: ${
                admin1Data.ids.length > 0
                    ? admin1Data.ids.join(', ')
                    : 'No data available'
            }`
        );

        console.log('');
        console.log(
            `Reseller_Admin2 User IDs: ${
                admin2Data.ids.length > 0
                    ? admin2Data.ids.join(', ')
                    : 'No data available'
            }`
        );

        console.log('');

        console.log(
            `Common User IDs: ${
                result.commonIds.length > 0
                    ? result.commonIds.join(', ')
                    : 'None'
            }`
        );

        console.log('');

        console.log(
            `Common Edit URLs: ${
                result.commonEditUrls.length > 0
                    ? result.commonEditUrls.join(', ')
                    : 'None'
            }`
        );

        console.log('');
        console.log(
            'Expected: Reseller_Admin2 should not have access to Reseller_Admin1 Users'
        );

        console.log(
            `Actual: ${
                result.passed
                    ? 'No common User IDs or Edit URLs found'
                    : 'Common User IDs or Edit URLs found'
            }`
        );

        console.log(
            `Status: ${
                result.passed
                    ? 'PASSED ✅'
                    : 'FAILED ❌'
            }`
        );

        console.log(
            '========================================'
        );
    }


    // ============================================================
    // ASSERT FINAL RESULT
    // ============================================================

    assertNoCommonAccess(
        admin1Data: UserPermissionData,
        admin2Data: UserPermissionData
    ): void {

        const result = this.validateNoCommonAccess(
            admin1Data,
            admin2Data
        );

        expect(
            result.commonIds,
            `Reseller_Admin2 has access to Reseller_Admin1 User IDs: ${
                result.commonIds.join(', ')
            }`
        ).toHaveLength(0);

        expect(
            result.commonEditUrls,
            `Reseller_Admin2 has access to Reseller_Admin1 Edit URLs: ${
                result.commonEditUrls.join(', ')
            }`
        ).toHaveLength(0);
    }
}