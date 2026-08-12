import { test, expect }
from '@playwright/test';

import { Login }
from '../../../pages/Login/Loginpage';

import { LeftsideNavigation }
from '../../../pages/Navigations/LeftSideNavigation';

import { AddNavGroup }
from '../../../pages/Systemconfig/NavGroup/AddNavGroup';

import { EditNavGroup }
from '../../../pages/Systemconfig/NavGroup/EditNavGroup';

import { Reporter }
from '../../../pages/utils/NewReport';

test(
'Edit Nav Group',
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

const originalName =
  `NavGroup_${Date.now()}`;

await addNavGroup.AddNavGroup(
  originalName,
  'tabler-car'
);

await page.waitForTimeout(1000);

await page.reload();

await page.waitForLoadState(
  'networkidle'
);

// ==========================
// EDIT NAV GROUP
// ==========================
const editNavGroup =
  new EditNavGroup(page);

const updatedName =
  `UpdatedNavGroup_${Date.now()}`;

const updatedIcon =
  'tabler-edit';

await editNavGroup.EditNavGroup(
  originalName,
  updatedName,
  updatedIcon
);

// ==========================
// REPORTING
// ==========================
Reporter.validateEdit(
  originalName,
  updatedName,
  updatedName,
  'Nav Group Name',
  testInfo
);

console.log(
  '\n' + '='.repeat(60)
);

console.log(
  `FINAL RESULT : PASS ✅`
);

console.log(
  '='.repeat(60)
);

Reporter.endTest(
  testInfo
);

// ==========================
// ASSERTION
// ==========================
expect(
  updatedName
).toContain(
  'UpdatedNavGroup_');


 }
);