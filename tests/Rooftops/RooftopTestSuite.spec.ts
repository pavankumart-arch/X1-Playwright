import { test, expect } from '@playwright/test';

import { Login } from '../../pages/Login/Loginpage';
import { LeftsideNavigation } from '../../pages/Navigations/LeftSideNavigation';

import { RooftopNavigation } from '../../pages/Rooftops/RooftopNavigation';
import { RooftopColumns } from '../../pages/Rooftops/RooftopColumns';
import { validateAddRooftopForm } from '../../pages/Rooftops/AddRooftopValidation';
import { VerifyRooftopCancelButton } from '../../pages/Rooftops/CancelRooftop';
import { AddRooftop } from '../../pages/Rooftops/AddRooftop';
import { UpdatedRooftop } from '../../pages/Rooftops/VerifyAddedRooftop';
import { EditRooftop } from '../../pages/Rooftops/EdtiRooftop';
import { DeleteRooftop } from '../../pages/Rooftops/DeleteRooftop';
import { RooftopPagination } from '../../pages/Rooftops/RooftopPagination';
import { RooftopSearch } from '../../pages/Rooftops/RooftopSearch';
import { RooftopSorting } from '../../pages/Rooftops/RooftopSorting';

import { Reporter } from '../../pages/utils/NewReport';
import { logAndValidate } from '../../utils/reportUtil';

import AddRooftopData from '../../testdata/AddRooftopData.json';

test.describe.configure({ mode: 'parallel' });

test.describe('Rooftop Management', () => {

    test.beforeEach(async ({ page }, testInfo) => {

        const loginPage = new Login(page);
        const navigation = new LeftsideNavigation(page);

        await loginPage.navigateToURL();
        await loginPage.loginToApplication();

        await navigation.goToDashboard();
        await page.waitForLoadState('networkidle');

        await navigation.goToResellers();
        await page.waitForLoadState('networkidle');

        const rooftopNavigation = new RooftopNavigation(page);

        await rooftopNavigation.searchAndOpenRecord(
            AddRooftopData.rooftopname,
            testInfo
        );

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
    // Form Validation
    //==================================================

    test('Validate Add Rooftop Form', async ({ page }, testInfo) => {

        const form = new validateAddRooftopForm(page, testInfo);

        const result = await form.validateAddRooftopForm();

        expect(result).toBeTruthy();
    });

    //==================================================
    // Cancel Button
    //==================================================

    test('Verify Rooftop Cancel Button', async ({ page }, testInfo) => {

        const cancel = new VerifyRooftopCancelButton(page);

        expect(await cancel.VerifyRooftopCancelButton(testInfo))
            .toBeTruthy();
    });

    //==================================================
    // Add Rooftop
    //==================================================

    test('Verify Add Rooftop', async ({ page }, testInfo) => {

        const add = new AddRooftop(page);

        const result =
            await add.addAndVerifyRooftop(testInfo);

        expect(result.success).toBeTruthy();
    });

    //==================================================
    // Verify Rooftop
    //==================================================

    test('Verify Added Rooftop', async ({ page }, testInfo) => {

        Reporter.startTest();

        const add = new AddRooftop(page);

        const rooftopName =
            await add.AddRooftop(testInfo);

        await page.reload();

        const verify = new UpdatedRooftop(page);

        await verify.OpenRooftopView(rooftopName, testInfo);
        await verify.VerifyRooftopDetails(rooftopName, testInfo);

        Reporter.endTest(testInfo);
    });

    //==================================================
    // Edit Rooftop
    //==================================================

    test('Edit Rooftop', async ({ page }, testInfo) => {

        test.setTimeout(180000);

        const edit = new EditRooftop(page);

        let edited = '';

        try {

            const result =
                await edit.addAndEditRooftop(testInfo);

            edited = result.editedName;

            expect(result.editSuccess).toBeTruthy();

        } finally {

            if (edited) {
                await edit.deleteRooftop(edited, testInfo);
            }

        }

    });

    //==================================================
    // Delete Rooftop
    //==================================================

    test('Delete Rooftop', async ({ page }, testInfo) => {

        const add = new AddRooftop(page);
        const del = new DeleteRooftop(page);

        const rooftop =
            await add.AddRooftop(
                testInfo,
                `Rooftop_${Date.now()}`
            );

        await page.reload();

        const result =
            await del.DeleteRooftop(rooftop, testInfo);

        expect(result.deletePassed).toBeTruthy();
        expect(result.verificationPassed).toBeTruthy();
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

        const sorting =
            new RooftopSorting(page);

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