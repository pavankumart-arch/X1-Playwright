import { test, expect } from '@playwright/test';
import { Login } from '../../../../pages/Login/Loginpage';
import { LeftsideNavigation } from '../../../../pages/Navigations/LeftSideNavigation';
import { logAndValidate } from '../../../../utils/reportUtil';
import { RooftopLevelPermissions } from '../../../../pages/UserAccess/ResellerPermission';

test.describe.configure({ mode: 'parallel' });

test.describe('Rooftop Level Permissions', () => {

  test(
    'Verify Reseller Admin 1 and Reseller Admin 2 Rooftop IDs and Edit URLs',
    async ({ browser }) => {

      /*
       * 60 Rooftops + Edit URL verification
       * for both users.
       */
      test.setTimeout(180000);


      // =========================================================
      // RESELLER ADMIN 1
      // =========================================================

      const admin1Context =
        await browser.newContext();

      const admin1Page =
        await admin1Context.newPage();

      const admin1Login =
        new Login(admin1Page);

      const admin1Navigation =
        new LeftsideNavigation(admin1Page);

      const admin1Permissions =
        new RooftopLevelPermissions(admin1Page);


      await admin1Login.navigateToURL();

      await admin1Login.loginByRole(
        'Reseller_Admin' as any
      );

      await admin1Navigation.goToListofRooftops();

      await admin1Page.waitForLoadState(
        'domcontentloaded'
      );


      // Get Admin 1 IDs + Edit URLs
      const resellerAdmin1 =
        await admin1Permissions
          .getAllIdsAndEditUrlsFromPagination();


      const resellerAdmin1Ids =
        resellerAdmin1.ids;

      const resellerAdmin1EditUrls =
        resellerAdmin1.editUrls;


      // =========================================================
      // ADMIN 1 OUTPUT
      // =========================================================

      console.log(
        `Reseller_Admin IDs: ${resellerAdmin1Ids.join(', ')}`
      );

      console.log(
        `Reseller_Admin EditURLs: ${resellerAdmin1EditUrls.join(', ')}`
      );


      // =========================================================
      // RESELLER ADMIN 2
      // =========================================================

      const admin2Context =
        await browser.newContext();

      const admin2Page =
        await admin2Context.newPage();

      const admin2Login =
        new Login(admin2Page);

      const admin2Navigation =
        new LeftsideNavigation(admin2Page);

      const admin2Permissions =
        new RooftopLevelPermissions(admin2Page);


      await admin2Login.navigateToURL();

      await admin2Login.loginByRole(
        'Reseller_Admin2' as any
      );

      await admin2Navigation.goToListofRooftops();

      await admin2Page.waitForLoadState(
        'domcontentloaded'
      );


      // Get Admin 2 IDs + Edit URLs
      const resellerAdmin2 =
        await admin2Permissions
          .getAllIdsAndEditUrlsFromPagination();


      const resellerAdmin2Ids =
        resellerAdmin2.ids;

      const resellerAdmin2EditUrls =
        resellerAdmin2.editUrls;


      // =========================================================
      // ADMIN 2 OUTPUT
      // =========================================================

      console.log(
        `Reseller_Admin2 IDs: ${resellerAdmin2Ids.join(', ')}`
      );

      console.log(
        `Reseller_Admin2 EditURLs: ${resellerAdmin2EditUrls.join(', ')}`
      );


      // =========================================================
      // FIND COMMON ROOFTOP IDs
      // =========================================================

      const commonIds =
        resellerAdmin2Ids.filter(id =>
          resellerAdmin1Ids.includes(id)
        );


      // =========================================================
      // FIND COMMON EDIT URLs
      // =========================================================

      const commonEditUrls =
        resellerAdmin2EditUrls.filter(url =>
          resellerAdmin1EditUrls.includes(url)
        );


      // =========================================================
      // PERMISSION VALIDATION
      //
      // Admin 2 must NOT have any Rooftop ID
      // belonging to Admin 1.
      //
      // Admin 2 must NOT have any Edit URL
      // belonging to Admin 1.
      //
      // Common ID OR URL found
      //      => FAILED
      //
      // No common ID AND URL
      //      => PASSED
      // =========================================================

      const permissionFailed =
        commonIds.length > 0 ||
        commonEditUrls.length > 0;


      // =========================================================
      // EXPECTED / ACTUAL / STATUS
      // =========================================================

      const expected =
        'Reseller_Admin2 should not have access to Reseller_Admin1 rooftops';

      const actual =
        permissionFailed
          ? 'Common Rooftop IDs or Edit URLs found'
          : 'No common Rooftop IDs or Edit URLs found';

      const status =
        permissionFailed
          ? 'FAILED'
          : 'PASSED';


      console.log(`Expected: ${expected}`);
      console.log(`Actual: ${actual}`);
      console.log(`Status: ${status}`);


      // =========================================================
      // SHOW COMMON IDs / URLs ONLY IF FOUND
      // =========================================================

      if (commonIds.length > 0) {

        console.log(
          `Common Rooftop IDs: ${commonIds.join(', ')}`
        );
      }


      if (commonEditUrls.length > 0) {

        console.log(
          `Common Edit URLs: ${commonEditUrls.join(', ')}`
        );
      }


      // =========================================================
      // REPORT
      // =========================================================

      await logAndValidate({
        step:
          'Verify Reseller Admin 2 cannot access Reseller Admin 1 Rooftops',

        expected: false,

        actual: permissionFailed,
      });


      // =========================================================
      // TEST ASSERTION
      // =========================================================

      expect(permissionFailed).toBe(false);


      // =========================================================
      // CLOSE BROWSER CONTEXTS
      // =========================================================

      await admin1Context.close();

      await admin2Context.close();

    }
  );

});