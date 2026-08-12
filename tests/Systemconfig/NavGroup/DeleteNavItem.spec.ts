import { test, expect } from '@playwright/test';

import { Login }
from '../../../pages/Login/Loginpage';

import { LeftsideNavigation }
from '../../../pages/Navigations/LeftSideNavigation';

import { AddNavGroup }
from '../../../pages/Systemconfig/NavGroup/AddNavGroup';

import { AddNavItem }
from '../../../pages/Systemconfig/NavGroup/AddNavItem';

import { DeleteNavItem }
from '../../../pages/Systemconfig/NavGroup/DeleteNavItem';

import { Reporter }
from '../../../pages/utils/NewReport';



test(
  'Delete Nav Item',
  async ({ page }, testInfo) => {

    test.setTimeout(180000);

    Reporter.startTest();


    // ==========================
    // LOGIN
    // ==========================
    const loginPage =
      new Login(page);

    await loginPage.navigateToURL();

    await loginPage.loginToApplication();

    // ==========================
    // NAVIGATION
    // ==========================
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

    // ==========================
    // SEARCH NAV GROUP
    // ==========================
    await page
      .getByPlaceholder('Search...')
      .first()
      .fill(navGroupName);

    await page.waitForTimeout(2000);

    const navGroupRow =
      page.locator('table tbody tr')
        .filter({
          has: page.locator('td', {
            hasText: navGroupName
          })
        });

    await expect(
      navGroupRow.first()
    ).toBeVisible();

    await navGroupRow
      .locator('td')
      .first()
      .click();

    await page.waitForLoadState(
      'networkidle'
    );

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
    // DELETE NAV ITEM
    // ==========================
    const deleteNavItem =
      new DeleteNavItem(page);

    await deleteNavItem.DeleteNavItem(
      navItemName
    );

    const isDeleted =
      await deleteNavItem.verifyDeleted(
        navItemName
      );

    // ==========================
    // REPORTING
    // ==========================
    Reporter.validateDelete(
      navItemName,
      isDeleted,
      testInfo
    );

    console.log('\n' + '='.repeat(60));

    console.log(
      `FINAL RESULT : ${
        isDeleted
          ? 'PASS ✅'
          : 'FAIL ❌'
      }`
    );

    console.log('='.repeat(60));

    Reporter.endTest(
      testInfo
    );

    // ==========================
    // ASSERTION
    // ==========================
    expect(
      isDeleted,
      'Nav Item should be deleted successfully'
    ).toBeTruthy();
  }
);