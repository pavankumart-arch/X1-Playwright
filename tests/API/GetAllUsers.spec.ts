// tests/API/GetAllUsers.spec.ts

import { test, expect, request } from '@playwright/test';

// ======================================================
// BASE URL
// ======================================================

const BASE_URL = 'https://x1console-sandbox.atamai.in';

// ======================================================
// LOGIN API
// ======================================================

const LOGIN_API = '/api/auth/login';

// ======================================================
// GET USERS API
// ======================================================

const GET_USERS_API = '/api-it/admin/user/list';

// ======================================================
// LOGIN CREDENTIALS
// ======================================================

const USERNAME = 'SuperAdmin';
const PASSWORD = 'Admin@123';

// ======================================================
// HEADERS
// ======================================================

const headers = {
  'Accept': '*/*',
  'Content-Type': 'application/json',
  'Accept-Encoding': 'gzip, deflate, br',
  'Connection': 'keep-alive',
  'User-Agent': 'PostmanRuntime/7.51.1',
};

// ======================================================
// EXPECTED USERS
// ======================================================

const expectedUsers = [
  {
    id: 28,
    username: 'admin21',
    email: 'admin22@test.com',
    userType: 'Reseller Admin',
  },
  {
    id: 29,
    username: 'admin23',
    email: 'admin23@test.com',
    userType: 'Reseller Admin',
  },
  {
    id: 30,
    username: 'admin243@#$%',
    email: 'admin23@test-9999u22.com',
    userType: 'Reseller Admin',
  },
];

// ======================================================
// LOAD USERS
// ======================================================

const userLoads = [10, 20, 50, 100];

// ======================================================
// PERFORMANCE TEST
// ======================================================

for (const users of userLoads) {

  test(`Performance Test with ${users} concurrent users`, async () => {

    console.log(`
=====================================================
STARTING LOAD TEST FOR ${users} USERS
=====================================================`);

    const overallStartTime = Date.now();

    // ======================================================
    // CONCURRENT USERS
    // ======================================================

    const responseTimes = await Promise.all(

      Array.from({ length: users }).map(async (_, index) => {

        try {

          // ======================================================
          // CREATE SEPARATE USER CONTEXT
          // ======================================================

          const userContext = await request.newContext({
            baseURL: BASE_URL,
            extraHTTPHeaders: headers,
            ignoreHTTPSErrors: true,
          });

          // ======================================================
          // LOGIN API
          // ======================================================

          const loginResponse = await userContext.post(LOGIN_API, {
            data: {
              username: USERNAME,
              password: PASSWORD,
            },
          });

          // ======================================================
          // VALIDATE LOGIN
          // ======================================================

          expect(loginResponse.status()).toBe(200);

          // ======================================================
          // START TIMER
          // ======================================================

          const requestStart = Date.now();

          // ======================================================
          // GET USERS API
          // ======================================================

          const response = await userContext.get(GET_USERS_API);

          const requestEnd = Date.now();

          const responseTime = requestEnd - requestStart;

          // ======================================================
          // STATUS VALIDATION
          // ======================================================

          if (response.status() !== 200) {

            console.log(`
XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
FAILED USER   : ${index + 1}
STATUS CODE   : ${response.status()}
XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
`);

            return 0;
          }

          // ======================================================
          // RESPONSE BODY
          // ======================================================

          const responseBody = await response.json();

          // ======================================================
          // VALIDATE RESPONSE STRUCTURE
          // ======================================================

          expect(responseBody).toHaveProperty('data');
          expect(responseBody).toHaveProperty('meta');

          // ======================================================
          // VALIDATE EXPECTED USERS
          // ======================================================

          for (const expectedUser of expectedUsers) {

            const actualUser = responseBody.data.find(
              (user: any) => user.id === expectedUser.id
            );

            expect(actualUser).toBeTruthy();

            expect(actualUser.username).toBe(expectedUser.username);
            expect(actualUser.email).toBe(expectedUser.email);
            expect(actualUser.userType).toBe(expectedUser.userType);
          }

          // ======================================================
          // PERFORMANCE REQUIREMENT
          // ======================================================

          const performanceStatus =
            responseTime < 1000
              ? 'PASSED'
              : 'FAILED';

          // ======================================================
          // PERFORMANCE LOG
          // ======================================================

          console.log(`
-----------------------------------------------------
Request Number : ${index + 1}
Status Code    : ${response.status()}
Response Time  : ${responseTime} ms
Performance    : ${performanceStatus}
-----------------------------------------------------
`);

          await userContext.dispose();

          return responseTime;

        } catch (error) {

          console.error(`
XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
FAILED REQUEST : ${index + 1}
ERROR          : ${error}
XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
`);

          return 0;
        }
      })
    );

    // ======================================================
    // FINAL METRICS
    // ======================================================

    const overallEndTime = Date.now();

    const totalExecutionTime =
      overallEndTime - overallStartTime;

    const successfulResponses =
      responseTimes.filter(time => time > 0);

    const failedResponses =
      responseTimes.filter(time => time === 0);

    const averageResponseTime =
      successfulResponses.length > 0
        ? successfulResponses.reduce((a, b) => a + b, 0) /
          successfulResponses.length
        : 0;

    const minResponseTime =
      successfulResponses.length > 0
        ? Math.min(...successfulResponses)
        : 0;

    const maxResponseTime =
      successfulResponses.length > 0
        ? Math.max(...successfulResponses)
        : 0;

    // ======================================================
    // FINAL REPORT
    // ======================================================

    console.log(`
#########################################################
LOAD TEST COMPLETED
#########################################################

Concurrent Users   : ${users}

Successful Calls   : ${successfulResponses.length}

Failed Calls       : ${failedResponses.length}

Average Response   : ${averageResponseTime.toFixed(2)} ms

Minimum Response   : ${minResponseTime} ms

Maximum Response   : ${maxResponseTime} ms

Total Execution    : ${totalExecutionTime} ms

#########################################################
`);
  });
}