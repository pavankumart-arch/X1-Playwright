import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from '../BasePage';
import EditResellerdata from '../../testdata/AddResellerData.json';

export class UpdatedReseller extends BasePage {

  searchInput: Locator;
  rows: Locator;
  // 🔹 Buttons & Heading
    AddResellerButton: Locator
    AddResellerheading: Locator
    SaveButton: Locator
    CancelButton: Locator

    // 🔹 Input Fields
    NameFieldLabel: Locator
    DescriptionFieldLabel: Locator
    BillingNameLabel: Locator
    SalesPersonFieldLabel: Locator
    TTOptionsFieldLabel: Locator
    AppIDFieldLabel: Locator
    PlayerSizeFieldLabel: Locator

    // 🔥 Toggle Locators (ADDED)
    ShowControls: Locator
    EnableAutoPlay: Locator
    ShowMap: Locator
    ShowSharing: Locator
    ShowRelated: Locator
    ShowCC: Locator
    ShowForm: Locator
    Active: Locator

  constructor(page: Page) {
    super(page);

    this.searchInput = this.page.locator('input.table-search__input');
    this.rows = this.page.locator('table tbody tr');
    // 🔹 Buttons
        this.AddResellerButton = this.page.locator('button.btn.btn-primary');
        this.AddResellerheading = this.page.getByRole('heading', { name: 'Add Reseller' })
        this.SaveButton = this.page.getByRole('button', { name: 'Save Reseller' })
        this.CancelButton = this.page.getByRole('button', { name: 'Cancel' })

        // 🔹 Inputs
        this.NameFieldLabel = this.page.getByPlaceholder('Enter reseller name')
        this.DescriptionFieldLabel = this.page.getByPlaceholder('Enter description')
        this.BillingNameLabel = this.page.getByPlaceholder('Enter billing name')
        this.SalesPersonFieldLabel = this.page.getByPlaceholder('Enter sales person name')
        this.TTOptionsFieldLabel = this.page.getByPlaceholder('Enter TT options (comma separated or JSON)')
        this.AppIDFieldLabel = this.page.getByPlaceholder('Enter App ID')
        this.PlayerSizeFieldLabel = this.page.getByPlaceholder('640')

        // 🔥 Toggle Locators (TEXT BASED - YOUR UI)
        this.ShowControls = this.page.getByText('Show Controls')
        this.EnableAutoPlay = this.page.getByText('Enable Auto Play')
        this.ShowMap = this.page.getByText('Show Map')
        this.ShowSharing = this.page.getByText('Show Sharing')
        this.ShowRelated = this.page.getByText('Show Related')
        this.ShowCC = this.page.getByText('Show CC')
        this.ShowForm = this.page.getByText('Show Form')
        this.Active = this.page.getByText('Active')
  }

  async UpdateResellerView() {
    // 🔹 Enter search value
    await this.searchInput.fill(EditResellerdata.Name);
    // 🔹 Wait for table to update
    await expect(this.rows.first()).toBeVisible();

    // 🔹 Filter row based on Reseller Name column (2nd column)
    const matchedRow = this.rows.filter({
      has: this.page.locator('td:nth-child(2)', { hasText: EditResellerdata.Name })
    });
    // 🔹 Click View button (Actions column)
    await matchedRow.locator('td:last-child button').first().click();
    await this.page.waitForTimeout(2000);
  }

  async VerifyResellerDetails() {
    let allPassed = true;

    const actualName = await this.NameFieldLabel.inputValue();
    if (actualName !== EditResellerdata.Name) { allPassed = false; }
    expect.soft(actualName).toBe(EditResellerdata.Name);

    const description = await this.DescriptionFieldLabel.inputValue();
    if (description !== EditResellerdata.Description) { allPassed = false; }
    expect.soft(description).toBe(EditResellerdata.Description);

    const billingName = await this.BillingNameLabel.inputValue();
    if (billingName !== EditResellerdata.BillingName) { allPassed = false; }
    expect.soft(billingName).toBe(EditResellerdata.BillingName);

    const salesPerson = await this.SalesPersonFieldLabel.inputValue();
    if (salesPerson !== EditResellerdata.SalesPerson) { allPassed = false; }
    expect.soft(salesPerson).toBe(EditResellerdata.SalesPerson);

    const ttOptions = await this.TTOptionsFieldLabel.inputValue();
    if (ttOptions !== EditResellerdata.TTOptions) { allPassed = false; }
    expect.soft(ttOptions).toBe(EditResellerdata.TTOptions);

    const appID = await this.AppIDFieldLabel.inputValue();
    if (appID !== EditResellerdata.AppID) { allPassed = false; }
    expect.soft(appID).toBe(EditResellerdata.AppID);

    const playerSize = await this.PlayerSizeFieldLabel.inputValue();
    if (playerSize !== EditResellerdata.PlayerSize) { allPassed = false; }
    expect.soft(playerSize).toBe(EditResellerdata.PlayerSize);

    if (!await this.ShowControls.isVisible()) { allPassed = false; }
    await expect.soft(this.ShowControls).toBeVisible();

    if (!await this.EnableAutoPlay.isVisible()) { allPassed = false; }
    await expect.soft(this.EnableAutoPlay).toBeVisible();

    if (!await this.ShowMap.isVisible()) { allPassed = false; }
    await expect.soft(this.ShowMap).toBeVisible();

    if (!await this.ShowSharing.isVisible()) { allPassed = false; }
    await expect.soft(this.ShowSharing).toBeVisible();

    if (!await this.ShowRelated.isVisible()) { allPassed = false; }
    await expect.soft(this.ShowRelated).toBeVisible();

    if (!await this.ShowCC.isVisible()) { allPassed = false; }
    await expect.soft(this.ShowCC).toBeVisible();

    if (!await this.ShowForm.isVisible()) { allPassed = false; }
    await expect.soft(this.ShowForm).toBeVisible();

    if (!await this.Active.isVisible()) { allPassed = false; }
    await expect.soft(this.Active).toBeVisible();
    await this.CancelButton.click();
    if (allPassed) {
      console.log('✅ Updated Reseller data is verified and passed');
    } else {
      console.log('❌ Updated Reseller verification failed - one or more fields did not match');
    }
  }
}
