import { test, expect } from '@playwright/test';
import { DeleteAppType } from '../../../pages/Systemconfig/Taxonomy/DeleteAppType';
import { Login } from '../../../pages/Login/Loginpage';
import { LeftsideNavigation } from '../../../pages/Navigations/LeftSideNavigation';
import { Taxonomy } from '../../../pages/Systemconfig/Taxonomy/AddAppType';

  test('Verify user can delete App Type successfully', async ({ page }) => {
                 const loginPage = new Login(page);
              const navigation = new LeftsideNavigation(page);
              const taxonomy = new Taxonomy(page);
          
              await loginPage.navigateToURL();
          
              await loginPage.loginToApplication();
          
              await navigation.gotoSystemConfig();
          
              await navigation.goToTaxonomy();
          
              await navigation.goToAppTypes();

    await page.waitForLoadState('networkidle');

// Wait for page load
    await page.waitForLoadState('networkidle');

    // Create page object
    const deleteAppType = new DeleteAppType(page);

    // App Type Name
    const appTypeName = 'AppType12';

    // STEP 1 - Search App Type
    const searchResult =
      await deleteAppType.searchAppTypeInSummary(appTypeName);

    expect(searchResult).toBeTruthy();

    // STEP 2 - Click Delete Button
    const deleteButtonClicked =
      await deleteAppType.clickDeleteButton(appTypeName);

    expect(deleteButtonClicked).toBeTruthy();

    // STEP 3 - Confirm Delete
    const confirmed =
      await deleteAppType.confirmDeletion();

    expect(confirmed).toBeTruthy();

    // STEP 4 - Verify Deletion
    const verification =
      await deleteAppType.verifyAppTypeDeleted(appTypeName);

    expect(verification).toBeTruthy();

    console.log('\n✅ Delete App Type Test Passed');

  });
