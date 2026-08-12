import { Page } from '@playwright/test';

export class NavigationValidation {

    constructor(private page: Page) {}

    // Read all visible menu names
    async getLeftMenus(): Promise<string[]> {

        const menuNames = await this.page.locator('span').evaluateAll((elements) =>
            elements
                .map(e => e.textContent?.trim())
                .filter(text =>
                    text &&
                    [
                        "Dashboard",
                        "Resellers",
                        "Rooftops",
                        "List Rooftops",
                        "Application Config",
                        "System Config",
                        "Other",
                        "Users",
                        "Domain data"
                    ].includes(text)
                )
        );

        console.log("\nMenus after Login :", menuNames);

        return menuNames as string[];
    }

    async verifyMenu(
        actualMenus: string[],
        menuName: string,
        shouldExist: boolean
    ) {

        console.log(`\nVerify ${menuName}`);

        if (shouldExist) {

            console.log(`Expected : ${menuName} should be visible`);

            if (actualMenus.includes(menuName)) {

                console.log("\x1b[32mStatus : PASS\x1b[0m");
                console.log(`Actual : ${menuName} is visible. Working as expected.`);

            } else {

                console.log("\x1b[31mStatus : FAIL\x1b[0m");
                console.log(`Actual : ${menuName} is NOT visible.`);

            }

        } else {

            console.log(`Expected : ${menuName} should NOT be visible`);

            if (!actualMenus.includes(menuName)) {

                console.log("\x1b[32mStatus : PASS\x1b[0m");
                console.log(`Actual : ${menuName} is NOT visible. Working as expected.`);

            } else {

                console.log("\x1b[31mStatus : FAIL\x1b[0m");
                console.log(`Actual : ${menuName} is visible.`);

            }

        }

    }
}