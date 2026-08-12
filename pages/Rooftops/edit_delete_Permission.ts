import { Locator, Page, TestInfo } from '@playwright/test';
import { BasePage } from '../BasePage';
import { Reporter } from '../utils/NewReport';

export class RooftopPermission extends BasePage {

    SearchBox: Locator;

    constructor(page: Page) {
        super(page);

        this.SearchBox = page.getByPlaceholder('Search...');
    }

    // Search Rooftop
    async searchRooftop(rooftopName: string): Promise<boolean> {
        try {
            await this.SearchBox.fill('');
            await this.SearchBox.fill(rooftopName);
            await this.page.waitForTimeout(800);

            const row = this.page.locator('table tbody tr');
            return await row.first().isVisible();

        } catch {
            return false;
        }
    }

    // Verify Edit button is NOT available
    async verifyEditButtonNotAvailable(
        rooftopName: string,
        testInfo: TestInfo
    ): Promise<boolean> {

        try {

            const targetRow = this.page.locator('table tbody tr')
                .filter({ hasText: rooftopName });

            const actionsCell = targetRow.locator('td').last();

            const editButton = actionsCell.locator(
                'button svg.lucide-pencil, button svg[class*="pencil"]'
            ).locator('..');

            const editVisible = await editButton.count() > 0;

            Reporter.validateData(
                false,
                editVisible,
                'Verify Edit Permission',
                testInfo
            );

            if (!editVisible) {
                console.log('✅ Edit button is hidden as expected.');
                return true;
            }

            console.log('❌ Edit button is visible.');
            return false;

        } catch (error) {

            console.log(`❌ Error verifying Edit button: ${error}`);

            Reporter.validateData(
                false,
                true,
                'Verify Edit Permission',
                testInfo
            );

            return false;
        }
    }

    // Verify Delete button is NOT available
    async verifyDeleteButtonNotAvailable(
        rooftopName: string,
        testInfo: TestInfo
    ): Promise<boolean> {

        try {

            const targetRow = this.page.locator('table tbody tr')
                .filter({ hasText: rooftopName });

            const actionsCell = targetRow.locator('td').last();

            const deleteButton = actionsCell.locator(
                'button svg.lucide-trash-2, button svg[class*="trash"]'
            ).locator('..');

            const deleteVisible = await deleteButton.count() > 0;

            Reporter.validateData(
                false,
                deleteVisible,
                'Verify Delete Permission',
                testInfo
            );

            if (!deleteVisible) {
                console.log('✅ Delete button is hidden as expected.');
                return true;
            }

            console.log('❌ Delete button is visible.');
            return false;

        } catch (error) {

            console.log(`❌ Error verifying Delete button: ${error}`);

            Reporter.validateData(
                false,
                true,
                'Verify Delete Permission',
                testInfo
            );

            return false;
        }
    }

    // Complete Permission Validation
    async verifyUserPermissions(
        rooftopName: string,
        testInfo: TestInfo
    ): Promise<boolean> {

        Reporter.startTest();

        const rooftopFound = await this.searchRooftop(rooftopName);

        if (!rooftopFound) {

            Reporter.validateData(
                true,
                false,
                'Search Rooftop',
                testInfo
            );

            Reporter.endTest(testInfo);
            return false;
        }

        Reporter.validateData(
            true,
            true,
            'Search Rooftop',
            testInfo
        );

        const editPermission =
            await this.verifyEditButtonNotAvailable(rooftopName, testInfo);

        const deletePermission =
            await this.verifyDeleteButtonNotAvailable(rooftopName, testInfo);

        Reporter.validateData(
            true,
            editPermission && deletePermission,
            'User Permission Validation',
            testInfo
        );

        Reporter.endTest(testInfo);

        return editPermission && deletePermission;
    }
}