import { test, expect } from '@playwright/test';
import AddRooftopData from '../../../testdata/AddRooftopData.json';
import { Login } from '../../../pages/Login/Loginpage';
import { LeftsideNavigation } from '../../../pages/Navigations/LeftSideNavigation';
import { RooftopNavigation } from '../../../pages/Rooftops/RooftopNavigation';
import { InventorySorting } from '../../../pages/Rooftops/Inventory/inventory_sorting';

test.setTimeout(300000); // 5 minutes timeout for all validations

test(
    'Data Validation: Inventory Sorting',
    async ({ page }, testInfo) => {
        // ============================================================
        // LOGIN
        // ============================================================

        const loginPage = new Login(page);
        await loginPage.navigateToURL();
        await loginPage.loginToApplication();

        // ============================================================
        // NAVIGATION TO PREMIER AUTO GROUP
        // ============================================================

        const navigation = new LeftsideNavigation(page);
        const rooftopNavigation = new RooftopNavigation(page);

        await navigation.goToDashboard();
        await page.waitForLoadState('networkidle');

        await navigation.goToResellers();
        await page.waitForLoadState('networkidle');

        await rooftopNavigation.searchAndOpenRecord(
            AddRooftopData.rooftopname,
            testInfo
        );

        // ============================================================
        // NAVIGATION TO PREMIER TOYOTA DOWNTOWN
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
            'VIN',
            'Year',
            'Make',
            'Model',
            'Trim',
            'Stock ID',
            'Status',
            'Type'
        ];

        console.log('\n' + '='.repeat(60));
        console.log('🔍 INVENTORY SORTING VALIDATION');
        console.log('='.repeat(60));
        console.log('📊 Testing columns:', columnsToTest.join(', '));
        console.log('📄 Selecting 100 rows per page before sorting');
        console.log('='.repeat(60));

        const inventorySorting = new InventorySorting(page);
        let allSortingPassed = true;
        const sortingResults: Array<{ column: string; passed: boolean; error?: string }> = [];

        for (const columnName of columnsToTest) {
            console.log(`\n${'─'.repeat(60)}`);
            console.log(`🔎 Testing sorting for column: ${columnName}`);
            console.log(`${'─'.repeat(60)}`);

            try {
                const result = await inventorySorting.validateColumnSorting(
                    columnName,
                    testInfo
                );

                sortingResults.push({
                    column: columnName,
                    passed: result.passed,
                    error: result.error
                });

                if (!result.passed) {
                    allSortingPassed = false;
                    console.log(`❌ ${columnName} sorting FAILED: ${result.error}`);
                } else {
                    console.log(`✅ ${columnName} sorting PASSED`);
                }

            } catch (error) {
                const errorMsg = error instanceof Error ? error.message : String(error);
                sortingResults.push({
                    column: columnName,
                    passed: false,
                    error: errorMsg
                });
                allSortingPassed = false;
                console.log(`❌ ${columnName} sorting FAILED with exception: ${errorMsg}`);
            }
        }

        // ============================================================
        // FINAL SUMMARY
        // ============================================================

        console.log('\n' + '='.repeat(60));
        console.log('📊 SORTING VALIDATION SUMMARY');
        console.log('='.repeat(60));

        for (const result of sortingResults) {
            console.log(
                `   ${result.passed ? '✅' : '❌'} ${result.column.padEnd(15)} - ${result.passed ? 'PASSED' : 'FAILED'}`
            );
            if (result.error) {
                console.log(`      Error: ${result.error}`);
            }
        }

        console.log('\n' + '='.repeat(60));
        console.log(
            `📈 Sorting: ${sortingResults.filter(r => r.passed).length}/${sortingResults.length} validations passed`
        );
        console.log('='.repeat(60) + '\n');

        // Assert all sorting tests passed
        expect(allSortingPassed, 'Some sorting validations failed').toBe(true);
    }
);