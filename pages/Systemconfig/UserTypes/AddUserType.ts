import { Locator, Page, expect } from '@playwright/test';
import { BasePage } from '../../BasePage';

export class AddUserType extends BasePage {

  AddUserTypeHeading: Locator;
  AddUserTypeButton: Locator;
  UserType: Locator;
  TypeKey: Locator;
  AvailableRolesSearch: Locator;
  SaveUserTypeButton: Locator;
  SearchBox: Locator;
  ActiveCheckbox: Locator;

  private addedUserTypeData: any = null;

  constructor(page: Page) {
    super(page);

    this.AddUserTypeHeading = page.getByRole('heading', {
      name: 'Add User Type'
    });

    this.AddUserTypeButton = this.page.getByRole('button', {
      name: /User Type/i
    });

    this.UserType = page.getByPlaceholder(
      'e.g. Admin, Manager, Viewer, Support'
    );

    this.TypeKey = page.getByPlaceholder(
      'e.g. manager (unique, no spaces)'
    );

    this.AvailableRolesSearch =
      page.getByPlaceholder('Search...').first();

    this.SaveUserTypeButton = page.getByRole('button', {
      name: 'Save User Type'
    });

    this.SearchBox = page.getByPlaceholder('Search...');

    this.ActiveCheckbox =
      page.locator('input[type="checkbox"]').first();
  }

  async AddUserType(
    userType: string,
    typeKey: string
  ): Promise<string> {

    await this.AddUserTypeButton.click();

    await expect(this.AddUserTypeHeading).toBeVisible();

    // Fill fields
    await this.UserType.fill(userType);
    await this.TypeKey.fill(typeKey);

    // ==========================
    // ROLE SELECTION
    // Use mouse.click() with exact coordinates — mimics real user click
    // dispatchEvent leaves the UI in wrong state for custom picklist widgets
    // ==========================

    const roleName = 'Rooftop Viewer';

    // Search to filter the list
    await this.AvailableRolesSearch.fill(roleName);

    await this.page.waitForTimeout(500);

    // Wait for the role item to appear
    const roleItem = this.page.locator(
      'div.cursor-pointer'
    ).filter({ hasText: new RegExp(`^${roleName}$`) });

    await expect(roleItem).toBeVisible({ timeout: 10000 });

    // Wait until no data-disabled on element or ancestors
    await this.page.waitForFunction((name: string) => {
      const target = Array.from(
        document.querySelectorAll('div.cursor-pointer')
      ).find(e => e.textContent?.trim() === name);
      if (!target) return false;

      let current: Element | null = target;
      for (let i = 0; i < 5; i++) {
        if (!current) break;
        if (
          current.hasAttribute('data-disabled') ||
          current.getAttribute('aria-disabled') === 'true' ||
          current.hasAttribute('disabled')
        ) return false;
        current = current.parentElement;
      }

      const style = window.getComputedStyle(target as HTMLElement);
      return (
        style.pointerEvents !== 'none' &&
        style.opacity !== '0' &&
        style.display !== 'none' &&
        style.visibility !== 'hidden'
      );
    }, roleName, { timeout: 15000 });

    // Get the exact bounding box of the element and click its center
    // using page.mouse.click() — this is the closest to a real user click
    const box = await roleItem.boundingBox();
    if (!box) throw new Error('Could not get bounding box of role item');

    const centerX = box.x + box.width / 2;
    const centerY = box.y + box.height / 2;

    console.log(`📋 Clicking role at coordinates: (${centerX}, ${centerY})`);

    // Scroll element into view first
    await roleItem.scrollIntoViewIfNeeded();

    // Re-get bounding box after scroll
    const boxAfterScroll = await roleItem.boundingBox();
    if (!boxAfterScroll) throw new Error('Could not get bounding box after scroll');

    // Use low-level mouse click — identical to what a real user does
    await this.page.mouse.move(
      boxAfterScroll.x + boxAfterScroll.width / 2,
      boxAfterScroll.y + boxAfterScroll.height / 2
    );
    await this.page.mouse.down();
    await this.page.waitForTimeout(50);
    await this.page.mouse.up();

    console.log(`✅ Role selected: ${roleName}`);

    // Wait for UI to stabilize after selection
    await this.page.waitForLoadState('networkidle');
    await this.page.waitForTimeout(500);

    // ==========================
    // VALIDATION 1: Role moved to Assigned panel
    // ==========================

    const nothingSelected = this.page.getByText('Nothing selected yet');
    const isStillEmpty = await nothingSelected
      .isVisible({ timeout: 3000 })
      .catch(() => false);

    if (isStillEmpty) {
      throw new Error(
        '❌ VALIDATION FAILED: Role was NOT transferred to Assigned Roles panel.'
      );
    }

    console.log(`✅ VALIDATION PASSED: Role confirmed in Assigned Roles panel`);

    // Active status
    const activeStatus = (await this.ActiveCheckbox.isChecked())
      ? 'Checked'
      : 'Unchecked';

    this.addedUserTypeData = {
      userType,
      typeKey,
      active: activeStatus
    };

    // ==========================
    // SAVE
    // Use mouse.click() on Save button coordinates — same as role click
    // ==========================

    await this.SaveUserTypeButton.scrollIntoViewIfNeeded();

    await expect(this.SaveUserTypeButton).toBeVisible({ timeout: 5000 });
    await expect(this.SaveUserTypeButton).toBeEnabled({ timeout: 5000 });

    console.log('📋 Clicking Save User Type Button...');

    const saveBox = await this.SaveUserTypeButton.boundingBox();
    if (!saveBox) throw new Error('Could not get bounding box of Save button');

    await this.page.mouse.move(
      saveBox.x + saveBox.width / 2,
      saveBox.y + saveBox.height / 2
    );
    await this.page.mouse.down();
    await this.page.waitForTimeout(50);
    await this.page.mouse.up();

    await this.page.waitForLoadState('networkidle');

    // ==========================
    // VALIDATION 2: Save succeeded — page navigates away
    // ==========================

    await this.page.waitForFunction(
      () => !window.location.href.includes('/create'),
      { timeout: 10000 }
    ).catch(async () => {
      const url = this.page.url();
      if (url.includes('/create')) {
        throw new Error(
          '❌ VALIDATION FAILED: Page still on create page after Save. ' +
          'User Type was NOT saved.'
        );
      }
    });

    console.log(`✅ VALIDATION PASSED: Navigated away from create page`);
    console.log(`✅ User Type Created: ${userType}`);

    return userType;
  }

  async searchUserTypeInSummary(
    userType: string
  ): Promise<string | null> {

    try {
      await this.SearchBox.waitFor({ state: 'visible', timeout: 5000 });

      await this.SearchBox.fill(userType);

      await this.page.waitForTimeout(500);

      const rows = this.page.locator('table tbody tr');
      const count = await rows.count();

      if (count > 0) {
        const text =
          (
            await rows.first().locator('td').first().textContent()
          )?.trim() || '';

        if (text.toLowerCase().includes(userType.toLowerCase())) {
          return text;
        }
      }

      return null;

    } catch (error) {
      console.log(`❌ Search Error: ${error}`);
      return null;
    }
  }

  getAddedUserTypeData(): any {
    return this.addedUserTypeData;
  }
}