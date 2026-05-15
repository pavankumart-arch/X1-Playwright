import {
  Page,
  Locator,
  expect,
  TestInfo
} from '@playwright/test';

import { logAndValidate }
from '../../utils/reportUtil';
import { searchbyName } from '../../../utils/Search';



export class UserSearch {

  page: Page;

  searchInput: Locator;

  constructor(page: Page) {

    this.page = page;

    // ============================================
    // SEARCH INPUT
    // ============================================

    this.searchInput =
      page.locator(
        'input.table-search__input'
      );
  }

  // =====================================================
  // COMMON SEARCH METHOD
  // =====================================================

  async performSearch(
    value: string
  ) {

    await this.searchInput.waitFor({
      state: 'visible'
    });

    await this.searchInput.fill('');

    await this.searchInput.fill(
      value
    );

    await this.searchInput.press(
      'Enter'
    );

    await this.page.waitForTimeout(
      2000
    );
  }

  // =====================================================
  // SEARCH BY ID
  // =====================================================

  async searchByID(
    testInfo: TestInfo
  ) {

    const value = '28';

    await this.performSearch(
      value
    );

    const found =
      await searchbyName(
        this.page,
        value,
        'button:has-text("Next")',
        'table tbody tr',
        0
      );

    logAndValidate(
      {
        step:
          'Search by ID',

        expected:
          value,

        actual:
          found
            ? value
            : 'No Data Found'
      },
      testInfo
    );

    expect.soft(found)
      .toBeTruthy();
  }

  // =====================================================
  // SEARCH BY USERNAME
  // =====================================================

  async searchByUsername(
    testInfo: TestInfo
  ) {

    const value =
      'admin21';

    await this.performSearch(
      value
    );

    const found =
      await searchbyName(
        this.page,
        value,
        'button:has-text("Next")',
        'table tbody tr',
        1
      );

    logAndValidate(
      {
        step:
          'Search by Username',

        expected:
          value,

        actual:
          found
            ? value
            : 'No Data Found'
      },
      testInfo
    );

    expect.soft(found)
      .toBeTruthy();
  }

  // =====================================================
  // SEARCH BY EMAIL
  // =====================================================

  async searchByEmail(
    testInfo: TestInfo
  ) {

    const value =
      'admin22@test.com';

    await this.performSearch(
      value
    );

    const found =
      await searchbyName(
        this.page,
        value,
        'button:has-text("Next")',
        'table tbody tr',
        2
      );

    logAndValidate(
      {
        step:
          'Search by Email',

        expected:
          value,

        actual:
          found
            ? value
            : 'No Data Found'
      },
      testInfo
    );

    expect.soft(found)
      .toBeTruthy();
  }

  // =====================================================
  // SEARCH BY RESELLER
  // =====================================================

  async searchByReseller(
    testInfo: TestInfo
  ) {

    const value =
      'Premier Auto Group';

    await this.performSearch(
      value
    );

    const found =
      await searchbyName(
        this.page,
        value,
        'button:has-text("Next")',
        'table tbody tr',
        3
      );

    logAndValidate(
      {
        step:
          'Search by Reseller',

        expected:
          value,

        actual:
          found
            ? value
            : 'No Data Found'
      },
      testInfo
    );

    expect.soft(found)
      .toBeTruthy();
  }

  // =====================================================
  // SEARCH BY USER TYPE
  // =====================================================

  async searchByUserType(
    testInfo: TestInfo
  ) {

    const value =
      'Reseller Admin';

    await this.performSearch(
      value
    );

    const found =
      await searchbyName(
        this.page,
        value,
        'button:has-text("Next")',
        'table tbody tr',
        4
      );

    logAndValidate(
      {
        step:
          'Search by User Type',

        expected:
          value,

        actual:
          found
            ? value
            : 'No Data Found'
      },
      testInfo
    );

    expect.soft(found)
      .toBeTruthy();
  }

  // =====================================================
  // SEARCH BY STATUS
  // =====================================================

  async searchByStatus(
    testInfo: TestInfo
  ) {

    const value =
      'Active';

    await this.performSearch(
      value
    );

    const found =
      await searchbyName(
        this.page,
        value,
        'button:has-text("Next")',
        'table tbody tr',
        5
      );

    logAndValidate(
      {
        step:
          'Search by Status',

        expected:
          value,

        actual:
          found
            ? value
            : 'No Data Found'
      },
      testInfo
    );

    expect.soft(found)
      .toBeTruthy();
  }

  // =====================================================
  // INVALID SEARCH
  // =====================================================

  async invalidSearch(
    testInfo: TestInfo
  ) {

    const value =
      'invalid_user_123';

    await this.performSearch(
      value
    );

    const found =
      await searchbyName(
        this.page,
        value,
        'button:has-text("Next")',
        'table tbody tr',
        1
      );

    logAndValidate(
      {
        step:
          'Invalid Search',

        expected:
          'No Data Found',

        actual:
          found
            ? value
            : 'No Data Found'
      },
      testInfo
    );

    expect.soft(!found)
      .toBeTruthy();
  }
}