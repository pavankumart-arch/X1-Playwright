import { test, expect } from '@playwright/test';

const AddRooftopData = require('../../../../../testdata/AddRooftopData.json');

import { Login } from '../../../../../pages/Login/Loginpage';
import { LeftsideNavigation } from '../../../../../pages/Navigations/LeftSideNavigation';
import { RooftopNavigation } from '../../../../../pages/Rooftops/RooftopNavigation';
import { InventorySorting } from '../../../../../pages/Rooftops/Inventory/inventory_sorting';

test.setTimeout(300000); // 5 minutes timeout for all validations

test(
    'Data Validation: Inventory Sorting',
    async ({ page }, testInfo) => {

        // ============================================================
        // LOGIN
        // ============================================================

        const loginPage = new Login(page);

        await loginPage.navigateToURL();

        await loginPage.loginByRole(
            'Reseller_Admin' as any
        );

        // ============================================================
        // NAVIGATION TO RESELLER
        // ============================================================

        const navigation = new LeftsideNavigation(page);
        const rooftopNavigation = new RooftopNavigation(page);

        await rooftopNavigation.searchAndOpenRecord(
            AddRooftopData.resellerrooftopname,
            testInfo
        );

        // ============================================================
        // NAVIGATION TO ROOFTOP
        // ============================================================

        await navigation.goToListofRooftops();

        await page.waitForLoadState('networkidle');

        await rooftopNavigation.searchAndOpenRecord(
            AddRooftopData.RooftopInventory,
            testInfo
        );

        // ============================================================
        // NAVIGATION TO INVENTORY
        // ============================================================

        await navigation.goToInventory();

        await page.waitForLoadState('networkidle');

        // ============================================================
        // INVENTORY SORTING VALIDATION
        // ============================================================

        const columnsToTest = [
      'Photos',
      'Added',
      'Updated',
      'In Stock',
      'VIN',
      'Year',
      'Make',
      'Model',
      'Trim',
      'Stock ID',
      'Status',
      'Type',
      'Unpublished'
        ];

        console.log('\n' + '='.repeat(60));
        console.log('        INVENTORY SORTING VALIDATION');
        console.log('='.repeat(60));

        console.log(
            'Testing columns:',
            columnsToTest.join(', ')
        );

        console.log('='.repeat(60));

        const inventorySorting = new InventorySorting(page);

        let allSortingPassed = true;

        const sortingResults: Array<{
            column: string;
            passed: boolean;
            error?: string;
        }> = [];

        // ============================================================
        // VALIDATE EACH COLUMN
        // ============================================================

        for (const columnName of columnsToTest) {

            console.log(
                `\n${'─'.repeat(60)}`
            );

            console.log(
                `Testing sorting for column: ${columnName}`
            );

            console.log(
                `${'─'.repeat(60)}`
            );

            try {

                const result =
                    await inventorySorting.validateColumnSorting(
                        columnName,
                        testInfo
                    );

                sortingResults.push({
                    column: columnName,
                    passed: result.passed,
                    error: result.error
                });

                if (result.passed) {

                    console.log(
                        `✅ ${columnName} sorting PASSED`
                    );

                } else {

                    allSortingPassed = false;

                    console.log(
                        `❌ ${columnName} sorting FAILED`
                    );

                    if (result.error) {
                        console.log(
                            `   Reason: ${result.error}`
                        );
                    }
                }

            } catch (error) {

                const errorMsg =
                    error instanceof Error
                        ? error.message
                        : String(error);

                sortingResults.push({
                    column: columnName,
                    passed: false,
                    error: errorMsg
                });

                allSortingPassed = false;

                console.log(
                    `❌ ${columnName} sorting FAILED`
                );

                console.log(
                    `   Reason: ${errorMsg}`
                );
            }
        }

        // ============================================================
        // FINAL SUMMARY
        // ============================================================

        console.log('\n' + '='.repeat(60));
        console.log('        SORTING VALIDATION SUMMARY');
        console.log('='.repeat(60));

        for (const result of sortingResults) {

            const status = result.passed
                ? 'PASSED'
                : 'FAILED';

            console.log(
                `${result.column.padEnd(15)} - ${status}`
            );

            if (result.error) {
                console.log(
                    `   Error: ${result.error}`
                );
            }
        }

        // ============================================================
        // RESULT COUNT
        // ============================================================

        const passedCount =
            sortingResults.filter(
                result => result.passed
            ).length;

        const failedCount =
            sortingResults.filter(
                result => !result.passed
            ).length;

        console.log('\n' + '='.repeat(60));

        console.log(
            `Total Columns : ${sortingResults.length}`
        );

        console.log(
            `Passed        : ${passedCount}`
        );

        console.log(
            `Failed        : ${failedCount}`
        );

        console.log('='.repeat(60));

        // ============================================================
        // FINAL ASSERTION
        // ============================================================

        expect(
            allSortingPassed,
            'Some sorting validations failed'
        ).toBe(true);
    }
);