import { Page, TestInfo } from '@playwright/test';

interface UrlAccessItem { title: string; url: string; }

export interface UrlAccessData { AccessUrls: UrlAccessItem[]; NoAccessUrls: UrlAccessItem[]; }

export class rooftopUserAccess {

    constructor(private page: Page) {}

    async validateUrls(data: UrlAccessData, testInfo: TestInfo): Promise<void> {
        const failedUrls: string[] = [];
        const invalidTestData: string[] = [];
        let totalPassed = 0;
        let totalFailed = 0;
        let totalChecked = 0;

        if (data.AccessUrls && Array.isArray(data.AccessUrls)) {
            for (let index = 0; index < data.AccessUrls.length; index++) {
                const item = data.AccessUrls[index];
                if (!item || !item.url) {
                    invalidTestData.push(`AccessUrls[${index}] -> Title: ${item?.title ?? 'Missing'} | URL: ${item?.url ?? 'Missing'}`);
                    continue;
                }
                const passed = await this.checkUrl(item, 'AccessUrls', testInfo);
                totalChecked++;
                if (passed) { totalPassed++; } else { totalFailed++; failedUrls.push(`${item.title} -> ${item.url}`); }
            }
        }

        if (data.NoAccessUrls && Array.isArray(data.NoAccessUrls)) {
            for (let index = 0; index < data.NoAccessUrls.length; index++) {
                const item = data.NoAccessUrls[index];
                if (!item || !item.url) {
                    invalidTestData.push(`NoAccessUrls[${index}] -> Title: ${item?.title ?? 'Missing'} | URL: ${item?.url ?? 'Missing'}`);
                    continue;
                }
                const passed = await this.checkUrl(item, 'NoAccessUrls', testInfo);
                totalChecked++;
                if (passed) { totalPassed++; } else { totalFailed++; failedUrls.push(`${item.title} -> ${item.url}`); }
            }
        }

        const RESET = '\x1b[0m';
        const GREEN = '\x1b[32m';
        const RED = '\x1b[31m';
        const BLUE = '\x1b[34m';
        const YELLOW = '\x1b[33m';
        const BOLD = '\x1b[1m';

        console.log('\n');
        console.log(`${BOLD}${BLUE}${'='.repeat(70)}${RESET}`);
        console.log(`${BOLD}${BLUE}                 URL ACCESS TEST SUMMARY${RESET}`);
        console.log(`${BOLD}${BLUE}${'='.repeat(70)}${RESET}`);
        console.log(`${BOLD}${BLUE}📝 Total Test Cases : ${totalChecked}${RESET}`);
        console.log(`${BOLD}${GREEN}✅ Passed           : ${totalPassed}${RESET}`);
        console.log(`${BOLD}${RED}❌ Failed           : ${totalFailed}${RESET}`);
        console.log(`${BOLD}${YELLOW}⚠️ Invalid Data     : ${invalidTestData.length}${RESET}`);
        console.log(`${BOLD}${BLUE}${'='.repeat(70)}${RESET}`);

        const passPercentage = totalChecked > 0 ? ((totalPassed / totalChecked) * 100).toFixed(2) : '0.00';

        console.log(`${BOLD}${GREEN}📈 Pass Percentage  : ${passPercentage}%${RESET}`);

        if (totalFailed === 0 && invalidTestData.length === 0) {
            console.log(`${BOLD}${GREEN}🎉 OVERALL RESULT   : PASSED${RESET}`);
        } else {
            console.log(`${BOLD}${RED}💥 OVERALL RESULT   : FAILED${RESET}`);
        }

        console.log(`${BOLD}${BLUE}${'='.repeat(70)}${RESET}`);

        if (failedUrls.length > 0) {
            console.log('\n');
            console.log(`${BOLD}${RED}❌ FAILED TEST CASES${RESET}`);
            console.log(`${RED}${'-'.repeat(70)}${RESET}`);
            failedUrls.forEach((url, index) => { console.log(`${RED}${index + 1}. ${url}${RESET}`); });
            console.log(`${RED}${'-'.repeat(70)}${RESET}`);
        }

        if (invalidTestData.length > 0) {
            console.log('\n');
            console.log(`${BOLD}${YELLOW}⚠️ INVALID TEST DATA${RESET}`);
            console.log(`${YELLOW}${'-'.repeat(70)}${RESET}`);
            invalidTestData.forEach((item, index) => { console.log(`${YELLOW}${index + 1}. ${item}${RESET}`); });
            console.log(`${YELLOW}${'-'.repeat(70)}${RESET}`);
        }

        if (failedUrls.length > 0 || invalidTestData.length > 0) {
            throw new Error(`URL access validation failed. Failed URLs: ${failedUrls.length}, Invalid Test Data: ${invalidTestData.length}`);
        }
    }

    private async checkUrl(item: UrlAccessItem, accessType: 'AccessUrls' | 'NoAccessUrls', testInfo: TestInfo): Promise<boolean> {
        let httpStatus = 0;
        let responseText = '';
        let actualMessage = '';

        try {
            console.log('\n' + '='.repeat(70));
            console.log(item.title);
            console.log('='.repeat(70));
            console.log(`Type    : ${accessType}`);
            console.log(`URL     : ${item.url}`);

            const response = await this.page.goto(item.url, { waitUntil: 'domcontentloaded', timeout: 30000 });

            httpStatus = response ? response.status() : 0;

            console.log(`HTTP Status: ${httpStatus}`);

            try { await this.page.waitForLoadState('networkidle', { timeout: 10000 }); } catch { console.log(`Network idle timeout. Continuing: ${item.url}`); }

            try { await this.page.locator('body').waitFor({ state: 'visible', timeout: 10000 }); } catch { console.log(`Body did not become visible: ${item.url}`); }

            try { responseText = await this.page.locator('body').innerText({ timeout: 5000 }); } catch { responseText = ''; }

            const normalizedContent = responseText.toLowerCase().replace(/\s+/g, ' ').trim();

            const hasPermissionText = normalizedContent.includes('you do not have permission to access this resource');
            const hasAccessDeniedText = normalizedContent.includes('access denied');
            const hasUnauthorizedText = normalizedContent.includes('unauthorized');
            const hasForbiddenText = normalizedContent.includes('forbidden');
            const hasPermissionDeniedText = normalizedContent.includes('permission denied');
            const hasInvalidInputText = normalizedContent.includes('invalid input value');

            const hasErrorText = hasPermissionText || hasAccessDeniedText || hasUnauthorizedText || hasForbiddenText || hasPermissionDeniedText || hasInvalidInputText;

            if (hasPermissionText) { actualMessage = 'You do not have permission to access this resource.'; } else if (hasAccessDeniedText) { actualMessage = 'Access Denied'; } else if (hasUnauthorizedText) { actualMessage = 'Unauthorized'; } else if (hasForbiddenText) { actualMessage = 'Forbidden'; } else if (hasPermissionDeniedText) { actualMessage = 'Permission Denied'; } else if (hasInvalidInputText) { actualMessage = 'Invalid input value.'; } else if (httpStatus >= 400) { actualMessage = this.extractErrorMessage(responseText, httpStatus); } else { actualMessage = 'Page is accessible'; }

            let passed = false;

            if (accessType === 'AccessUrls') {
                passed = httpStatus < 400;
            }

            if (accessType === 'NoAccessUrls') {
                passed = httpStatus >= 400 && hasErrorText;
            }

            const status = passed ? 'PASS' : 'FAIL';

            console.log(`Expected: ${accessType === 'AccessUrls' ? 'HTTP status below 400' : 'HTTP status 400 or above with error message'}`);
            console.log(`URL     : ${item.url}`);
            console.log(`HTTP    : ${httpStatus}`);
            console.log(`Message : ${actualMessage}`);
            console.log(`Text    : ${hasErrorText ? 'Error message found' : 'Error message NOT found'}`);
            console.log(`Status  : ${status}`);
            console.log('-'.repeat(70));

            await this.attachResult(item.title, item.url, accessType, httpStatus, actualMessage, hasErrorText, status, testInfo);

            return passed;

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Navigation error / Unable to open page';

            console.log(`Expected: ${accessType === 'AccessUrls' ? 'HTTP status below 400' : 'HTTP status 400 or above with error message'}`);
            console.log(`URL     : ${item.url}`);
            console.log(`HTTP    : ${httpStatus || 'No response'}`);
            console.log(`Message : ${errorMessage}`);
            console.log('Status  : FAIL');
            console.log('-'.repeat(70));

            await this.attachResult(item.title, item.url, accessType, httpStatus, errorMessage, false, 'FAIL', testInfo);

            return false;
        }
    }

    private extractErrorMessage(responseText: string, httpStatus: number): string {
        const normalizedText = responseText.replace(/\s+/g, ' ').trim();
        if (!normalizedText) { return `HTTP ${httpStatus} Error`; }
        const permissionMatch = normalizedText.match(/you do not have permission to access this resource\.?/i);
        if (permissionMatch) { return permissionMatch[0]; }
        const invalidInputMatch = normalizedText.match(/invalid input value\.?/i);
        if (invalidInputMatch) { return invalidInputMatch[0]; }
        return normalizedText.length > 250 ? `${normalizedText.substring(0, 250)}...` : normalizedText;
    }

    private async attachResult(title: string, url: string, accessType: 'AccessUrls' | 'NoAccessUrls', httpStatus: number, actualMessage: string, hasErrorText: boolean, status: string, testInfo: TestInfo): Promise<void> {
        const expectedMessage = accessType === 'AccessUrls' ? 'HTTP status should be below 400' : 'HTTP status should be 400 or above and error message should be present';

        await testInfo.attach(title, {
            body: `Page     : ${title}
URL      : ${url}
Type     : ${accessType}
Expected : ${expectedMessage}
HTTP     : ${httpStatus || 'No response'}
Message  : ${actualMessage}
Error Text: ${hasErrorText ? 'Found' : 'Not Found'}
Status   : ${status}`,
            contentType: 'text/plain'
        });
    }
}