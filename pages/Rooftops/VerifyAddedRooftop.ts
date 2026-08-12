import { Page, Locator } from '@playwright/test';
import { BasePage } from '../BasePage';
import AddRooftopData from '../../testdata/AddRooftopData.json';
import { Reporter } from '../utils/NewReport';


export class UpdatedRooftop extends BasePage {
  [x: string]: any;

  searchInput: Locator;
  rows: Locator;

  AddRooftopButton: Locator;
  AddRooftopheading: Locator;
  SaveRooftopbutton: Locator;
  CancelButton: Locator;

  Name: Locator;
  Description: Locator;
  RooftopID: Locator;
  Franchise: Locator;
  PlayerColor: Locator;
  SalesPersonName: Locator;
  Address: Locator;
  City: Locator;
  State: Locator;
  Zip: Locator;
  Phone: Locator;
  Email: Locator;
  URL: Locator;
  FacebookID: Locator;
  DealerGroups: Locator;
  Comments: Locator;
  Active: Locator;

  constructor(page: Page) {

    super(page);

    this.searchInput = this.page.locator('input.table-search__input');

    this.rows = this.page.locator('table tbody tr');
   
    this.AddRooftopButton = page.locator('[class="flex items-center gap-2"]');

    this.AddRooftopheading = this.page.getByRole('heading', { name: 'Add Rooftop' });

    this.SaveRooftopbutton = this.page.getByRole('button', { name: 'Save Rooftop' });

    this.CancelButton = this.page.getByRole('button', { name: 'Cancel' });

    this.Name = this.page.getByPlaceholder("Enter client name");

    this.Description = this.page.getByPlaceholder('Enter description');

    this.RooftopID = this.page.getByPlaceholder('Enter Rooftop ID');

    this.Franchise = this.page.getByPlaceholder('Enter franchise number');

    this.PlayerColor = this.page.locator('#admin-rooftop-create-playerColor');

    this.SalesPersonName = this.page.getByPlaceholder('Enter sales person name');

    this.Address = this.page.getByPlaceholder('Full address');

    this.City = this.page.getByPlaceholder('Enter city');

    this.State = this.page.getByPlaceholder('Enter state');

    this.Zip = this.page.getByPlaceholder('Enter ZIP code');

    this.Phone = this.page.getByPlaceholder('Enter phone number');

    this.Email = this.page.getByPlaceholder('Enter email address');

    this.URL = this.page.getByPlaceholder('https://example.com');

    this.FacebookID = this.page.getByPlaceholder('Enter Facebook ID');

    this.DealerGroups = this.page.getByPlaceholder('Enter dealer groups (comma separated)');

    this.Comments = this.page.getByPlaceholder('Any additional notes...');

    this.Active = this.page.getByText('Active');
  }

  async OpenRooftopView(rooftopName: string, testInfo: import('@playwright/test').TestInfo) {

    await this.searchInput.fill(rooftopName);

    await this.rows.first().waitFor({ state: 'visible', timeout: 5000 });

    const matchedRow = this.rows.filter({
      has: this.page.locator('td:nth-child(2)', { hasText: rooftopName })
    });

    await matchedRow.locator('td:last-child button').first().click();

    await this.page.waitForTimeout(2000);
  }

  async VerifyRooftopDetails(rooftopName: string, testInfo: import('@playwright/test').TestInfo) {

    let allPassed = true;

    // Validate Name
    const actualName = await this.Name.inputValue();
    const nameValid = actualName === rooftopName;
    Reporter.validateData(
      rooftopName,
      actualName,
      'Rooftop Name',
      testInfo
    );
    if (!nameValid) allPassed = false;

    // Validate Description
    const actualDescription = await this.Description.inputValue();
    const descriptionValid = actualDescription === AddRooftopData.description;
    Reporter.validateData(
      AddRooftopData.description,
      actualDescription,
      'Description',
      testInfo
    );
    if (!descriptionValid) allPassed = false;

    // Validate Franchise
    const actualFranchise = await this.Franchise.inputValue();
    const franchiseValid = actualFranchise === AddRooftopData.franchise;
    Reporter.validateData(
      AddRooftopData.franchise,
      actualFranchise,
      'Franchise',
      testInfo
    );
    if (!franchiseValid) allPassed = false;

    // Validate Sales Person Name
    const actualSalesPerson = await this.SalesPersonName.inputValue();
    const salesPersonValid = actualSalesPerson === AddRooftopData.salesPersonName;
    Reporter.validateData(
      AddRooftopData.salesPersonName,
      actualSalesPerson,
      'Sales Person Name',
      testInfo
    );
    if (!salesPersonValid) allPassed = false;

    // Validate Address
    const actualAddress = await this.Address.inputValue();
    const addressValid = actualAddress === AddRooftopData.address;
    Reporter.validateData(
      AddRooftopData.address,
      actualAddress,
      'Address',
      testInfo
    );
    if (!addressValid) allPassed = false;

    // Validate City
    const actualCity = await this.City.inputValue();
    const cityValid = actualCity === AddRooftopData.city;
    Reporter.validateData(
      AddRooftopData.city,
      actualCity,
      'City',
      testInfo
    );
    if (!cityValid) allPassed = false;

    // Validate State
    const actualState = await this.State.inputValue();
    const stateValid = actualState === AddRooftopData.state;
    Reporter.validateData(
      AddRooftopData.state,
      actualState,
      'State',
      testInfo
    );
    if (!stateValid) allPassed = false;

    // Validate Zip
    const actualZip = await this.Zip.inputValue();
    const zipValid = actualZip === AddRooftopData.zip;
    Reporter.validateData(
      AddRooftopData.zip,
      actualZip,
      'Zip Code',
      testInfo
    );
    if (!zipValid) allPassed = false;

    // Validate Phone
    const actualPhone = await this.Phone.inputValue();
    const phoneValid = actualPhone === AddRooftopData.phone;
    Reporter.validateData(
      AddRooftopData.phone,
      actualPhone,
      'Phone Number',
      testInfo
    );
    if (!phoneValid) allPassed = false;

    // Validate Email
    const actualEmail = await this.Email.inputValue();
    const emailValid = actualEmail === AddRooftopData.email;
    Reporter.validateData(
      AddRooftopData.email,
      actualEmail,
      'Email Address',
      testInfo
    );
    if (!emailValid) allPassed = false;

    // Validate URL
    const actualUrl = await this.URL.inputValue();
    const urlValid = actualUrl === AddRooftopData.url;
    Reporter.validateData(
      AddRooftopData.url,
      actualUrl,
      'URL',
      testInfo
    );
    if (!urlValid) allPassed = false;

    // Validate Facebook ID
    const actualFacebook = await this.FacebookID.inputValue();
    const facebookValid = actualFacebook === AddRooftopData.facebookID;
    Reporter.validateData(
      AddRooftopData.facebookID,
      actualFacebook,
      'Facebook ID',
      testInfo
    );
    if (!facebookValid) allPassed = false;

    // Validate Dealer Groups
    const actualDealerGroups = await this.DealerGroups.inputValue();
    const dealerGroupsValid = actualDealerGroups === AddRooftopData.dealerGroups;
    Reporter.validateData(
      AddRooftopData.dealerGroups,
      actualDealerGroups,
      'Dealer Groups',
      testInfo
    );
    if (!dealerGroupsValid) allPassed = false;

    // Validate Comments
    const actualComments = await this.Comments.inputValue();
    const commentsValid = actualComments === AddRooftopData.comments;
    Reporter.validateData(
      AddRooftopData.comments,
      actualComments,
      'Comments',
      testInfo
    );
    if (!commentsValid) allPassed = false;

    // Validate Active Status
    const activeVisible = await this.Active.isVisible().catch(() => false);
    Reporter.validateData(
      'Visible',
      activeVisible ? 'Visible' : 'Not Visible',
      'Active Status',
      testInfo
    );
    if (!activeVisible) allPassed = false;

    // Click Cancel button
    await this.CancelButton.click();

 Reporter.validateData(
  true,  // Expected
  allPassed,  // Actual
  'Rooftop Verification Summary',
  testInfo
);
  }
}