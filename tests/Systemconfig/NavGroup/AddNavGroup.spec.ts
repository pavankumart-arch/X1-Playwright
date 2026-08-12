import { test, expect } from '@playwright/test';

import { Login }
from '../../../pages/Login/Loginpage';

import { LeftsideNavigation }
from '../../../pages/Navigations/LeftSideNavigation';

import { AddNavGroup }
from '../../../pages/Systemconfig/NavGroup/AddNavGroup';

import { Reporter }
from '../../../pages/utils/NewReport';

test(
  'Add New Nav Group',
  async ({ page }, testInfo) => {

    Reporter.startTest();

    

    const loginPage =
      new Login(page);

    await loginPage.navigateToURL();

    await loginPage.loginToApplication();

    const navigation =
      new LeftsideNavigation(page);

    await navigation.gotoSystemConfig();

    await navigation.gotoNavGroup();

    await page.waitForLoadState(
      'networkidle'
    );

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

    await page.reload();

    await page.waitForLoadState(
      'networkidle'
    );

    const searchedNavGroup =
      await addNavGroup.searchNavGroupInSummary(
        navGroupName
      );

    Reporter.validateData(
      navGroupName,
      searchedNavGroup,
      'Nav Group Name',
      testInfo
    );

    expect(
      searchedNavGroup
    ).toBe(
      navGroupName
    );

    Reporter.endTest(testInfo);
  }
);