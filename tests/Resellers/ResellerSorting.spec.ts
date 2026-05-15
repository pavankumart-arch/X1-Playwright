import { expect, test, TestInfo } from '@playwright/test';

import { Login } from '../../pages/Login/Loginpage';
import { LeftsideNavigation } from '../../pages/Navigations/LeftSideNavigation';
import { TableSorting } from '../../pages/Resellers/ResellerSorting';

test.describe.configure({ retries: 0 });

const columns = [
  'ID',
  'NAME',
  'DESCRIPTION',
  'CREATED',
  'STATUS'
];

test.describe('Reseller Table Sorting', () => {

  for (const column of columns) {

    test(
      `Sorting Validation - ${column}`,
      async ({ page }, testInfo: TestInfo) => {

        const loginPage = new Login(page);

        const navigation = new LeftsideNavigation(page);

        const sorting = new TableSorting(page);

        await loginPage.navigateToURL();

        await loginPage.loginToApplication();

        await navigation.goToDashboard();

        await navigation.goToResellers();

        const result = await sorting.validateColumnSorting(
          column,
          testInfo
        );

        expect(
          result,
          `${column} Sorting Failed`
        ).toBeTruthy();
      }
    );
  }
});