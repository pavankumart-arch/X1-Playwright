import { test, expect } from '@playwright/test';
import { Login } from '../../../../pages/Login/Loginpage';
import { LeftsideNavigation } from '../../../../pages/Navigations/LeftSideNavigation';
import { rooftopmgr_rooftopverification } from '../../../../pages/UserAccess/Rooftop_mgr_Rooftops_comparison';
import { logAndValidate } from '../../../../utils/reportUtil';


test.describe.configure({
    mode: 'parallel'
});


test.describe(
    'Reseller Manager Level Permissions',
    () => {

        test(
            'Verify Reseller Manager 1 and Reseller Manager 2 Reseller IDs',
            async ({ browser }) => {

                test.setTimeout(180000);


                // =====================================================
                // RESELLER MANAGER 1
                // =====================================================

                console.log('');
                console.log(
                    '========================================'
                );

                console.log(
                    '🔐 LOGIN: RESELLER MANAGER 1'
                );

                console.log(
                    '========================================'
                );


                const context1 =
                    await browser.newContext();

                const page1 =
                    await context1.newPage();


                const login1 =
                    new Login(page1);

                const navigation1 =
                    new LeftsideNavigation(page1);

                /*
                 * IMPORTANT:
                 *
                 * Create an instance of
                 * rooftopmgr_rooftopverification.
                 *
                 * Do NOT call:
                 *
                 * rooftopmgr_rooftopverification
                 *     .getAllIdsFromPagination()
                 *
                 * because getAllIdsFromPagination()
                 * is not static.
                 */
                const permission1 =
                    new rooftopmgr_rooftopverification(page1);


                // -----------------------------------------------------
                // Login Manager 1
                // -----------------------------------------------------

                await login1.navigateToURL();

                await login1.loginByRole(
                    'Rooftop_mgr' as any
                );

                console.log(
                    '✅ Reseller Manager 1 Login successful'
                );


                // -----------------------------------------------------
                // Navigate to Resellers
                // -----------------------------------------------------
                //
                // If your LeftsideNavigation has this method,
                // uncomment the following line:
                //
                // await navigation1.goToResellers();
                //
                // -----------------------------------------------------

                await page1.waitForLoadState(
                    'domcontentloaded'
                );


                // -----------------------------------------------------
                // Get all Reseller IDs
                // -----------------------------------------------------

                const manager1Ids =
                    await permission1.getAllIdsFromPagination();


                // -----------------------------------------------------
                // Display Manager 1 IDs
                // -----------------------------------------------------

                console.log('');
                console.log(
                    '========================================'
                );

                console.log(
                    '📋 Reseller_Manager1 IDs'
                );

                console.log(
                    '========================================'
                );

                console.log(
                    manager1Ids.length > 0
                        ? manager1Ids.join(', ')
                        : 'No data available'
                );

                console.log(
                    `Total Reseller_Manager1 Resellers: ${manager1Ids.length}`
                );

                console.log(
                    '========================================'
                );


                // -----------------------------------------------------
                // Close Manager 1 context
                // -----------------------------------------------------

                await context1.close();


                // =====================================================
                // RESELLER MANAGER 2
                // =====================================================

                console.log('');
                console.log(
                    '========================================'
                );

                console.log(
                    '🔐 LOGIN: RESELLER MANAGER 2'
                );

                console.log(
                    '========================================'
                );


                const context2 =
                    await browser.newContext();

                const page2 =
                    await context2.newPage();


                const login2 =
                    new Login(page2);

                const navigation2 =
                    new LeftsideNavigation(page2);


                /*
                 * Create a separate instance for Manager 2.
                 *
                 * This instance contains page2.
                 */
                const permission2 =
                    new rooftopmgr_rooftopverification(page2);


                // -----------------------------------------------------
                // Login Manager 2
                // -----------------------------------------------------

                await login2.navigateToURL();

                await login2.loginByRole(
                    'Rooftop_mgr2' as any
                );

                console.log(
                    '✅ Reseller Manager 2 Login successful'
                );


                // -----------------------------------------------------
                // Navigate to Resellers
                // -----------------------------------------------------
                //
                // If your LeftsideNavigation has this method,
                // uncomment the following line:
                //
                // await navigation2.goToResellers();
                //
                // -----------------------------------------------------

                await page2.waitForLoadState(
                    'domcontentloaded'
                );


                // -----------------------------------------------------
                // Get all Reseller IDs
                // -----------------------------------------------------

                const manager2Ids =
                    await permission2.getAllIdsFromPagination();


                // -----------------------------------------------------
                // Display Manager 2 IDs
                // -----------------------------------------------------

                console.log('');
                console.log(
                    '========================================'
                );

                console.log(
                    '📋 Reseller_Manager2 IDs'
                );

                console.log(
                    '========================================'
                );

                console.log(
                    manager2Ids.length > 0
                        ? manager2Ids.join(', ')
                        : 'No data available'
                );

                console.log(
                    `Total Reseller_Manager2 Resellers: ${manager2Ids.length}`
                );

                console.log(
                    '========================================'
                );


                // =====================================================
                // COMPARE IDs
                // =====================================================

                /*
                 * Find IDs that are available to both users.
                 *
                 * If Manager 2 should NOT have access to Manager 1's
                 * Resellers, there should be ZERO common IDs.
                 */

                const commonIds =
                    permission2.getCommonIds(
                        manager1Ids,
                        manager2Ids
                    );


                // =====================================================
                // FINAL RESULT
                // =====================================================

                const permissionFailed =
                    commonIds.length > 0;


                console.log('');
                console.log(
                    '========================================'
                );

                console.log(
                    '🔍 PERMISSION VALIDATION'
                );

                console.log(
                    '========================================'
                );


                console.log(
                    'Verify Reseller Manager 2 cannot access Reseller Manager 1 Resellers'
                );


                console.log('');

                console.log(
                    `Reseller_Manager1 IDs: ${
                        manager1Ids.length > 0
                            ? manager1Ids.join(', ')
                            : 'No data available'
                    }`
                );


                console.log('');

                console.log(
                    `Reseller_Manager2 IDs: ${
                        manager2Ids.length > 0
                            ? manager2Ids.join(', ')
                            : 'No data available'
                    }`
                );


                console.log('');

                console.log(
                    `Common IDs: ${
                        commonIds.length > 0
                            ? commonIds.join(', ')
                            : 'None'
                    }`
                );


                console.log('');

                console.log(
                    'Expected: Reseller_Manager2 should not have access to Reseller_Manager1 Resellers'
                );


                console.log('');

                console.log(
                    `Actual: ${
                        permissionFailed
                            ? 'Common Reseller IDs found'
                            : 'No common Reseller IDs found'
                    }`
                );


                console.log('');

                console.log(
                    `Status: ${
                        permissionFailed
                            ? 'FAILED ❌'
                            : 'PASSED ✅'
                    }`
                );


                console.log(
                    '========================================'
                );


                // =====================================================
                // REPORT
                // =====================================================

                await logAndValidate({

                    step:
                        'Verify Reseller Manager 2 cannot access Reseller Manager 1 Resellers',

                    expected:
                        false,

                    actual:
                        permissionFailed

                });


                // =====================================================
                // ASSERTION
                // =====================================================

                expect(
                    permissionFailed,
                    `Reseller_Manager2 has access to Reseller_Manager1 Resellers. Common IDs: ${commonIds.join(', ')}`
                ).toBe(false);


                // =====================================================
                // CLOSE MANAGER 2
                // =====================================================

                await context2.close();

            }
        );

    }
);