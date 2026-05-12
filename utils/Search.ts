import { Page } from '@playwright/test';

export async function searchbyName(
  page: Page,
  name: string,
  nextButton: string,
  tableRows: string,
  nameColumnIndex: number
): Promise<boolean> {

  while (true) {
    const rows = page.locator(tableRows);
    const rowCount = await rows.count();

    for (let i = 0; i < rowCount; i++) {
      const cell = rows.nth(i).locator('td').nth(nameColumnIndex);
      const text = (await cell.textContent())?.trim();

      if (text?.toLowerCase().includes(name.toLowerCase())) {
        console.log(`✅ Found record: ${name}`);
        return true;
      }
    }

    const next = page.locator(nextButton);

    if (!(await next.isVisible()) || await next.isDisabled()) {
      break;
    }

    await next.click();
    await page.waitForTimeout(1000);
  }

  console.log(`❌ Record not found: ${name}`);
  return false;
}