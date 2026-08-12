import { expect, Locator, Page, TestInfo } from '@playwright/test';
import { BasePage } from '../BasePage';
import { Reporter } from '../utils/NewReport';

export class RooftopNavigation extends BasePage {

AddRooftopheading!: Locator;
AddRooftopButton!: Locator;

Name!: Locator;
Description!: Locator;
RooftopID!: Locator;
Franchise!: Locator;
PlayerColor!: Locator;
SalesPersonName!: Locator;
Address!: Locator;
City!: Locator;
State!: Locator;
Zip!: Locator;
Phone!: Locator;
Email!: Locator;
URL!: Locator;
FaceebookID!: Locator;
DealerGroups!: Locator;
Comments!: Locator;

SaveRooftopbutton!: Locator;
SearchBox!: Locator;

private missingFields: string[] = [];

constructor(page: Page) {
super(page);

this.AddRooftopheading = page.getByRole('heading', {
  name: 'Add Rooftop'
});

this.AddRooftopButton = page.getByRole('button', {
  name: /Rooftop/i
});

this.Name = page.getByPlaceholder('Enter client name');
this.Description = page.getByPlaceholder('Enter description');
this.RooftopID = page.getByPlaceholder('Enter dealer code');
this.Franchise = page.getByPlaceholder('Enter franchise number');

this.PlayerColor = page.locator(
  '#admin-rooftop-create-playerColor'
);

this.SalesPersonName = page.getByPlaceholder(
  'Enter sales person name'
);

this.Address = page.getByPlaceholder('Full address');
this.City = page.getByPlaceholder('Enter city');
this.State = page.getByPlaceholder('Enter state');
this.Zip = page.getByPlaceholder('Enter ZIP code');
this.Phone = page.getByPlaceholder('Enter phone number');
this.Email = page.getByPlaceholder('Enter email address');
this.URL = page.getByPlaceholder('https://example.com');
this.FaceebookID = page.getByPlaceholder('Enter Facebook ID');

this.DealerGroups = page.getByPlaceholder(
  'Enter dealer groups (comma separated)'
);

this.Comments = page.getByPlaceholder(
  'Any additional notes...'
);

this.SaveRooftopbutton = page.getByRole('button', {
  name: /Save Rooftop/i
});

this.SearchBox = page.getByPlaceholder('Search...');

}

async searchAndOpenRecord(
  recordName: string,
  testInfo: TestInfo
): Promise<void> {

  console.log(`Searching Record: ${recordName}`);

  await this.SearchBox.waitFor({
    state: 'visible',
    timeout: 10000
  });

  await this.SearchBox.fill('');
  await this.SearchBox.fill(recordName);

  await this.page.waitForTimeout(1500);

  const recordRow = this.page
    .locator('table tbody tr')
    .filter({ hasText: recordName })
    .first();

  await expect(recordRow).toBeVisible();

  // Get only Name column
  const nameColumn = recordRow.locator('td').nth(1);

  const actualName =
    (await nameColumn.textContent())?.trim() || '';

  Reporter.validateData(
    recordName,
    actualName,
    'Verify Reseller Name',
    testInfo
  );

  await nameColumn.click();

  await this.page.waitForLoadState('networkidle');

  console.log(`Opened Record: ${actualName}`);
}}