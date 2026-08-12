import {
    Page,
    Locator,
    TestInfo
} from '@playwright/test';

import { BasePage } from '../../BasePage';
import { Reporter } from '../../utils/NewReport';

export class InventoryOptions extends BasePage {

    testInfo: TestInfo;

    Optionsheading: Locator;
    VehicleOptionsEquipment: Locator;
    table: Locator;

    constructor(
        page: Page,
        testInfo: TestInfo
    ) {

        super(page);

        this.testInfo = testInfo;

        // ============================================================
        // Options Tab
        // ============================================================

        this.Optionsheading = page.getByRole('tab', {
            name: 'Options',
            exact: true
        });

        // ============================================================
        // Vehicle Options / Equipment Heading
        // ============================================================

        this.VehicleOptionsEquipment = page.getByRole(
            'heading',
            {
                name: 'Vehicle Options / Equipment',
                exact: true
            }
        );

        // ============================================================
        // Options Table
        // ============================================================

        this.table = page.locator('table');
    }

    // ============================================================
    // Verify Options
    // ============================================================

    async verifyOptions(): Promise<void> {

        // IMPORTANT:
        // Do NOT search VIN here.
        // VIN has already been searched in the test spec.
        // We are already on the Vehicle Details page.

        console.log('Waiting for Options tab...');

        await this.Optionsheading.waitFor({
            state: 'visible',
            timeout: 15000
        });

        console.log('Options tab is visible');

        // ============================================================
        // Click Options Tab
        // ============================================================

        console.log('Clicking Options tab...');

        await this.Optionsheading.click();

        console.log('Options tab clicked');

        // Wait for Options content to load
        await this.VehicleOptionsEquipment.waitFor({
            state: 'visible',
            timeout: 15000
        });

        // ============================================================
        // Options Heading Validation
        // ============================================================

        const actualOptionsHeading =
            await this.Optionsheading.textContent();

        Reporter.validateData(
            'Options',
            actualOptionsHeading?.trim(),
            'Options Heading',
            this.testInfo
        );

        // ============================================================
        // Vehicle Options / Equipment Heading Validation
        // ============================================================

        const actualVehicleOptionsEquipmentHeading =
            await this.VehicleOptionsEquipment.textContent();

        Reporter.validateData(
            'Vehicle Options / Equipment',
            actualVehicleOptionsEquipmentHeading?.trim(),
            'Vehicle Options / Equipment Heading',
            this.testInfo
        );
    }

    // ============================================================
    // Verify Options Table Columns
    // ============================================================

    async verifyTableColumns() {

        console.log('Waiting for Options table...');

        await this.table.waitFor({
            state: 'visible',
            timeout: 15000
        });

        await this.page.waitForLoadState('networkidle');

        const headers = this.page.locator(
            'table thead th'
        );

        const expectedColumns = [
            'Id',
            'Name',
            'Star',
            'Rank',
            'Created',
            'Updated'
        ];

        const actualHeaders =
            (await headers.allTextContents())
                .map(header => header.trim())
                .filter(header => header !== '');

        console.log(
            'Expected Options columns:',
            expectedColumns.join(', ')
        );

        console.log(
            'Actual Options columns:',
            actualHeaders.join(', ')
        );

        Reporter.validateColumns(
            expectedColumns,
            actualHeaders,
            this.testInfo,
            'Options Table Columns'
        );

        return {
            expectedColumns,
            actualHeaders
        };
    }
}