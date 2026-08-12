import { Page } from '@playwright/test';

export interface VehicleRecord {
    inStock: string;
    vin: string;
    trim: string;
    stockId: string;
    type: string;
}

export class VehicleLevelVerification {

    private page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    /**
     * Get all vehicle records from all pagination pages.
     *
     * Table columns expected from UI:
     * In Stock | VIN | Trim | Stock ID | Type
     *
     * VIN is used as the unique identifier.
     */
    async getAllVehicleRecords(): Promise<VehicleRecord[]> {

        const allVehicles: VehicleRecord[] = [];

        let currentPage = 1;

        while (true) {

            console.log(`📄 Reading Vehicle page ${currentPage}`);

            // ---------------------------------------------------------
            // Wait for table
            // ---------------------------------------------------------

            const table = this.page.locator('table').first();

            await table.waitFor({
                state: 'visible',
                timeout: 30000
            });

            // ---------------------------------------------------------
            // Get headers
            // ---------------------------------------------------------

            const headers = table.locator('thead tr th');

            const headerCount = await headers.count();

            let inStockColumnIndex = -1;
            let vinColumnIndex = -1;
            let trimColumnIndex = -1;
            let stockIdColumnIndex = -1;
            let typeColumnIndex = -1;

            // ---------------------------------------------------------
            // Find column indexes dynamically
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
                    headerText === 'in stock' ||
                    headerText.includes('in stock')
                ) {
                    inStockColumnIndex = i;
                }

                else if (
                    headerText === 'vin' ||
                    headerText.includes('vin')
                ) {
                    vinColumnIndex = i;
                }

                else if (
                    headerText === 'trim' ||
                    headerText.includes('trim')
                ) {
                    trimColumnIndex = i;
                }

                else if (
                    headerText === 'stock id' ||
                    headerText.includes('stock id')
                ) {
                    stockIdColumnIndex = i;
                }

                else if (
                    headerText === 'type' ||
                    headerText.includes('type')
                ) {
                    typeColumnIndex = i;
                }
            }

            // ---------------------------------------------------------
            // Validate required VIN column
            // ---------------------------------------------------------

            if (vinColumnIndex === -1) {

                throw new Error(
                    'VIN column was not found in Vehicle table'
                );
            }

            console.log(
                `✅ VIN column found at index: ${vinColumnIndex}`
            );

            // ---------------------------------------------------------
            // Get rows
            // ---------------------------------------------------------

            const rows = table.locator('tbody tr');

            const rowCount = await rows.count();

            console.log(
                `Vehicles found on page ${currentPage}: ${rowCount}`
            );

            if (rowCount === 0) {

                console.log(
                    'ℹ️ No vehicle records found.'
                );

                break;
            }

            // ---------------------------------------------------------
            // Read vehicle records
            // ---------------------------------------------------------

            for (let i = 0; i < rowCount; i++) {

                const cells =
                    rows.nth(i).locator('td');

                const cellCount =
                    await cells.count();

                if (vinColumnIndex >= cellCount) {
                    continue;
                }

                const getCellText = async (
                    columnIndex: number
                ): Promise<string> => {

                    if (
                        columnIndex === -1 ||
                        columnIndex >= cellCount
                    ) {
                        return '';
                    }

                    return (
                        await cells
                            .nth(columnIndex)
                            .innerText()
                    ).trim();
                };

                const inStock =
                    await getCellText(inStockColumnIndex);

                const vin =
                    await getCellText(vinColumnIndex);

                const trim =
                    await getCellText(trimColumnIndex);

                const stockId =
                    await getCellText(stockIdColumnIndex);

                const type =
                    await getCellText(typeColumnIndex);

                // -----------------------------------------------------
                // Ignore empty VIN
                // -----------------------------------------------------

                if (
                    !vin ||
                    vin === '-' ||
                    vin.toLowerCase() === 'n/a'
                ) {
                    continue;
                }

                const vehicle: VehicleRecord = {
                    inStock,
                    vin,
                    trim,
                    stockId,
                    type
                };

                allVehicles.push(vehicle);

                console.log(
                    `   VIN: ${vin} | Stock ID: ${stockId}`
                );
            }

            // ---------------------------------------------------------
            // Find pagination buttons
            //
            // Screenshot has:
            // <<   <   1   2   >   >>
            // ---------------------------------------------------------

            const paginationButtons =
                this.page.locator(
                    'button, a'
                );

            const buttonCount =
                await paginationButtons.count();

            let nextButtonIndex = -1;

            for (let i = 0; i < buttonCount; i++) {

                const button =
                    paginationButtons.nth(i);

                const text =
                    (
                        await button.innerText()
                            .catch(() => '')
                    )
                    .trim();

                const ariaLabel =
                    (
                        await button.getAttribute(
                            'aria-label'
                        )
                    )?.trim() || '';

                const title =
                    (
                        await button.getAttribute(
                            'title'
                        )
                    )?.trim() || '';

                const combined =
                    `${text} ${ariaLabel} ${title}`
                        .toLowerCase();

                // -----------------------------------------------------
                // Look for Next button
                // -----------------------------------------------------

                if (
                    combined.includes('next') ||
                    text === '>' ||
                    text === '›' ||
                    text === '→'
                ) {

                    nextButtonIndex = i;
                }
            }

            // ---------------------------------------------------------
            // Next button not found
            // ---------------------------------------------------------

            if (nextButtonIndex === -1) {

                console.log(
                    'ℹ️ Next page button not found.'
                );

                break;
            }

            const nextButton =
                paginationButtons.nth(
                    nextButtonIndex
                );

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

            const className =
                await nextButton.getAttribute(
                    'class'
                );

            const isClassDisabled =
                className
                    ?.toLowerCase()
                    .includes('disabled') || false;

            if (
                disabled ||
                ariaDisabled === 'true' ||
                isClassDisabled
            ) {

                console.log(
                    'ℹ️ Last vehicle page reached.'
                );

                break;
            }

            // ---------------------------------------------------------
            // Save first row before clicking
            // ---------------------------------------------------------

            const firstRowBefore =
                (
                    await rows
                        .first()
                        .innerText()
                ).trim();

            // ---------------------------------------------------------
            // Click next
            // ---------------------------------------------------------

            await nextButton.click();

            // ---------------------------------------------------------
            // Wait for table update
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

                // Fallback
                await this.page.waitForTimeout(1000);
            }

            currentPage++;
        }

        // ---------------------------------------------------------
        // Remove duplicate VINs
        // ---------------------------------------------------------

        const uniqueVehicles: VehicleRecord[] = [];

        const existingVINs =
            new Set<string>();

        for (const vehicle of allVehicles) {

            if (!existingVINs.has(vehicle.vin)) {

                existingVINs.add(vehicle.vin);

                uniqueVehicles.push(vehicle);
            }
        }

        console.log(
            `✅ Total unique vehicles collected: ${uniqueVehicles.length}`
        );

        return uniqueVehicles;
    }

    /**
     * Get only VINs.
     *
     * Useful when you only want to compare
     * whether the same vehicles are visible.
     */
    getVINs(
        vehicles: VehicleRecord[]
    ): string[] {

        return [
            ...new Set(
                vehicles.map(
                    vehicle => vehicle.vin
                )
            )
        ];
    }

    /**
     * Get records that exist in first reseller
     * but do NOT exist in second reseller.
     */
    getRecordsOnlyInFirst(
        firstVehicles: VehicleRecord[],
        secondVehicles: VehicleRecord[]
    ): VehicleRecord[] {

        const secondVINs =
            new Set(
                secondVehicles.map(
                    vehicle => vehicle.vin
                )
            );

        return firstVehicles.filter(
            vehicle =>
                !secondVINs.has(vehicle.vin)
        );
    }

    /**
     * Get records that exist in second reseller
     * but do NOT exist in first reseller.
     */
    getRecordsOnlyInSecond(
        firstVehicles: VehicleRecord[],
        secondVehicles: VehicleRecord[]
    ): VehicleRecord[] {

        const firstVINs =
            new Set(
                firstVehicles.map(
                    vehicle => vehicle.vin
                )
            );

        return secondVehicles.filter(
            vehicle =>
                !firstVINs.has(vehicle.vin)
        );
    }

    /**
     * Get common vehicles between both resellers.
     */
    getCommonVehicles(
        firstVehicles: VehicleRecord[],
        secondVehicles: VehicleRecord[]
    ): VehicleRecord[] {

        const secondVINs =
            new Set(
                secondVehicles.map(
                    vehicle => vehicle.vin
                )
            );

        return firstVehicles.filter(
            vehicle =>
                secondVINs.has(vehicle.vin)
        );
    }

    /**
     * Compare both reseller vehicle lists.
     */
    compareVehicles(
        reseller1Vehicles: VehicleRecord[],
        reseller2Vehicles: VehicleRecord[]
    ) {

        const reseller1Only =
            this.getRecordsOnlyInFirst(
                reseller1Vehicles,
                reseller2Vehicles
            );

        const reseller2Only =
            this.getRecordsOnlyInSecond(
                reseller1Vehicles,
                reseller2Vehicles
            );

        const commonVehicles =
            this.getCommonVehicles(
                reseller1Vehicles,
                reseller2Vehicles
            );

        return {
            reseller1Only,
            reseller2Only,
            commonVehicles,
            isSame:
                reseller1Only.length === 0 &&
                reseller2Only.length === 0
        };
    }
}