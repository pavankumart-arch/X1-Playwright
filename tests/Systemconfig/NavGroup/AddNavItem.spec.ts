import { test, expect } from '@playwright/test';

import { Login }
from '../../../pages/Login/Loginpage';

import { LeftsideNavigation }
from '../../../pages/Navigations/LeftSideNavigation';

import { AddNavGroup }
from '../../../pages/Systemconfig/NavGroup/AddNavGroup';

import { AddNavItem }
from '../../../pages/Systemconfig/NavGroup/AddNavItem';

import { Reporter }
from '../../../pages/utils/NewReport';

test(
  'Add New Nav Item',
  async ({ page }, testInfo) => {

    test.setTimeout(180000);

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

    // =========================
    // CREATE NAV GROUP
    // =========================

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

    await page.waitForTimeout(1000);

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
      'Created Nav Group Validation',
      testInfo
    );

    expect(
      searchedNavGroup
    ).toBe(
      navGroupName
    );

    // =========================
    // OPEN NAV GROUP
    // =========================

    await page
      .getByText(navGroupName)
      .first()
      .click();

    await page.waitForLoadState(
      'networkidle'
    );

    // =========================
    // CREATE NAV ITEM
    // =========================

    const addNavItem =
      new AddNavItem(page);

    const navItemName =
      `NavItem_${Date.now()}`;

    await addNavItem.AddNavItem(
      navItemName,
      '1',
      'Default'
    );

    await page.waitForLoadState(
      'networkidle'
    );

    console.log(
      `✅ Nav Item Created: ${navItemName}`
    );

    // =========================
    // URL VALIDATION
    // =========================

    const currentUrl =
      page.url();

    Reporter.validateData(
      true,
      currentUrl.includes('/admin/navItems'),
      'Nav Item Redirect Validation',
      testInfo
    );

    // =========================
    // FINAL RESULT
    // =========================

    testInfo.annotations.push({
      type: 'Final Result',
      description:
        `Nav Item Created Successfully : ${navItemName}`
    });

    Reporter.endTest(
      testInfo
    );

    expect(
      currentUrl
    ).toContain(
      '/admin/navItems'
    );
  }
);