import { test, expect }
from '@playwright/test';

import { Login }
from '../../../pages/Login/Loginpage';

import { LeftsideNavigation }
from '../../../pages/Navigations/LeftSideNavigation';

import { AddNavGroup }
from '../../../pages/Systemconfig/NavGroup/AddNavGroup';

import { AddNavItem }
from '../../../pages/Systemconfig/NavGroup/AddNavItem';

import { CancelDeleteNavItem }
from '../../../pages/Systemconfig/NavGroup/CancelDeleteNavItem';

import { Reporter }
from '../../../pages/utils/NewReport';

test(
  'Cancel Delete Nav Item',
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

    // ==========================
    // CREATE NAV GROUP
    // ==========================

    const addNavGroup =
      new AddNavGroup(page);

    const navGroupName =
      `NavGroup_${Date.now()}`;

    await addNavGroup.AddNavGroup(
      navGroupName,
      'tabler-car'
    );

    await page.reload();

    await page.waitForLoadState(
      'networkidle'
    );

    await page
      .getByPlaceholder('Search...')
      .first()
      .fill(navGroupName);

    await page.waitForTimeout(
      2000
    );

    const navGroupRow =
      page.locator('table tbody tr')
        .filter({
          has: page.locator('td', {
            hasText: navGroupName
          })
        });

    await navGroupRow
      .locator('td')
      .first()
      .click();

    // ==========================
    // CREATE NAV ITEM
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

    // ==========================
    // CANCEL DELETE
    // ==========================

    const cancelDelete =
      new CancelDeleteNavItem(page);

    const stillExists =
      await cancelDelete.CancelDeleteNavItem(
        navItemName
      );

    Reporter.validateData(
      true,
      stillExists,
      'Cancel Delete Nav Item Validation',
      testInfo
    );

    Reporter.endTest(
      testInfo
    );

    expect(
      stillExists,
      'Nav Item should still exist after Cancel'
    ).toBeTruthy();
  }
);