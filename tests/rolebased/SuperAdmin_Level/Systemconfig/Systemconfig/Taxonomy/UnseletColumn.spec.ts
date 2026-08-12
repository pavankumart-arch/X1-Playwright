import { test } from '@playwright/test';

import { AppTypeColumns } from '../../../pages/Systemconfig/Taxonomy/UnseletColumn';
import { Login } from '../../../pages/Login/Loginpage';
import { LeftsideNavigation } from '../../../pages/Navigations/LeftSideNavigation';
import { Taxonomy  } from '../../../pages/Systemconfig/Taxonomy/AddAppType';


test.describe('App Types Column Visibility Verification', () => {

  test('Verify hidden column should not display in UI', async ({ page }) => {
    const loginPage = new Login(page);
            const navigation = new LeftsideNavigation(page);
             const taxonomy = new Taxonomy(page);
                  
                      await loginPage.navigateToURL();
                  
                      await loginPage.loginToApplication();
                  
                      await navigation.gotoSystemConfig();
                  
                      await navigation.goToTaxonomy();
                  
                      await navigation.goToAppTypes();
        
            await page.waitForLoadState('networkidle');
        
        // Wait for dashboard load
        await page.waitForLoadState('networkidle');
    
        // =========================================
        // ✅ NAVIGATE TO APP TYPES PAGE
        // =========================================
        await page.click('text=Taxonomy');
    
        await page.click('text=AppTypes');
    
        await page.waitForLoadState('networkidle');
    

    const appTypeColumns = new AppTypeColumns(page);

    // =========================================
    // ✅ COLUMN TO HIDE
    // =========================================
    const columnName = 'Updated';

    // Verify column initially visible
    await appTypeColumns.verifyColumnVisible(columnName);

    // Hide column
    await appTypeColumns.hideColumn(columnName);

    // Verify hidden
    await appTypeColumns.verifyColumnHidden(columnName);

    console.log('✅ Column visibility validation completed');
  });

});