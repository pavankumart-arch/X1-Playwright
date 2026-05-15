// loginReport.spec.ts
import { test, expect, TestInfo } from '@playwright/test';

// ============================================================
// Helper function (inlined so everything is in one file)
// ============================================================
type ReportInput = {
  step: string;
  expected: any;
  actual: any;
  isSummary?: boolean;
};

function logAndValidate(result: ReportInput, testInfo?: TestInfo) {
  const formatValue = (value: any): string => {
    if (typeof value === 'string') return value;
    if (typeof value === 'number' || typeof value === 'boolean') return String(value);
    try {
      return JSON.stringify(value, null, 2);
    } catch {
      return String(value);
    }
  };

  const expectedStr = formatValue(result.expected);
  const actualStr = formatValue(result.actual);

  let isPass = false;
  if (typeof result.expected === 'object' && typeof result.actual === 'object' && result.expected !== null && result.actual !== null) {
    isPass = JSON.stringify(result.expected) === JSON.stringify(result.actual);
  } else {
    isPass = result.expected === result.actual;
  }

  const status = isPass ? 'PASS ✅' : 'FAIL ❌';

  const message = `
STEP     : ${result.step}
STATUS   : ${status}
EXPECTED : 
${expectedStr}
ACTUAL   :
${actualStr}
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

// ============================================================
// Actual test
// ============================================================
test('Login API - Validate response data', async ({ playwright }, testInfo: TestInfo) => {
  const loginUrl = 'https://x1console-sandbox.atamai.in/api/auth/login';

  const apiContext = await playwright.request.newContext({
    ignoreHTTPSErrors: true,   // because of self-signed certificate
  });

  const response = await apiContext.post(loginUrl, {
    data: {
      username: 'SuperAdmin',
      password: 'Admin@123',
    },
  });

  const responseBody = await response.json();

  const expectedData = {
    username: 'SuperAdmin',
    email: 'admin@devx.local',
  };

  const actualData = responseBody.data;   // adjust if your API returns a different structure

  logAndValidate(
    {
      step: 'Login API',
      expected: expectedData,
      actual: actualData,
    },
    testInfo
  );

  await apiContext.dispose();
});