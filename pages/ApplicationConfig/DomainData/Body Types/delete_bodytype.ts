import { expect, Locator, Page, TestInfo, test } from '@playwright/test';
import { searchbyName } from '../../../utils/Searchnew';
import { AddBodyType } from './add-bodytype';
import { Reporter } from '../../../utils/NewReport';

export class DeleteBodyType extends AddBodyType {

deleteIcon: Locator;
confirmDeleteButton: Locator;
deletePopup: Locator;
noRecordText: Locator;

constructor(page: Page) {
super(page);

this.deleteIcon = page.locator('button').filter({
  has: page.locator('svg.lucide-trash2')
});

this.confirmDeleteButton = page.locator(
  'button.bg-destructive'
);

this.deletePopup = page.getByText('Confirm Delete');

this.noRecordText = page.getByText('No record found');

}

async deleteAddedBodyType(
bodyTypeName: string,
testInfo: TestInfo
): Promise<void> {


await test.step('Delete Added Body Type', async () => {

  const bodyTypeFound = await searchbyName(
    this.page,
    this.searchInput,
    bodyTypeName,
    'button:has-text("Next ›")',
    'table tbody tr',
    1
  );

  expect(bodyTypeFound).toBeTruthy();

  const row = this.page.locator(
    `table tbody tr:has-text("${bodyTypeName}")`
  );

  await row.waitFor({
    state: 'visible',
    timeout: 10000
  });

  await testInfo.attach(
    'Before Delete Body Type',
    {
      body: await this.page.screenshot(),
      contentType: 'image/png'
    }
  );

  const deleteButton = row
    .locator('button')
    .filter({
      has: this.page.locator(
        'svg.lucide-trash2'
      )
    });

  await deleteButton.click();

  await this.deletePopup.waitFor({
    state: 'visible',
    timeout: 10000
  });

  const dialog =
    this.page.locator('[role="dialog"]');

  await expect(dialog).toBeVisible();

  await dialog
    .getByRole('button', {
      name: 'Delete'
    })
    .click();

  await this.page.waitForLoadState(
    'networkidle'
  );

  await testInfo.attach(
    'After Delete Body Type',
    {
      body: await this.page.screenshot(),
      contentType: 'image/png'
    }
  );

  console.log(`

========== BODY TYPE DELETED ==========
Deleted Body Type : ${bodyTypeName}
===================================

`);
});
}

async verifyDeletedBodyType(
bodyTypeName: string,
testInfo: TestInfo
): Promise<boolean> {


let bodyTypeDeleted = false;

await test.step(
  'Verify Deleted Body Type',
  async () => {

    await this.searchInput.clear();

    await this.searchInput.fill(
      bodyTypeName
    );

    await this.page.keyboard.press(
      'Enter'
    );

    await this.page.waitForTimeout(
      3000
    );

    await this.page.waitForLoadState(
      'networkidle'
    );

    const deletedBodyTypeRow =
      this.page.locator('tr').filter({
        hasText: bodyTypeName
      });

    const rowCount =
      await deletedBodyTypeRow.count();

    bodyTypeDeleted = rowCount === 0;

    await testInfo.attach(
      'Verify Deleted Body Type',
      {
        body: await this.page.screenshot(),
        contentType: 'image/png'
      }
    );

    Reporter.validateData(
      'Deleted',
      bodyTypeDeleted
        ? 'Deleted'
        : 'Still Exists',
      'Verify deleted body type should not appear in summary table',
      testInfo
    );

    expect(
      bodyTypeDeleted
    ).toBeTruthy();

    console.log(`

========== DELETE VERIFICATION ==========
Body Type : ${bodyTypeName}
Rows Found: ${rowCount}
Status    : ${bodyTypeDeleted ? 'DELETED' : 'STILL EXISTS'}
===========================================================

`);
}
);

return bodyTypeDeleted;


}

async completeAddDeleteBodyTypeFlow(
testInfo: TestInfo
): Promise<void> {


const bodyTypeName =
  await this.createAndVerifyBodyType(
    testInfo
  );

await this.deleteAddedBodyType(
  bodyTypeName,
  testInfo
);

await this.verifyDeletedBodyType(
  bodyTypeName,
  testInfo
);

console.log(`

========== COMPLETE BODY TYPE DELETE FLOW ==========
✓ Body Type Added
✓ Body Type Verified
✓ Body Type Deleted
✓ Deletion Verified
===================

`);
}}
