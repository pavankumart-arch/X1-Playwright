import { test } from '@playwright/test';
import { Login } from '../../../../pages/Login/Loginpage';
import { LeftsideNavigation } from '../../../../pages/Navigations/LeftSideNavigation';
import { AddModel } from '../../../../pages/ApplicationConfig/DomainData/Model/AddModel';
import { ModelSearch } from '../../../../pages/ApplicationConfig/DomainData/Model/SearchModel';
import { Reporter } from '../../../../pages/utils/NewReport';


test.describe('Verify the Search functionality', () => {
  test('Verify Search functionality for Model page', async ({ page }, testInfo) => {
    Reporter.startTest();
    
    const login = new Login(page);
    const navigation = new LeftsideNavigation(page);
    const addModel = new AddModel(page);
    const modelSearch = new ModelSearch(page);

    await login.navigateToURL();
    await login.loginToApplication();
    await navigation.gotoApplicationConfig();
    await navigation.goToDomainData();
 
    await addModel.createAndVerifyMake(testInfo);
    await addModel.clickOnMakeName(testInfo);
    await addModel.verifyAddModelButtonIsVisible(testInfo);
    await addModel.addModel(testInfo);


    await modelSearch.searchByID(testInfo);
    await modelSearch.searchByModelName(testInfo);
    await modelSearch.searchByCreatedDate(testInfo);
    await modelSearch.searchByStatus(testInfo);
    await modelSearch.invalidNameSearch(testInfo);
    
    Reporter.endTest(testInfo);
  });
});