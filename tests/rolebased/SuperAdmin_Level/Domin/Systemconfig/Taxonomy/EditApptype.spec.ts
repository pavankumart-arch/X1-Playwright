import { test } from '@playwright/test';
import { EditAppType } from '../../../pages/Systemconfig/Taxonomy/EditAppType';
import { Login } from '../../../pages/Login/Loginpage';
import { LeftsideNavigation } from '../../../pages/Navigations/LeftSideNavigation';
import { Taxonomy } from '../../../pages/Systemconfig/Taxonomy/AddAppType';

test('Verify user can edit App Type successfully', async ({ page }) => {

    const loginPage = new Login(page);

    const navigation = new LeftsideNavigation(page);

    const editAppType = new EditAppType(page);
    const taxonomy = new Taxonomy(page);

    await loginPage.navigateToURL();

    await loginPage.loginToApplication();

    await navigation.gotoSystemConfig();

    await navigation.goToTaxonomy();

    await navigation.goToAppTypes();
    await navigation.AddAppType();
    await page.waitForTimeout(1000);
    await taxonomy.AddAppType(
        'AppType21',
        'Type21'
    );
    await page.waitForTimeout(1000);

    // Existing AppType
    const existingAppType = 'AppType21';

    // Updated values
    const updatedTitle = 'UpdatedAppType21';

    const updatedType = 'UpdatedType21';

    await editAppType.EditAppType(
        existingAppType,
        updatedTitle,
        updatedType
    );

});