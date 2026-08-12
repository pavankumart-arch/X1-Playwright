import { test, expect } from '@playwright/test';
import { Login } from '../../../../pages/Login/Loginpage';
import { LeftsideNavigation } from '../../../../pages/Navigations/LeftSideNavigation';
import { AddModel } from '../../../../pages/ApplicationConfig/DomainData/Model/AddModel';
import { UserSortingWithPagination } from '../../../../pages/ApplicationConfig/DomainData/Model/SortingModel';
import { Reporter } from '../../../../pages/utils/NewReport';
import { ModelSearch } from '../../../../pages/ApplicationConfig/DomainData/Model/SearchModel';
import ModelData from '../../../../testdata/DomainData.json';


test.describe('Verify Model Page Functionality', () => {
  test('Verify the validation and sorting functionality for the model page', async ({ page }, testInfo) => {
    Reporter.startTest();
    
    const login = new Login(page);
    const navigation = new LeftsideNavigation(page);
    const addModel = new AddModel(page);
    const userSortingWithPagination = new UserSortingWithPagination(page);
    const modelSearch=new ModelSearch(page);

    await login.navigateToURL();
    await login.loginToApplication();
    await navigation.gotoApplicationConfig();
    await navigation.goToDomainData();
    await addModel.createAndVerifyMake(testInfo);
    await addModel.clickOnMakeName(testInfo);
    await addModel.verifyAddModelButtonIsVisible(testInfo);
    await addModel.addModel(testInfo);
    // await modelSearch.Modelnameforsort(ModelData.Modelnameforsorting,testInfo)
   
   await userSortingWithPagination.verifyAllColumnsSorting(testInfo);
    
    Reporter.endTest(testInfo);
  });
});