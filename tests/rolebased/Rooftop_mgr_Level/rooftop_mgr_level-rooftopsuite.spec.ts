import { test, expect } from '@playwright/test';
import { Login } from '../../../pages/Login/Loginpage';
import { LeftsideNavigation } from '../../../pages/Navigations/LeftSideNavigation';
import { RooftopColumns } from '../../../pages/Rooftops/RooftopColumns';
import { logAndValidate } from '../../../utils/reportUtil';
import { RooftopPagination } from '../../../pages/Rooftops/RooftopPagination';
import { Reporter } from '../../../pages/utils/NewReport';
import { RooftopSearch } from '../../../pages/Rooftops/RooftopSearch';
import { RooftopSorting } from '../../../pages/Rooftops/RooftopSorting';


test.describe.configure({ mode: 'parallel' });

test.describe('Rooftop Management', () => {

    test.beforeEach(async ({ page }, testInfo) => {

        const loginPage = new Login(page);
        const navigation = new LeftsideNavigation(page);

        await loginPage.navigateToURL();
      await loginPage.loginByRole('Rooftop_mgr' as any);

        await navigation.goToListofRooftops();
        await page.waitForLoadState('networkidle');
    });

    //==================================================
    // Column Validation
    //==================================================

    test('Verify Rooftop Column Headings', async ({ page }, testInfo) => {

        const rooftopColumns = new RooftopColumns(page);

        const { expectedColumns, actualHeaders } =
            await rooftopColumns.verifyRooftopColumns();

        for (let i = 0; i < expectedColumns.length; i++) {

            logAndValidate({
                step: `Column ${i + 1}`,
                expected: expectedColumns[i],
                actual: actualHeaders[i] || 'Missing'
            }, testInfo);
        }

        expect(actualHeaders).toEqual(expectedColumns);
    });

    //==================================================
    // Pagination
    //==================================================

    test('Verify Rooftop Pagination', async ({ page }, testInfo) => {

        const pagination = new RooftopPagination(page);

        expect(
            await pagination.verifyAllPagination(testInfo)
        ).toBeTruthy();

    });

    //==================================================
    // Search
    //==================================================

    test('Verify Rooftop Search', async ({ page }, testInfo) => {

        Reporter.startTest();

        const search =
            new RooftopSearch(page, testInfo);

        await search.searchByID();
        await search.searchByName();
        await search.searchByDescription();
        await search.searchByCreated();
        await search.invalidSearch();
        await search.searchByNonExistentName();
        await search.searchByNonExistentID();
        await search.searchByStatus();
        await search.searchInactiveStatus();

        Reporter.endTest(testInfo);

        if (search.hasFailures()) {
            throw new Error(search.getFailures().join('\n'));
        }

    });

    //==================================================
    // Sorting
    //==================================================

    test('Verify Rooftop Sorting', async ({ page }, testInfo) => {

        Reporter.startTest();

        const sorting = new RooftopSorting(page);

        const columns = [
            'Rooftop Name',
            'Description',
            'Created',
            'Status'
        ];

        let passed = true;

        for (const column of columns) {

            const result =
                await sorting.validateColumnSorting(
                    column,
                    testInfo
                );

            if (!result.passed)
                passed = false;
        }

        Reporter.endTest(testInfo);

        expect(passed).toBeTruthy();

    });

});