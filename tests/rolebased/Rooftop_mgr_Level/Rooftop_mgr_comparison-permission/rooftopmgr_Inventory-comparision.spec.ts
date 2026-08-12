import { test, expect, type TestInfo } from '@playwright/test';
import { Login } from '../../../../pages/Login/Loginpage';
import { LeftsideNavigation } from '../../../../pages/Navigations/LeftSideNavigation';
import { VehicleLevelVerification } from '../../../../pages/UserAccess/Inventory_comparison';
import { RooftopNavigation } from '../../../../pages/Rooftops/RooftopNavigation';
import rooftopdata from '../../../../testdata/comparison/Rooftopdata.json';


test.describe('Reseller Level Vehicle Permissions', () => {

    test('Verify Reseller Admin 1 and Reseller Admin 2 Vehicle Data', async ({ browser }, testInfo: TestInfo) => {

        // ========================================================
        // RESELLER ADMIN 1
        // ========================================================

        const context1 = await browser.newContext();
        const page1 = await context1.newPage();

        const admin1Login = new Login(page1);
        const navigation1 = new LeftsideNavigation(page1);
        const vehicle1 = new VehicleLevelVerification(page1);

        // Login Reseller Admin 1
        await admin1Login.navigateToURL();
        await admin1Login.loginByRole('Rooftop_mgr' as any);

        console.log('✅ Reseller Manager 1 Login successful');

        // Go to Rooftops
        await navigation1.goToRooftops();
        await page1.waitForTimeout(2000);


        // Search and open Inventory/Rooftop
        const inventoryNavigation1 = new RooftopNavigation(page1);
        await inventoryNavigation1.searchAndOpenRecord(rooftopdata.Rooftopmgr1, testInfo);

        // Go to Inventory
        await navigation1.goToInventory();
        await page1.waitForLoadState('networkidle');

        // Collect Vehicles
        const reseller1Data = await vehicle1.getAllVehicleRecords();

        console.log('');
        console.log('========================================');
        console.log(`Reseller_Admin1 Vehicles: ${reseller1Data.length}`);
        console.log('========================================');

        // Close Admin 1
        await context1.close();


        // ========================================================
        // RESELLER ADMIN 2
        // ========================================================

        const context2 = await browser.newContext();
        const page2 = await context2.newPage();

        const admin2Login = new Login(page2);
        const navigation2 = new LeftsideNavigation(page2);
        const vehicle2 = new VehicleLevelVerification(page2);

        // Login Reseller Admin 2
        await admin2Login.navigateToURL();
        await admin2Login.loginByRole('Rooftop_mgr2' as any);
       
        console.log('Reseller Manager 2 Login successful');

        // Go to Rooftops
        await navigation2.goToRooftops();
          await page2.waitForTimeout(1000);

        // Search and open SAME Inventory/Rooftop
        const inventoryNavigation2 = new RooftopNavigation(page2);
        await inventoryNavigation2.searchAndOpenRecord(rooftopdata.Rooftopmgr2, testInfo);

        // Go to Inventory
        await navigation2.goToInventory();
        await page2.waitForLoadState('networkidle');

        // Collect Vehicles
        const reseller2Data = await vehicle2.getAllVehicleRecords();

        console.log('');
        console.log('========================================');
        console.log(`Reseller_Admin2 Vehicles: ${reseller2Data.length}`);
        console.log('========================================');


        // ========================================================
        // COMPARE
        // ========================================================

        const comparison = vehicle2.compareVehicles(reseller1Data, reseller2Data);

        console.log('');
        console.log('========================================');
        console.log('VEHICLE PERMISSION COMPARISON');
        console.log('========================================');

        console.log(`Reseller_Admin1 Total: ${reseller1Data.length}`);
        console.log(`Reseller_Admin2 Total: ${reseller2Data.length}`);
        console.log(`Common Vehicles: ${comparison.commonVehicles.length}`);
        console.log(`Reseller_Admin1 Only: ${comparison.reseller1Only.length}`);
        console.log(`Reseller_Admin2 Only: ${comparison.reseller2Only.length}`);


        // ========================================================
        // RESELLER ADMIN 1 ONLY
        // ========================================================

        if (comparison.reseller1Only.length > 0) {
            console.log('');
            console.log('❌ Vehicles available only for Reseller_Admin1:');

            for (const vehicle of comparison.reseller1Only) {
                console.log(`VIN: ${vehicle.vin} | Stock ID: ${vehicle.stockId} | Trim: ${vehicle.trim} | Type: ${vehicle.type}`);
            }
        }


        // ========================================================
        // RESELLER ADMIN 2 ONLY
        // ========================================================

        if (comparison.reseller2Only.length > 0) {
            console.log('');
            console.log('❌ Vehicles available only for Reseller_Admin2:');

            for (const vehicle of comparison.reseller2Only) {
                console.log(`VIN: ${vehicle.vin} | Stock ID: ${vehicle.stockId} | Trim: ${vehicle.trim} | Type: ${vehicle.type}`);
            }
        }


        // ========================================================
        // COMMON VEHICLES
        // ========================================================

        if (comparison.commonVehicles.length > 0) {
            console.log('');
            console.log('❌ Common Vehicles found:');

            for (const vehicle of comparison.commonVehicles) {
                console.log(`VIN: ${vehicle.vin} | Stock ID: ${vehicle.stockId} | Trim: ${vehicle.trim} | Type: ${vehicle.type}`);
            }
        }


        // ========================================================
        // VALIDATION
        // ========================================================

        expect(comparison.commonVehicles, 'Same vehicle data is visible to both Reseller Admins').toHaveLength(0);

        expect(reseller1Data.length, 'Reseller Admin 1 has no vehicle data').toBeGreaterThan(0);

        expect(reseller2Data.length, 'Reseller Admin 2 has no vehicle data').toBeGreaterThan(0);


        // ========================================================
        // RESULT
        // ========================================================

        console.log('');
        console.log('========================================');

        if (comparison.commonVehicles.length === 0) {
            console.log('VEHICLE PERMISSION VALIDATION PASSED');
            console.log('No common vehicle data found between both resellers.');
        }

        console.log('========================================');


        // Close Admin 2
        await context2.close();
    });
});