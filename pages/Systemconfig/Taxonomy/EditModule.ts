import { Locator, Page, expect } from '@playwright/test';
import { BasePage } from '../../BasePage';

export class EditModule extends BasePage {

  SearchBox: Locator;
  Title: Locator;
  Identifier: Locator;
  UpdateButton: Locator;

  constructor(page: Page) {

    super(page);

    this.SearchBox =
      page.getByPlaceholder('Search...')
        .first();

    this.Title =
      page.locator(
        'input[placeholder="e.g. Inventory, Dealerships"]'
      );

    this.Identifier =
      page.locator(
        'input[placeholder="e.g. inventory, dealerships"]'
      );

    this.UpdateButton =
      page.getByRole('button', {
        name: /Update Module/i
      });
  }

  // =========================
  // SEARCH MODULE
  // =========================

  async searchModule(
    moduleTitle: string
  ) {

    await this.SearchBox.waitFor({
      state: 'visible'
    });

    await this.SearchBox.clear();

    await this.SearchBox.fill(
      moduleTitle
    );

    await this.page.waitForTimeout(1500);

    const row =
      this.page.locator('table tbody tr')
        .filter({
          has: this.page.locator('td')
            .filter({
              hasText: moduleTitle
            })
        });

    await expect(
      row.first()
    ).toBeVisible();

    console.log(
      `✅ Module Found : ${moduleTitle}`
    );
  }

  // =========================
  // CLICK EDIT
  // =========================

  async clickEditButton(
    moduleTitle: string
  ) {

    const row =
      this.page.locator('table tbody tr')
        .filter({
          has: this.page.locator('td')
            .filter({
              hasText: moduleTitle
            })
        });

    const editButton =
      row.locator('td')
        .last()
        .locator('button')
        .first();

    await expect(
      editButton
    ).toBeVisible();

    await editButton.click();

    await expect(
      this.Title
    ).toBeVisible();

    console.log(
      `✅ Edit clicked : ${moduleTitle}`
    );
  }

  // =========================
  // UPDATE MODULE
  // =========================

  async updateModule(
    updatedTitle: string,
    updatedIdentifier: string
  ) {

    await this.Title.clear();

    await this.Title.fill(
      updatedTitle
    );

    await this.Identifier.clear();

    await this.Identifier.fill(
      updatedIdentifier
    );

    await this.UpdateButton.click();

    await this.page.waitForLoadState(
      'networkidle'
    );

    console.log(
      '✅ Module Updated'
    );
  }

  // =========================
  // VALIDATE UPDATED MODULE
  // =========================

  async validateUpdatedModule(
    updatedTitle: string
  ): Promise<string | null> {

    await this.SearchBox.clear();

    await this.SearchBox.fill(
      updatedTitle
    );

    await this.page.waitForTimeout(1500);

    const row =
      this.page.locator('table tbody tr')
        .filter({
          has: this.page.locator('td')
            .filter({
              hasText: updatedTitle
            })
        });

    if (await row.count() > 0) {

      console.log(
        `✅ Updated Module : ${updatedTitle}`
      );

      return updatedTitle;
    }

    return null;
  }

  // =========================
  // COMPLETE FLOW
  // =========================

  async EditModule(
    existingTitle: string,
    updatedTitle: string,
    updatedIdentifier: string
  ) {

    await this.searchModule(
      existingTitle
    );

    await this.clickEditButton(
      existingTitle
    );

    await this.updateModule(
      updatedTitle,
      updatedIdentifier
    );

    await this.validateUpdatedModule(
      updatedTitle
    );

    console.log(
      '✅ Module Edited Successfully'
    );
  }
}