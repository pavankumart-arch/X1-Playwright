import { test } from '@playwright/test';
import { Login } from '../../../../../pages/Login/Loginpage';
import { LeftsideNavigation } from '../../../../../pages/Navigations/LeftSideNavigation';
import { RooftopNavigation } from '../../../../../pages/Rooftops/RooftopNavigation';
import { InventorySearch } from '../../../../../pages/Rooftops/Inventory/inventory_search';
import AddRooftopData from '../../../../../testdata/AddRooftopData.json';

test.setTimeout(120000); // 2 minutes timeout

test(
    'Data Validation: Inventory Search',
    async ({ page }, testInfo) => {
        // ============================================================
        // LOGIN
        // ============================================================

        const loginPage = new Login(page);
        await loginPage.navigateToURL();
        await loginPage.loginByRole('Rooftop_mgr' as any);
        // ============================================================
        // NAVIGATION TO PREMIER AUTO GROUP
        // ============================================================

        const navigation = new LeftsideNavigation(page);
        const rooftopNavigation = new RooftopNavigation(page);


        await rooftopNavigation.searchAndOpenRecord(
            AddRooftopData.resellerrooftopname,
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
        // INVENTORY SEARCH VALIDATION
        // ============================================================

        const inventorySearch = new InventorySearch(page, testInfo);

        // Validate all searchable columns including Status and Type variants
        await inventorySearch.validateAllSearches();

        // Validate invalid search
        await inventorySearch.validateInvalidSearch();
    }
);