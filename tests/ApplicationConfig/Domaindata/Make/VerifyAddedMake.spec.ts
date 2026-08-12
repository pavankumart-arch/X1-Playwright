import { test, expect } from '@playwright/test';
import { Login } from '../../../../pages/Login/Loginpage';
import { LeftsideNavigation } from '../../../../pages/Navigations/LeftSideNavigation';
import { AddMake } from '../../../../pages/ApplicationConfig/DomainData/Make/AddMake';
import { UpdateMake } from '../../../../pages/ApplicationConfig/DomainData/Make/UpdateMakets';
import { DeleteMake } from '../../../../pages/ApplicationConfig/DomainData/Make/DeleteMake';
import { Reporter } from '../../../../pages/utils/NewReport';

test.describe('Verify Update Make functionality', () => {
  test('Verify make can be edited and updated', async ({ page }, testInfo) => {
    Reporter.startTest();
    
    const login = new Login(page);
    const navigation = new LeftsideNavigation(page);
    const addMake = new AddMake(page);
    const updateMake = new UpdateMake(page);
    const deleteMake = new DeleteMake(page);

    // LOGIN
    await login.navigateToURL();
    await login.loginToApplication();

    // NAVIGATION
    await navigation.gotoApplicationConfig();
    await navigation.goToDomainData();

    // ADD A MAKE FIRST
    const addedMakeName = await addMake.addMake(testInfo);
    await addMake.verifyAddedMakeIsDisplayed(testInfo);

    // VERIFY BY EDITING (COMPARE ADDED MAKE NAME WITH EDIT FIELD)
    const isVerified = await updateMake.verifyMakeByEditing(addedMakeName, testInfo);
    expect(isVerified).toBeTruthy();

    Reporter.endTest(testInfo);
  });
})