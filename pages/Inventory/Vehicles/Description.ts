import { Page, Locator, TestInfo } from '@playwright/test';
import { BasePage } from '../../BasePage';
import { Reporter } from '../../utils/NewReport';

export class InventoryDescription extends BasePage {

    testInfo: TestInfo;

    Descriptionheading: Locator;
    VehicleDescription: Locator;
    Description: Locator;

    constructor(page: Page, testInfo: TestInfo) {
        super(page);

        // Description tab
        this.Descriptionheading = page.getByRole('tab', {
            name: 'Description',
            exact: true
        });

        // Vehicle Description heading
        this.VehicleDescription = page.getByRole('heading', {
            name: 'Vehicle Description',
            exact: true
        });

        // Description content
        this.Description = page.locator(
            '[class="text-sm text-slate-400"]'
        );

        this.testInfo = testInfo;
    }

    async verifyDescription() {

        // ============================================================
        // Step 1: Verify Description tab is visible
        // ============================================================

        await this.Descriptionheading.waitFor({
            state: 'visible',
            timeout: 15000
        });

        // ============================================================
        // Step 2: Click Description tab
        // ============================================================

        await this.Descriptionheading.click();

        await this.page.waitForTimeout(2000);

        // ============================================================
        // Step 3: Validate Description tab heading
        // ============================================================

        const actualDescriptionHeading =
            await this.Descriptionheading.textContent();

        Reporter.validateData(
            'Description',
            actualDescriptionHeading?.trim(),
            'Description Heading',
            this.testInfo
        );

        // ============================================================
        // Step 4: Validate Vehicle Description heading
        // ============================================================

        const actualVehicleDescriptionHeading =
            await this.VehicleDescription.textContent();

        Reporter.validateData(
            'Vehicle Description',
            actualVehicleDescriptionHeading?.trim(),
            'Vehicle Description Heading',
            this.testInfo
        );

        // ============================================================
        // Step 5: Validate Description content
        // ============================================================

        const actualDescriptionText =
            await this.Description.textContent();

        Reporter.validateData(
            'No content available',
            actualDescriptionText?.trim(),
            'Vehicle Description Content',
            this.testInfo
        );
    }
}