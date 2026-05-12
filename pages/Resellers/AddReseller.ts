import { expect, Locator, Page, TestInfo } from '@playwright/test';
import { BasePage } from '../BasePage';
import AddResellerdata from '../../testdata/AddResellerData.json';
import { logAndValidate } from '../utils/reportUtil';

export class AddReseller extends BasePage {
  AddResellerButton: Locator;
  AddResellerheading: Locator;
  SaveButton: Locator;

  NameField: Locator;
  DescriptionField: Locator;
  BillingNameField: Locator;
  SalesPersonField: Locator;
  TTOptionsField: Locator;
  AppIDField: Locator;

  PlayerSizeField: Locator;
  searchInput: Locator;

  constructor(page: Page) {
    super(page);

    this.AddResellerButton = page.locator(
      'button:has(span:text-is("Reseller"))'
    );

    this.AddResellerheading =
      page.getByRole('heading', {
        name: 'Add Reseller',
      });

    this.SaveButton =
      page.getByRole('button', {
        name: 'Save Reseller',
      });

    this.NameField =
      page.getByPlaceholder(
        'Enter reseller name'
      );

    this.DescriptionField =
      page.getByPlaceholder(
        'Enter description'
      );

    this.BillingNameField =
      page.getByPlaceholder(
        'Enter billing name'
      );

    this.SalesPersonField =
      page.getByPlaceholder(
        'Enter sales person name'
      );

    this.TTOptionsField =
      page.locator(
        'textarea[placeholder="Enter TT options"], input[placeholder="Enter TT options"]'
      );

    this.AppIDField =
      page.getByPlaceholder(
        'Enter App ID'
      );

    this.PlayerSizeField =
      page.getByPlaceholder(
        'Enter player size'
      );

    this.searchInput = page
      .locator(
        'input[placeholder*="Search"]'
      )
      .or(
        page.locator(
          'input.table-search__input'
        )
      );
  }

  async AddReseller(
    testInfo: TestInfo
  ): Promise<string> {
    console.log(
      'Creating reseller...'
    );

    const uniqueName = `${
      AddResellerdata.Name
    }_${Date.now()}`;

    // STEP 1
    try {
      await this.AddResellerButton.click();

      await this.page.waitForLoadState(
        'networkidle'
      );

      // FIXED
      logAndValidate(
        {
          step:
            'Click Reseller button',
          expected:
            'Clicked successfully',
          actual:
            'Clicked successfully',
        },
        testInfo
      );
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : String(error);

      logAndValidate(
        {
          step:
            'Click Reseller button',
          expected:
            'Clicked successfully',
          actual:
            `Failed: ${errorMessage}`,
        },
        testInfo
      );

      throw error;
    }

    // STEP 2
    try {
      await expect(
        this.AddResellerheading
      ).toBeVisible({
        timeout: 5000,
      });

      logAndValidate(
        {
          step:
            'Verify Add Reseller heading',
          expected:
            'Visible',
          actual: 'Visible',
        },
        testInfo
      );
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : String(error);

      logAndValidate(
        {
          step:
            'Verify Add Reseller heading',
          expected:
            'Visible',
          actual:
            `Not visible: ${errorMessage}`,
        },
        testInfo
      );

      throw error;
    }

    // FILL FIELD
    const fillField = async (
      locator: Locator,
      value: string,
      fieldName: string
    ) => {
      try {
        await locator.waitFor({
          state: 'visible',
          timeout: 5000,
        });

        await locator.fill('');

        await locator.fill(value);

        const actualValue =
          await locator.inputValue();

        logAndValidate(
          {
            step:
              `Fill ${fieldName}`,
            expected: value,
            actual: actualValue,
          },
          testInfo
        );

        expect
          .soft(actualValue)
          .toBe(value);
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : String(error);

        logAndValidate(
          {
            step:
              `Fill ${fieldName}`,
            expected: value,
            actual:
              `Error: ${errorMessage}`,
          },
          testInfo
        );

        throw error;
      }
    };

    // FILL DATA
    await fillField(
      this.NameField,
      uniqueName,
      'Name'
    );

    await fillField(
      this.DescriptionField,
      AddResellerdata.Description,
      'Description'
    );

    await fillField(
      this.BillingNameField,
      AddResellerdata.BillingName,
      'Billing Name'
    );

    await fillField(
      this.SalesPersonField,
      AddResellerdata.SalesPerson,
      'Sales Person'
    );

    await fillField(
      this.TTOptionsField,
      AddResellerdata.TTOptions,
      'TT Options'
    );

    await fillField(
      this.AppIDField,
      AddResellerdata.AppID,
      'App ID'
    );

    await fillField(
      this.PlayerSizeField,
      AddResellerdata.PlayerSize.toString(),
      'Player Size'
    );

    // SAVE
    try {
      await Promise.all([
        this.page.waitForLoadState(
          'networkidle'
        ),
        this.SaveButton.click(),
      ]);

      // FIXED
      logAndValidate(
        {
          step:
            'Click Save Reseller button',
          expected:
            'Save clicked, network idle',
          actual:
            'Save clicked, network idle',
        },
        testInfo
      );
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : String(error);

      logAndValidate(
        {
          step:
            'Click Save Reseller button',
          expected:
            'Save clicked, network idle',
          actual:
            `Failed: ${errorMessage}`,
        },
        testInfo
      );

      throw error;
    }

    // WAIT FOR TABLE
    await this.page.waitForTimeout(
      3000
    );

    await this.page
      .locator('table')
      .waitFor({
        state: 'visible',
        timeout: 10000,
      });

    // FIXED
    logAndValidate(
      {
        step:
          'Reseller creation complete',
        expected:
          'Created and table visible',
        actual:
          'Created and table visible',
      },
      testInfo
    );

    // SEARCH + VERIFY
    const foundName =
      await this.searchResellerAcrossPages(
        uniqueName,
        testInfo
      );

    logAndValidate(
      {
        step:
          'Verify reseller in table (search + pagination)',
        expected:
          uniqueName,
        actual:
          foundName ??
          'Not Found',
      },
      testInfo
    );

    expect
      .soft(foundName)
      .toBe(uniqueName);

    return uniqueName;
  }

  async searchResellerAcrossPages(
    targetName: string,
    testInfo: TestInfo
  ): Promise<string | null> {
    try {
      console.log(
        `Searching for: ${targetName}`
      );

      await this.searchInput.waitFor({
        state: 'visible',
        timeout: 5000,
      });

      await this.searchInput.fill('');

      await this.searchInput.fill(
        targetName
      );

      await this.searchInput.press(
        'Enter'
      );

      await this.page.waitForLoadState(
        'networkidle'
      );

      await this.page.waitForTimeout(
        2000
      );

      let currentPage = 1;

      const maxPages = 10;

      while (
        currentPage <= maxPages
      ) {
        const rows =
          this.page.locator(
            'table tbody tr'
          );

        const rowCount =
          await rows.count();

        for (
          let i = 0;
          i < rowCount;
          i++
        ) {
          const nameCell =
            rows
              .nth(i)
              .locator('td')
              .nth(1);

          const nameText =
            await nameCell.textContent();

          if (
            nameText?.trim() ===
            targetName
          ) {
            // FIXED
            logAndValidate(
              {
                step:
                  `Search pagination page ${currentPage}`,
                expected:
                  `Found on page ${currentPage}`,
                actual:
                  `Found on page ${currentPage}`,
              },
              testInfo
            );

            return nameText.trim();
          }
        }

        const nextButton =
          this.page.locator(
            'button:has-text("Next")'
          );

        const isNextEnabled =
          await nextButton
            .isEnabled()
            .catch(() => false);

        if (!isNextEnabled)
          break;

        await nextButton.click();

        await this.page.waitForLoadState(
          'networkidle'
        );

        currentPage++;
      }

      logAndValidate(
        {
          step:
            'Search reseller across pages',
          expected:
            targetName,
          actual:
            `Not found after ${currentPage - 1} pages`,
        },
        testInfo
      );

      return null;
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : String(error);

      logAndValidate(
        {
          step:
            'Search reseller',
          expected:
            targetName,
          actual:
            `Search error: ${errorMessage}`,
        },
        testInfo
      );

      return null;
    }
  }
}