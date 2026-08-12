import { test, expect }
from '@playwright/test';

import { Login }
from '../../../pages/Login/Loginpage';

import { LeftsideNavigation }
from '../../../pages/Navigations/LeftSideNavigation';

import { AddNavGroup }
from '../../../pages/Systemconfig/NavGroup/AddNavGroup';

import { DeleteNavGroup }
from '../../../pages/Systemconfig/NavGroup/DeleteNavGroup';

import { Reporter }
from '../../../pages/utils/NewReport';

test(
  'Verify user can delete Nav Group successfully',
  async ({ page }, testInfo) => {

    test.setTimeout(180000);

    Reporter.startTest();

    // ============================
    // LOGIN
    // ============================

    const loginPage =
      new Login(page);

    await loginPage.navigateToURL();

    await loginPage.loginToApplication();

    // ============================
    // NAVIGATION
    // ============================

    const navigation =
      new LeftsideNavigation(page);

    await navigation.gotoSystemConfig();

    await navigation.gotoNavGroup();

    await page.waitForLoadState(
      'networkidle'
    );

    // ============================
    // CREATE NAV GROUP
    // ============================

    const addNavGroup =
      new AddNavGroup(page);

    const navGroupName =
      `NavGroup_${Date.now()}`;

    const iconName =
      'tabler-car';

    await addNavGroup.AddNavGroup(
      navGroupName,
      iconName
    );

    await page.waitForTimeout(
      1000
    );

    await page.reload();

    await page.waitForLoadState(
      'networkidle'
    );

    const createdNavGroup =
      await addNavGroup.searchNavGroupInSummary(
        navGroupName
      );

    Reporter.validateData(
      navGroupName,
      createdNavGroup,
      'Create Nav Group Validation',
      testInfo
    );

    expect(
      createdNavGroup
    ).toBe(
      navGroupName
    );

    // ============================
    // DELETE NAV GROUP
    // ============================

    const deleteNavGroup =
      new DeleteNavGroup(page);

    const isDeleted =
      await deleteNavGroup.DeleteNavGroup(
        navGroupName
      );

    // ============================
    // DELETE VALIDATION
    // ============================

    Reporter.validateDelete(
      navGroupName,
      isDeleted,
      testInfo
    );

    // ============================
    // FINAL RESULT
    // ============================

    console.log('\n' + '='.repeat(60));

    console.log(
      `FINAL RESULT : ${
        isDeleted
          ? 'PASS ✅'
          : 'FAIL ❌'
      }`
    );

    console.log('='.repeat(60));

    testInfo.annotations.push({
      type: 'Final Result',
      description:
        isDeleted
          ? `Nav Group deleted successfully : ${navGroupName}`
          : `Failed to delete Nav Group : ${navGroupName}`
    });

    Reporter.endTest(
      testInfo
    );

    expect(
      isDeleted,
      'Nav Group should be deleted successfully'
    ).toBeTruthy();
  }
);