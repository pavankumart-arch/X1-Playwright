import { Page } from '@playwright/test';
import { BasePage } from '../BasePage';

export interface RooftopPermissionData {
  ids: string[];
  editUrls: string[];
}

export class RooftopLevelPermissions extends BasePage {

  constructor(page: Page) {
    super(page);
  }

  /**
   * Wait until Rooftop table is loaded
   */
  private async waitForRooftopTable(): Promise<void> {

    // Wait for table
    await this.page.locator('table').first().waitFor({
      state: 'visible',
      timeout: 30000
    });

    // Wait for header
    await this.page.locator(
      'table thead'
    ).first().waitFor({
      state: 'visible',
      timeout: 30000
    });

    // Wait for rows
    await this.page.locator(
      'table tbody tr'
    ).first().waitFor({
      state: 'visible',
      timeout: 30000
    });
  }


  /**
   * Get ID column index
   */
  async getIdColumnIndex(): Promise<number> {

    await this.page.locator('table').first().waitFor({
      state: 'visible',
      timeout: 30000
    });

    const headers = this.page.locator(
      'table thead th'
    );

    const headerCount = await headers.count();

    for (let i = 0; i < headerCount; i++) {

      const headerText = (
        await headers.nth(i).innerText()
      )
        .trim()
        .replace(/\s+/g, ' ');

      if (
        headerText.toLowerCase() === 'id' ||
        headerText.toLowerCase().includes('id')
      ) {

        return i;
      }
    }

    /*
     * Fallback:
     * In your current Rooftop table, ID is the first column.
     */
    if (headerCount > 0) {
      return 0;
    }

    throw new Error(
      'ID column was not found in the table'
    );
  }


  /**
   * Get IDs and Edit URLs from all pagination pages
   */
  async getAllIdsAndEditUrlsFromPagination():
    Promise<RooftopPermissionData> {

    const ids: string[] = [];
    const editUrls: string[] = [];

    /*
     * IMPORTANT:
     * Wait for the table BEFORE finding the ID column.
     */
    await this.waitForRooftopTable();

    const idColumnIndex =
      await this.getIdColumnIndex();

    /*
     * Keep the original Rooftop list URL.
     */
    const rooftopListUrl =
      this.page.url();


    while (true) {

      await this.waitForRooftopTable();

      const rows =
        this.page.locator(
          'table tbody tr'
        );

      const rowCount =
        await rows.count();


      for (let i = 0; i < rowCount; i++) {

        /*
         * Get fresh row locator.
         */
        const row =
          this.page
            .locator('table tbody tr')
            .nth(i);

        const cells =
          row.locator('td');

        const cellCount =
          await cells.count();

        if (
          idColumnIndex >= cellCount
        ) {
          continue;
        }


        /*
         * ==============================
         * GET ID
         * ==============================
         */

        const id = (
          await cells
            .nth(idColumnIndex)
            .innerText()
        ).trim();

        if (!id) {
          continue;
        }


        /*
         * ==============================
         * GET EDIT BUTTON
         * ==============================
         *
         * Action column is the last TD.
         */

        const actionCell =
          cells.last();

        /*
         * Use button if available.
         */
        let editButton =
          actionCell.getByRole(
            'button'
          ).first();


        /*
         * If Edit is an anchor/link instead
         * of a button, use the link.
         */
        if (
          await editButton.count() === 0
        ) {

          editButton =
            actionCell.getByRole(
              'link',
              {
                name: /edit/i
              }
            ).first();
        }


        await editButton.waitFor({
          state: 'visible',
          timeout: 10000
        });


        /*
         * ==============================
         * CLICK EDIT
         * ==============================
         */

        await editButton.click();


        /*
         * Wait until Edit URL is available.
         */
        await this.page.waitForURL(
          /\/admin\/rooftop\/update/,
          {
            timeout: 15000
          }
        );


        /*
         * ==============================
         * STORE EDIT URL
         * ==============================
         */

        const editUrl =
          this.page.url();

        ids.push(id);

        editUrls.push(editUrl);


        /*
         * ==============================
         * RETURN TO LIST
         * ==============================
         */

        await this.page.goto(
          rooftopListUrl,
          {
            waitUntil: 'domcontentloaded',
            timeout: 30000
          }
        );

        await this.waitForRooftopTable();
      }


      /*
       * ==============================
       * NEXT PAGE
       * ==============================
       */

      const nextButton =
        this.page.getByRole(
          'button',
          {
            name: /next/i
          }
        );


      if (
        await nextButton.count() === 0
      ) {
        break;
      }


      if (
        await nextButton.isDisabled()
      ) {
        break;
      }


      await nextButton.click();


      /*
       * Wait for next page table.
       */
      await this.waitForRooftopTable();
    }


    return {
      ids,
      editUrls
    };
  }
}