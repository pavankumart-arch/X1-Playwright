import { test } from '@playwright/test';
import { Login } from '../../../../pages/Login/Loginpage';
import { LeftsideNavigation } from '../../../../pages/Navigations/LeftSideNavigation';
import { ResellerPermission } from '../../../../pages/UserAccess/UserPermission';



test.describe('User Level Permissions', () => {

    test(
        'Verify Reseller Admin 1 and Reseller Admin 2 User IDs and Edit URLs',
        async ({ browser }) => {

            // ========================================================
            // RESELLER ADMIN 1
            // ========================================================

            const context1 = await browser.newContext();

            const page1 = await context1.newPage();

            const login1 = new Login(page1);

            const navigation1 =
                new LeftsideNavigation(page1);

            const permission1 =
                new ResellerPermission(page1);


            // Login Admin 1
             
      const admin1Login =
        new Login(page1);

      await admin1Login.navigateToURL();
           await admin1Login.loginByRole('Rooftop_mgr' as any);

            console.log(
                '✅ Reseller Admin 1 Login successful'
            );


            // Go to Users

            await navigation1.goToUsers();


            // Collect Users

            const admin1Data =
                await permission1
                    .getAllIdsAndEditUrlsFromPagination();


            console.log('');
            console.log('========================================');

            console.log(
                `Reseller_Admin1 User IDs: ${
                    admin1Data.ids.length > 0
                        ? admin1Data.ids.join(', ')
                        : 'No data available'
                }`
            );

            console.log('');

            console.log(
                'Reseller_Admin1 EditURLs:'
            );

            for (const url of admin1Data.editUrls) {
                console.log(url);
            }

            console.log('');

            console.log(
                `Total Reseller_Admin1 Users: ${
                    admin1Data.ids.length
                }`
            );

            console.log(
                '========================================'
            );


            // Close Admin 1

            await context1.close();


            // ========================================================
            // RESELLER ADMIN 2
            // ========================================================

            const context2 = await browser.newContext();

            const page2 = await context2.newPage();

            const login2 = new Login(page2);

            const navigation2 =
                new LeftsideNavigation(page2);

            const permission2 =
                new ResellerPermission(page2);


            // Login Admin 2

            const admin2Login = new Login(page2);

            await admin2Login.navigateToURL();
            await admin2Login.loginByRole('Rooftop_mgr2' as any);

            console.log(
                '✅ Reseller Admin 2 Login successful'
            );


            // Go to Users

            await navigation2.goToUsers();


            // Collect Users

            const admin2Data =
                await permission2
                    .getAllIdsAndEditUrlsFromPagination();


            console.log('');
            console.log('========================================');

            console.log(
                `Reseller_Admin2 User IDs: ${
                    admin2Data.ids.length > 0
                        ? admin2Data.ids.join(', ')
                        : 'No data available'
                }`
            );

            console.log('');

            console.log(
                'Reseller_Admin2 EditURLs:'
            );

            for (const url of admin2Data.editUrls) {
                console.log(url);
            }

            console.log('');

            console.log(
                `Total Reseller_Admin2 Users: ${
                    admin2Data.ids.length
                }`
            );

            console.log(
                '========================================'
            );


            // ========================================================
            // COMPARE + VALIDATE
            // ========================================================

            permission1.printComparisonResult(
                admin1Data,
                admin2Data
            );


            permission1.assertNoCommonAccess(
                admin1Data,
                admin2Data
            );


            // ========================================================
            // CLOSE ADMIN 2
            // ========================================================

            await context2.close();
        }
    );

});