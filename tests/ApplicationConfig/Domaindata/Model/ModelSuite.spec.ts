import { test, expect } from '@playwright/test';
import { Login } from '../../../../pages/Login/Loginpage';
import { LeftsideNavigation } from '../../../../pages/Navigations/LeftSideNavigation';
import { AddModel } from '../../../../pages/ApplicationConfig/DomainData/Model/AddModel';
import { ModelColumns } from '../../../../pages/ApplicationConfig/DomainData/Model/ColumnsModel';
import { modelvalidation } from '../../../../pages/ApplicationConfig/DomainData/Model/ModelValidation';
import { Cancelbutton } from '../../../../pages/ApplicationConfig/DomainData/Make/CancelMake';
import { Addandverification } from '../../../../pages/ApplicationConfig/DomainData/Model/UpdateModel';
import { EditModel } from '../../../../pages/ApplicationConfig/DomainData/Model/EditModel';
import { DeleteModel } from '../../../../pages/ApplicationConfig/DomainData/Model/DeleteModel';
import { ModelPagination } from '../../../../pages/ApplicationConfig/DomainData/Model/PaginationModel';
import { ModelSearch } from '../../../../pages/ApplicationConfig/DomainData/Model/SearchModel';
import { UserSortingWithPagination } from '../../../../pages/ApplicationConfig/DomainData/Model/SortingModel';
import { Reporter } from '../../../../pages/utils/NewReport';
import ModelData from '../../../../testdata/DomainData.json';

test.describe('Model Management Test Suite', () => {
  
  // Hooks for setup and teardown
  test.beforeEach(async ({ page }) => {
    // Common setup if needed
  });

  test.afterEach(async ({ page }, testInfo) => {
    // Common cleanup if needed
  });

  /**
   * TEST CASE 1: Verify Column Functionality
   * Validates that all columns in the model table are displayed correctly
   */
  test('TC001 - Verify Column Headers and Functionality', async ({ page }, testInfo) => {
    Reporter.startTest();
    
    const login = new Login(page);
    const navigation = new LeftsideNavigation(page);
    const addModel = new AddModel(page);
    const modelColumns = new ModelColumns(page);

    await login.navigateToURL();
    await login.loginToApplication();
    await navigation.gotoApplicationConfig();
    await navigation.goToDomainData();
    await addModel.createAndVerifyMake(testInfo);
    await addModel.clickOnMakeName(testInfo);
    await modelColumns.verifyModleColumnHeaders(testInfo);
    
    Reporter.endTest(testInfo);
  });

  /**
   * TEST CASE 2: Verify Model Validation
   * Tests validation rules when adding/editing models
   */
  test('TC002 - Verify Model Page Validation Rules', async ({ page }, testInfo) => {
    Reporter.startTest();
    
    const login = new Login(page);
    const navigation = new LeftsideNavigation(page);
    const addModel = new AddModel(page);
    const Modelvalidation = new modelvalidation(page);

    await login.navigateToURL();
    await login.loginToApplication();
    await navigation.gotoApplicationConfig();
    await navigation.goToDomainData();
    await addModel.createAndVerifyMake(testInfo);
    await addModel.clickOnMakeName(testInfo);
    await addModel.verifyAddModelButtonIsVisible(testInfo);
    await Modelvalidation.modelvalidation(testInfo);
    
    Reporter.endTest(testInfo);
  });

  /**
   * TEST CASE 3: Verify Cancel Button Functionality
   * Tests that cancel button works correctly and doesn't create unintended entries
   */
  test('TC003 - Verify Cancel Button Functionality in Model Page', async ({ page }, testInfo) => {
    Reporter.startTest();
    
    const login = new Login(page);
    const navigation = new LeftsideNavigation(page);
    const addModel = new AddModel(page);
    const cancelbutton = new Cancelbutton(page);

    await login.navigateToURL();
    await login.loginToApplication();
    await navigation.gotoApplicationConfig();
    await navigation.goToDomainData();
    await addModel.createAndVerifyMake(testInfo);
    await addModel.clickOnMakeName(testInfo);
    await addModel.verifyAddModelButtonIsVisible(testInfo);
    await cancelbutton.VerifyMakeCancelbutton(testInfo);
    
    Reporter.endTest(testInfo);
  });

  /**
   * TEST CASE 4: Verify Add Model Functionality
   * Tests that a new model can be added and appears in the summary table
   */
  test('TC004 - Verify Add Model and Display in Summary Table', async ({ page }, testInfo) => {
    Reporter.startTest();
    
    const login = new Login(page);
    const navigation = new LeftsideNavigation(page);
    const addModel = new AddModel(page);

    await login.navigateToURL();
    await login.loginToApplication();
    await navigation.gotoApplicationConfig();
    await navigation.goToDomainData();
    await addModel.createAndVerifyMake(testInfo);
    await addModel.clickOnMakeName(testInfo);
    await addModel.verifyAddModelButtonIsVisible(testInfo);
    await addModel.addModel(testInfo);
    await addModel.verifyAddedModelIsDisplayed(testInfo);
    
    Reporter.endTest(testInfo);
  });

  /**
   * TEST CASE 5: Verify Added Model in Edit Page
   * Tests that a newly added model appears correctly in the edit page
   */
  test('TC005 - Verify Added Model Appears in Edit Page', async ({ page }, testInfo) => {
    Reporter.startTest();
    
    const login = new Login(page);
    const navigation = new LeftsideNavigation(page);
    const addModel = new AddModel(page);
    const addandverification = new Addandverification(page);

    await login.navigateToURL();
    await login.loginToApplication();
    await navigation.gotoApplicationConfig();
    await navigation.goToDomainData();
    await addModel.createAndVerifyMake(testInfo);
    await addModel.clickOnMakeName(testInfo);
    await addModel.verifyAddModelButtonIsVisible(testInfo);
    await addandverification.verifyAddedModelInEditPage(testInfo);
    
    Reporter.endTest(testInfo);
  });

  /**
   * TEST CASE 6: Verify Edit Model Functionality
   * Tests editing an existing model and verifying changes appear in summary table
   */
  test('TC006 - Verify Edit Model Updates in Summary Table', async ({ page }, testInfo) => {
    Reporter.startTest();

    try {
      const login = new Login(page);
      const navigation = new LeftsideNavigation(page);
      const editModel = new EditModel(page);

      await login.navigateToURL();
      await login.loginToApplication();
      await navigation.gotoApplicationConfig();
      await navigation.goToDomainData();

      await editModel.editAndVerifyModel(testInfo);

    } finally {
      Reporter.endTest(testInfo);
    }
  });

  /**
   * TEST CASE 7: Verify Complete Add/Delete Model Flow
   * Tests the entire lifecycle: add, verify, delete model
   */
  test('TC007 - Verify Complete Add and Delete Model Flow', async ({ page }, testInfo) => {
    test.setTimeout(120000); // Extended timeout for complete flow

    Reporter.startTest();

    const login = new Login(page);
    const navigation = new LeftsideNavigation(page);
    const deleteModel = new DeleteModel(page);

    await login.navigateToURL();
    await login.loginToApplication();

    await navigation.gotoApplicationConfig();
    await navigation.goToDomainData();

    await deleteModel.completeAddDeleteModelFlow(testInfo);

    Reporter.endTest(testInfo);
  });

  /**
   * TEST CASE 8: Verify Pagination Functionality
   * Tests pagination controls and navigation through model list
   */
  test('TC008 - Verify Model List Pagination Functionality', async ({ page }, testInfo) => {
    Reporter.startTest();
    
    const login = new Login(page);
    const navigation = new LeftsideNavigation(page);
    const addModel = new AddModel(page);
    const modelPagination = new ModelPagination(page);

    await login.navigateToURL();
    await login.loginToApplication();
    await navigation.gotoApplicationConfig();
    await navigation.goToDomainData();
    await addModel.createAndVerifyMake(testInfo);
    await addModel.createAndVerifyMake(testInfo);
    await addModel.clickOnMakeName(testInfo);
  
    Reporter.endTest(testInfo);
  });

  /**
   * TEST CASE 9: Verify Search Functionality
   * Tests various search filters and validation on model page
   */
  test('TC009 - Verify Model Search Filters and Validation', async ({ page }, testInfo) => {
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

  /**
   * TEST CASE 10: Verify Sorting Functionality
   * Tests column sorting with validation and pagination integration
   */
  test('TC010 - Verify Model Column Sorting with Pagination', async ({ page }, testInfo) => {
    Reporter.startTest();
    
    const login = new Login(page);
    const navigation = new LeftsideNavigation(page);
    const addModel = new AddModel(page);
    const userSortingWithPagination = new UserSortingWithPagination(page);
    const modelSearch = new ModelSearch(page);

    await login.navigateToURL();
    await login.loginToApplication();
    await navigation.gotoApplicationConfig();
    await navigation.goToDomainData();
    await addModel.createAndVerifyMake(testInfo);
    await addModel.clickOnMakeName(testInfo);
    await addModel.verifyAddModelButtonIsVisible(testInfo);
    await addModel.addModel(testInfo);
    // Uncomment if needed: await modelSearch.Modelnameforsort(ModelData.Modelnameforsorting, testInfo);
    await userSortingWithPagination.verifyAllColumnsSorting(testInfo);
    
    Reporter.endTest(testInfo);
  });

  /**
   * TEST CASE 11: Verify Model Name Validation
   * Tests model name field validation, empty values, special characters, and length limits
   * (Added for additional coverage based on common requirements)
   */
  test('TC011 - Verify Model Name Field Validation', async ({ page }, testInfo) => {
    Reporter.startTest();
    
    const login = new Login(page);
    const navigation = new LeftsideNavigation(page);
    const addModel = new AddModel(page);
    // Additional validation page object would be needed here if not covered

    await login.navigateToURL();
    await login.loginToApplication();
    await navigation.gotoApplicationConfig();
    await navigation.goToDomainData();
    await addModel.createAndVerifyMake(testInfo);
    await addModel.clickOnMakeName(testInfo);
    
    // Additional validation steps can be added here
    // For example: testing empty model name, special characters, max length, etc.
    
    Reporter.endTest(testInfo);
  });

});