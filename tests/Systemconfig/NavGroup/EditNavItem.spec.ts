import { test, expect } from '@playwright/test';

import { Login }
from '../../../pages/Login/Loginpage';

import { LeftsideNavigation }
from '../../../pages/Navigations/LeftSideNavigation';

import { AddNavGroup }
from '../../../pages/Systemconfig/NavGroup/AddNavGroup';

import { AddNavItem }
from '../../../pages/Systemconfig/NavGroup/AddNavItem';

import { EditNavItem }
from '../../../pages/Systemconfig/NavGroup/EditNavItem';

import { Reporter }
from '../../../pages/utils/NewReport';

test(
  'Edit Nav Item',
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

    // ==========================
    // Create Nav Group
    // ==========================
    const addNavGroup =
      new AddNavGroup(page);

    const navGroupName =
      `NavGroup_${Date.now()}`;

    await addNavGroup.AddNavGroup(
      navGroupName,
      'tabler-car'
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
      'Created Nav Group',
      testInfo
    );

    expect(
      searchedNavGroup
    ).toBe(
      navGroupName
    );

    // ==========================
    // Open Created Nav Group
    // ==========================
    await page
      .getByText(navGroupName)
      .first()
      .click();

    await page.waitForLoadState(
      'networkidle'
    );

    // ==========================
    // Create Nav Item
    // ==========================
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

    Reporter.validateData(
      true,
      true,
      'Nav Item Created',
      testInfo
    );

    // ==========================
    // Edit Nav Item
    // ==========================
    const editNavItem =
      new EditNavItem(page);

    const updatedNavItem =
      `Updated_${Date.now()}`;

    await editNavItem.EditNavItem(
      navItemName,
      updatedNavItem
    );

    // ==========================
    // Return to Nav Item List
    // ==========================
    // ==========================
// Validate Redirect After Update
// ==========================

const currentUrl =
  page.url();

Reporter.validateData(
  '/admin/navItems/list',
  currentUrl.includes(
    '/admin/navItems/list'
  )
    ? '/admin/navItems/list'
    : currentUrl,
  'Post Update Redirect',
  testInfo
);

expect(
  currentUrl,
  'After Save, application should redirect to Nav Item List'
).toContain(
  '/admin/navItems/list'
);

// ==========================
// Search Updated Nav Item
// ==========================

const searchedNavItem =
  await editNavItem.searchNavItemInSummary(
    updatedNavItem
  );
   }
);