import { expect, Page } from '@playwright/test';

export class InventoryNavigation {

    private page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    /**
     * Search for a rooftop and navigate to its Vehicle List page.
     *
     * @param rooftopName - Name of the rooftop to search and click
     */
    async NavigatetoInventorypage(rooftopName: string): Promise<void> {

        // 1. Search box
        const searchBox = this.page.getByPlaceholder('Search...');

        await expect(searchBox).toBeVisible();

        // 2. Search for the requested rooftop
        await searchBox.fill(rooftopName);

        // 3. Find the table row containing the rooftop name
        const rooftopRow = this.page
            .locator('tr')
            .filter({ hasText: rooftopName });

        // 4. Wait until the row is displayed
        await expect(rooftopRow).toBeVisible();

        // 5. Find Rooftop Name inside the matching row
        const rooftopLink = rooftopRow
            .getByRole('link', { name: rooftopName });

        // 6. Wait until Rooftop Name is displayed
        await expect(rooftopLink).toBeVisible();

        // 7. Click Rooftop Name
        await rooftopLink.click();

        // 8. Wait for Vehicle List page
        await this.page.waitForURL(
            /\/admin\/vehicle\/list\?currentRooftopId=\d+/
        );
    }
}