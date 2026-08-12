import { test } from '@playwright/test';

import { Login } from '../../../pages/Login/Loginpage';
import { LeftsideNavigation } from '../../../pages/Navigations/LeftSideNavigation';
import { Taxonomy } from '../../../pages/Systemconfig/Taxonomy/AddAppType';
import appTypeData from "../../../testdata/Systemconfig/AddAppType.json";

test("Verify AppType creation and validation", async ({ page }) => {

    const loginPage = new Login(page);
    const navigation = new LeftsideNavigation(page);
    const taxonomy = new Taxonomy(page);

    await loginPage.navigateToURL();

    await loginPage.loginToApplication();

    await navigation.gotoSystemConfig();

    await navigation.goToTaxonomy();

    await navigation.goToAppTypes();

    await navigation.AddAppType();

    const data = appTypeData.AppType1;

    await taxonomy.AddAppType(
        data.Title,
        data.Type
    );

    await taxonomy.validateCreatedAppType(
        data.Title
    );
});