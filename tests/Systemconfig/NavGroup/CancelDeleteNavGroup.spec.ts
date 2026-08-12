import { test, expect }
from '@playwright/test';

import { Login }
from '../../../pages/Login/Loginpage';

import { LeftsideNavigation }
from '../../../pages/Navigations/LeftSideNavigation';

import { AddNavGroup }
from '../../../pages/Systemconfig/NavGroup/AddNavGroup';

import { CancelDeleteNavGroup }
from '../../../pages/Systemconfig/NavGroup/CancelDeleteNavGroup';

import { Reporter }
from '../../../pages/utils/NewReport';

test(
  'Verify user can cancel Nav Group deletion',
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

    const cancelDelete =
      new CancelDeleteNavGroup(page);

    const exists =
      await cancelDelete.CancelDeleteNavGroup(
        navGroupName
      );

    Reporter.validateData(
      true,
      exists,
      'Cancel Delete Validation',
      testInfo
    );

    testInfo.annotations.push({
      type: 'Final Result',
      description:
        exists
          ? `Delete cancelled successfully : ${navGroupName}`
          : `Cancel delete validation failed : ${navGroupName}`
    });

    Reporter.endTest(
      testInfo
    );

    expect(
      exists
    ).toBeTruthy();
  }
);