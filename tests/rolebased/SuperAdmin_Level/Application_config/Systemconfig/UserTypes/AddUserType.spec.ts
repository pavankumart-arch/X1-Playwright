import {
  test,
  expect,
  TestInfo
} from '@playwright/test';
 
import { Login }
  from '../../../pages/Login/Loginpage';
 
import { LeftsideNavigation }
  from '../../../pages/Navigations/LeftSideNavigation';
 
import { AddUserType }
  from '../../../pages/Systemconfig/UserTypes/AddUserType';
 

 
import { Reporter }
  from '../../../pages/utils/NewReport';
 
test(
  'Add New User Type',
  async ({ page }, testInfo: TestInfo) => {
 
    Reporter.startTest();
 
    try {
 
    
      // =========================================
      // LOGIN
      // =========================================
 
      const loginPage =
        new Login(page);
 
      await loginPage.navigateToURL();
 
      await loginPage.loginToApplication();
 
      // =========================================
      // NAVIGATION
      // =========================================
 
      const navigation =
        new LeftsideNavigation(page);
 
      await navigation.gotoSystemConfig();
 
      await navigation.gotoAddUserType();
 
      await page.waitForLoadState(
        'domcontentloaded'
      );
 
      // =========================================
      // ADD USER TYPE
      // =========================================
 
      const addUserType =
        new AddUserType(page);
 
      const userType =
        `UserType_${Date.now()}`;
 
      const typeKey =
        `type_${Date.now()}`;
 
      const createdUserType =
        await addUserType.AddUserType(
          userType,
          typeKey
        );
 
      console.log(
        'Created User Type:',
        createdUserType
      );
 
      // =========================================
      // VALIDATION
      // =========================================
 
      Reporter.validateData(
        true,
        !!createdUserType,
        'Add User Type Validation',
        testInfo
      );
 
      expect(
        createdUserType
      ).toBeTruthy();
 
      // =========================================
      // OPTIONAL REFRESH
      // =========================================
 
      await page.reload();
 
      await page.waitForLoadState(
        'domcontentloaded'
      );
 
      /*
      // =========================================
      // SEARCH VALIDATION (OPTIONAL)
      // =========================================
 
      const searchedUserType =
        await addUserType.searchUserTypeInSummary(
          userType
        );
 
      Reporter.validateData(
        userType,
        searchedUserType,
        'Summary - Add User Type Status',
        testInfo
      );
 
      expect(
        searchedUserType
      ).toBe(
        userType
      );
      */
 
    } finally {
 
      Reporter.endTest(
        testInfo
      );
    }
  }
);