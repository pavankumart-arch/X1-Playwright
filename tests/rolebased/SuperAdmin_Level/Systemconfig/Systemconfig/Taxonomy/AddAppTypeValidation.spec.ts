import { test, expect } from '@playwright/test';

import { Login }
from '../../../pages/Login/Loginpage';

import { LeftsideNavigation }
from '../../../pages/Navigations/LeftSideNavigation';

import { VerifyAppTypeValidation }
from '../../../pages/Systemconfig/Taxonomy/AddAppTypeValidation';

test(
    'Verify AppType Mandatory Field Validation',

    async ({ page }, testInfo) => {

        const loginPage =
            new Login(page);

        await loginPage.navigateToURL();

        await loginPage.loginToApplication();

        const navigation =
            new LeftsideNavigation(page);

        await navigation.gotoSystemConfig();

        await navigation.goToTaxonomy();

        await navigation.goToAppTypes();
        await navigation.AddAppType();

        await page.waitForLoadState('networkidle');

       // await page.goto('/admin/apps/create');

        const validationPage =
            new VerifyAppTypeValidation(page);

        const isSuccess =
            await validationPage
                .VerifyRequiredFieldValidation();

        console.log(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TEST STEP        : Verify AppType Required Field Validation

EXPECTED RESULT  :
1. Title is required
2. Type (Identifier) is required

ACTUAL RESULT    :
${
    isSuccess
        ? 'Both validation messages displayed successfully'
        : 'One or more validation messages not displayed'
}

STATUS           : ${
    isSuccess
        ? 'PASS ✅'
        : 'FAIL ❌'
}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`);

        testInfo.annotations.push({
            type: 'Expected Result',
            description:
                'Title is required and Type (Identifier) is required messages should be displayed'
        });

        testInfo.annotations.push({
            type: 'Actual Result',
            description:
                isSuccess
                    ? 'Validation messages displayed'
                    : 'Validation messages not displayed'
        });

        expect(
            isSuccess,
            'Mandatory field validation failed'
        ).toBeTruthy();
    }
);