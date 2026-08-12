import { Locator, Page } from '@playwright/test';
import { BasePage } from '../../BasePage';

export class UserTypeSearch extends BasePage {

  SearchBox: Locator;
  TableRows: Locator;

  constructor(page: Page) {
    super(page);

    this.SearchBox = page.locator(
      'input[placeholder="Search..."]'
    );

    this.TableRows = page.locator(
      'table tbody tr'
    );
  }

  async getFirstUserTypeName(): Promise<string> {

    await this.TableRows.first().waitFor({
      state: 'visible',
      timeout: 10000
    });

    const name = await this.TableRows
      .first()
      .locator('td')
      .nth(1)
      .textContent();

    return name?.trim() || '';
  }

  async searchUserType(
    userTypeName: string
  ): Promise<boolean> {

    await this.SearchBox.fill('');

    await this.SearchBox.fill(userTypeName);

    await this.page.waitForTimeout(2000);

    const row = this.TableRows.filter({
      hasText: userTypeName
    });

    const count = await row.count();

    console.log(
      `Search Value: ${userTypeName}`
    );

    console.log(
      `Matching Rows: ${count}`
    );

    return count > 0;
  }

  async verifyUserTypeSearch(): Promise<boolean> {

    const userTypeName =
      await this.getFirstUserTypeName();

    console.log(
      `First User Type: ${userTypeName}`
    );

    return await this.searchUserType(
      userTypeName
    );
  }
}