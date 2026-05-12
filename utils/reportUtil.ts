import { expect, TestInfo } from '@playwright/test';

type ReportInput = {
  step: string;
  expected: any;
  actual: any;
  isSummary?: boolean;
};

export function logAndValidate(result: ReportInput, testInfo?: TestInfo) {

  const isPass =
    result.expected === result.actual ||
    String(result.actual).includes(String(result.expected));

  const status = isPass ? 'PASS ✅' : 'FAIL ❌';

  const message = `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
STEP     : ${result.step}
STATUS   : ${status}
EXPECTED : ${result.expected}
ACTUAL   : ${result.actual}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`;

  console.log(message);

  if (testInfo) {
    testInfo.annotations.push({
      type: 'Validation',
      description: message
    });
  }

  expect.soft(isPass).toBeTruthy();
}