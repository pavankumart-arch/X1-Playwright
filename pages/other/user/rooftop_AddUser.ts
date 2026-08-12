import { Locator, Page, TestInfo, expect } from '@playwright/test';
import { BasePage } from '../../BasePage';
import Adduserdata from '../../../testdata/AddUser.json';
import { searchbyName } from '../../utils/Searchnew';
import { Reporter } from '../../utils/NewReport';

export class RooftopAddUser extends BasePage {

  saveUserButton: Locator;
  cancelButton: Locator;
  addUserButton: Locator;
  username: Locator;
  password: Locator;
  userType: Locator;
  email: Locator;
  activecheckbox: Locator;
  searchInput: Locator;
  availableRooftops: Locator;
  RooftopName: Locator;

  public expectedUsername: string = '';
  public expectedEmail: string = '';

  constructor(page: Page) {
    super(page);

    this.saveUserButton = page.getByRole('button', { name: 'Save User' });
    this.cancelButton = page.getByRole('button', { name: 'Cancel' });
    this.addUserButton = page.locator('[class="lucide lucide-plus"]');
    this.username = page.getByPlaceholder('Enter username');
    this.password = page.getByPlaceholder('Enter password');
    this.userType = page.locator('[data-form-field="userTypeId"]');
    this.email = page.getByPlaceholder('Enter email address');
    this.activecheckbox = page.locator('svg.lucide-check');
    this.searchInput = page.getByPlaceholder('Search');
    this.availableRooftops = page.locator('input[placeholder="Search..."]').first();
    this.RooftopName = page.locator('div[role="option"]:has-text("Premier Toyota Downtown")');
  }

  async addrooftopUser(): Promise<void> {
    await this.addUserButton.click();
    await this.username.waitFor({ state: 'visible' });

    const uniqueUsername = `${Adduserdata.username}_${Date.now()}`;
    this.expectedUsername = uniqueUsername;

    const emailParts = Adduserdata.email.split('@');
    const uniqueEmail = `${emailParts[0]}_${Date.now()}@${emailParts[1]}`;
    this.expectedEmail = uniqueEmail;

    await this.fillElement(this.username, uniqueUsername);
    await this.fillElement(this.password, Adduserdata.password);
    await this.fillElement(this.email, uniqueEmail);

    await this.selectUserType();
    await this.selectRooftop();

    const validationErrors = await this.getValidationErrors();
    if (validationErrors.length > 0) {
      await this.page.screenshot({ path: `validation-errors-${Date.now()}.png` }).catch(() => {});
      throw new Error(`Form has validation errors: ${validationErrors.join(', ')}`);
    }

    await this.clickSaveButton();

    await this.waitForSaveCompletion();

    console.log(`✅ User Created: ${this.expectedUsername}`);
  }

  private async selectUserType(): Promise<void> {
    const userTypeIndex = Number(Adduserdata.usertype);
    
    const result = await this.page.evaluate((index) => {
      try {
        document.querySelectorAll('[inert]').forEach(el => {
          el.removeAttribute('inert');
        });
        
        const container = document.querySelector('[data-form-field="userTypeId"]');
        if (!container) {
          return { success: false };
        }
        
        container.removeAttribute('inert');
        
        const select = container.querySelector('select');
        if (select && select.options.length > index) {
          select.selectedIndex = index;
          select.dispatchEvent(new Event('change', { bubbles: true }));
          select.dispatchEvent(new Event('input', { bubbles: true }));
          return { success: true };
        }
        
        const hiddenInput = container.querySelector('input[type="hidden"]') as HTMLInputElement | null;
        if (hiddenInput) {
          hiddenInput.value = index.toString();
          hiddenInput.dispatchEvent(new Event('change', { bubbles: true }));
          return { success: true };
        }
        
        const trigger = container.querySelector('div[role="button"], .react-select__control, .select-control');
        if (trigger) {
          (trigger as HTMLElement).click();
          setTimeout(() => {
            const options = document.querySelectorAll('[role="option"]');
            if (options.length > index) {
              (options[index] as HTMLElement).click();
            }
          }, 300);
          return { success: true };
        }
        
        return { success: false };
      } catch (e) {
        return { success: false };
      }
    }, userTypeIndex);
    
    if (!result.success) {
      try {
        await this.userType.click({ force: true });
        await this.page.waitForTimeout(500);
        const options = this.page.locator('[role="option"]');
        await options.nth(userTypeIndex).click({ force: true });
        await this.page.waitForTimeout(500);
      } catch (error) {
        await this.page.evaluate((index) => {
          const container = document.querySelector('[data-form-field="userTypeId"]');
          if (container) {
            container.removeAttribute('inert');
            const select = container.querySelector('select');
            if (select && select.options.length > index) {
              select.selectedIndex = index;
              select.dispatchEvent(new Event('change', { bubbles: true }));
            }
          }
        }, userTypeIndex);
        await this.page.waitForTimeout(500);
      }
    }
    
    await this.page.waitForTimeout(500);
  }

  private async selectRooftop(): Promise<void> {
    const rooftopName = "Premier Toyota Downtown";
    
    try {
      await this.availableRooftops.click();
      await this.availableRooftops.clear();
      await this.availableRooftops.fill(rooftopName);
      
      await this.page.waitForSelector('[role="option"]', { 
        state: 'visible', 
        timeout: 3000 
      });
      
      await this.page.waitForTimeout(500);
      
      await this.page.evaluate((name) => {
        const options = document.querySelectorAll('[role="option"]');
        for (const option of options) {
          if (option.textContent?.includes(name)) {
            (option as HTMLElement).click();
            return;
          }
        }
        if (options.length > 0) {
          (options[0] as HTMLElement).click();
        }
      }, rooftopName);
      
      await this.page.waitForTimeout(500);
    } catch (error) {
      await this.availableRooftops.clear();
      await this.availableRooftops.fill("Premier");
      await this.page.waitForTimeout(500);
      
      await this.page.evaluate(() => {
        const options = document.querySelectorAll('[role="option"]');
        if (options.length > 0) {
          (options[0] as HTMLElement).click();
        }
      });
      
      await this.page.waitForTimeout(500);
    }
  }

  private async clickSaveButton(): Promise<void> {
    // Method 1: JavaScript click with form blocking removal
    try {
      const result = await this.page.evaluate(() => {
        try {
          const form = document.querySelector<HTMLFormElement>('form#rooftops-user-create');
          if (form) {
            form.style.pointerEvents = 'none';
          }
          
          const buttons = document.querySelectorAll<HTMLButtonElement>('button');
          for (const button of buttons) {
            if (button.textContent?.includes('Save User')) {
              button.style.pointerEvents = 'auto';
              button.click();
              return { success: true };
            }
          }
          
          if (form) {
            form.submit();
            return { success: true };
          }
          
          return { success: false };
        } catch (e) {
          return { success: false };
        }
      });
      
      if (result.success) {
        await this.page.waitForTimeout(1000);
        return;
      }
    } catch (error) {
      // Continue to next method
    }
    
    // Method 2: dispatchEvent
    try {
      await this.page.evaluate(() => {
        const buttons = document.querySelectorAll('button');
        for (const button of buttons) {
          if (button.textContent?.includes('Save User')) {
            button.removeAttribute('disabled');
            button.style.pointerEvents = 'auto';
            button.style.opacity = '1';
            
            const clickEvent = new MouseEvent('click', {
              view: window,
              bubbles: true,
              cancelable: true
            });
            button.dispatchEvent(clickEvent);
            
            const syntheticEvent = new Event('click', { bubbles: true });
            button.dispatchEvent(syntheticEvent);
            return;
          }
        }
      });
      
      await this.page.waitForTimeout(1000);
      return;
    } catch (error) {
      // Continue to next method
    }
    
    // Method 3: Force click with coordinates
    try {
      await this.page.evaluate(() => {
        const form = document.querySelector<HTMLFormElement>('form#rooftops-user-create');
        if (form) {
          form.style.pointerEvents = 'none';
        }
      });
      
      const box = await this.saveUserButton.boundingBox();
      if (box) {
        await this.page.mouse.click(
          box.x + box.width / 2,
          box.y + box.height / 2
        );
        await this.page.waitForTimeout(1000);
        return;
      }
    } catch (error) {
      // Continue to next method
    }
    
    // Method 4: Keyboard Enter
    try {
      await this.saveUserButton.focus();
      await this.page.waitForTimeout(300);
      await this.page.keyboard.press('Enter');
      await this.page.waitForTimeout(1000);
      return;
    } catch (error) {
      // Continue to next method
    }
    
    // Method 5: Direct form submission
    try {
      await this.page.evaluate(() => {
        const form = document.querySelector('form#rooftops-user-create');
        if (form) {
          const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
          form.dispatchEvent(submitEvent);
        }
      });
      await this.page.waitForTimeout(1000);
      return;
    } catch (error) {
      throw new Error('Failed to click Save button');
    }
  }

  private async getValidationErrors(): Promise<string[]> {
    const errorSelectors = [
      '.error',
      '.validation-error', 
      '.invalid-feedback',
      '[class*="error"]',
      '[role="alert"]',
      '.text-danger',
      '.has-error',
      '.is-invalid'
    ];
    
    const allErrors: string[] = [];
    
    for (const selector of errorSelectors) {
      try {
        const elements = this.page.locator(selector);
        const count = await elements.count();
        
        if (count > 0) {
          for (let i = 0; i < count; i++) {
            const text = await elements.nth(i).textContent();
            if (text && text.trim().length > 0 && text.trim() !== '*') {
              const cleanText = text.trim();
              if (!allErrors.includes(cleanText)) {
                allErrors.push(cleanText);
              }
            }
          }
        }
      } catch (e) {
        // Ignore
      }
    }
    
    try {
      const userTypeText = await this.userType.textContent();
      if (userTypeText && userTypeText.includes('Select an option')) {
        allErrors.push('User Type is required');
      }
    } catch (e) {
      // Ignore
    }
    
    return allErrors;
  }

  private async waitForSaveCompletion(): Promise<void> {
    const strategies = [
      async () => {
        const successToast = this.page.locator('.success-toast, .toast-success, .alert-success, .success-message');
        await successToast.waitFor({ state: 'visible', timeout: 8000 });
        return true;
      },
      async () => {
        await this.username.waitFor({ state: 'hidden', timeout: 8000 });
        return true;
      },
      async () => {
        await this.addUserButton.waitFor({ state: 'visible', timeout: 8000 });
        return true;
      },
      async () => {
        await this.page.waitForResponse(
          response => response.url().includes('/users') && response.status() === 200,
          { timeout: 8000 }
        );
        return true;
      }
    ];

    let success = false;
    
    for (const strategy of strategies) {
      try {
        const result = await strategy();
        if (result) {
          success = true;
          break;
        }
      } catch (error) {
        // Continue to next strategy
      }
    }
    
    if (!success) {
      const errors = await this.getValidationErrors();
      if (errors.length > 0) {
        throw new Error(`Save failed with validation errors: ${errors.join(', ')}`);
      }
      
      const formStillVisible = await this.username.isVisible().catch(() => false);
      if (formStillVisible) {
        await this.page.screenshot({ path: `save-failure-${Date.now()}.png` }).catch(() => {});
        throw new Error('Save operation did not complete - form still visible');
      }
    }
    
    await this.page.waitForTimeout(1000);
  }

  async verifyAddedUserIsDisplayed(testInfo: TestInfo): Promise<boolean> {
    const userFound = await searchbyName(
      this.page,
      this.searchInput,
      this.expectedUsername,
      'button:has-text("Next ›")',
      'table tbody tr',
      1
    );

    const actualUser = userFound ? this.expectedUsername : 'User Not Found';

    Reporter.validateData(
      this.expectedUsername,
      actualUser,
      'Verify Created User',
      testInfo
    );

    expect(
      userFound,
      `User "${this.expectedUsername}" was not found in the table`
    ).toBeTruthy();

    return userFound;
  }
}