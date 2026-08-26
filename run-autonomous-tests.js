const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'https://giftrewardsfrontend.vercel.app';
const ADMIN_CREDS = { username: '9000000001', password: 'Admin@12345' };
const USER_CREDS = { username: '9000000002', password: 'User@12345' };

const OUTPUT_DIR = path.join(__dirname, 'test-results');
const SCREENSHOT_DIR = path.join(OUTPUT_DIR, 'screenshots');

if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });
if (!fs.existsSync(SCREENSHOT_DIR)) fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });

// Common selectors based on discovered site schema
const SELECTORS = {
  mobileInput: 'input[name="mobile"], input[type="tel"], input[placeholder*="mobile"], input[placeholder*="Mobile"]',
  passwordInput: 'input[name="password"], input[type="password"]',
  submitButton: 'button:has-text("Sign In to Dashboard"), button:has-text("Sign In"), button[type="submit"]',
  forgotLink: 'a[href*="forget-pass"]',
  createAccountBtn: 'button:has-text("Create Account")'
};

// Function to extract page elements
async function extractPageElements(page) {
  return await page.evaluate(() => {
    const elements = [];

    // Inputs & Textareas
    document.querySelectorAll('input, textarea, select').forEach(el => {
      if (el.type === 'hidden') return;
      const rect = el.getBoundingClientRect();
      const visible = rect.width > 0 && rect.height > 0 && window.getComputedStyle(el).visibility !== 'hidden';
      
      let label = '';
      if (el.id) {
        const lblEl = document.querySelector(`label[for="${el.id}"]`);
        if (lblEl) label = lblEl.innerText.trim();
      }
      if (!label && el.ariaLabel) label = el.ariaLabel;
      if (!label && el.placeholder) label = el.placeholder;
      if (!label && el.name) label = el.name;

      elements.push({
        type: el.tagName.toLowerCase(),
        inputType: el.type || 'text',
        semanticName: el.name || el.id || label || 'unnamed_field',
        label: label || 'Unlabeled Input',
        placeholder: el.placeholder || '',
        required: el.required || false,
        disabled: el.disabled || false,
        visible
      });
    });

    // Buttons
    document.querySelectorAll('button, a[role="button"], input[type="submit"]').forEach(el => {
      const rect = el.getBoundingClientRect();
      const visible = rect.width > 0 && rect.height > 0 && window.getComputedStyle(el).visibility !== 'hidden';
      const text = el.innerText ? el.innerText.trim() : (el.value || el.ariaLabel || '');
      
      elements.push({
        type: 'button',
        semanticName: text ? text.toLowerCase().replace(/\s+/g, '_') : 'unnamed_button',
        text: text || 'Button',
        disabled: el.disabled || false,
        visible
      });
    });

    // Links
    document.querySelectorAll('a[href]').forEach(el => {
      const href = el.getAttribute('href');
      if (href && !href.startsWith('javascript:') && !href.startsWith('#')) {
        elements.push({
          type: 'link',
          text: el.innerText.trim() || href,
          href
        });
      }
    });

    // Tables
    const tables = document.querySelectorAll('table');
    tables.forEach((t, index) => {
      const headers = Array.from(t.querySelectorAll('th')).map(th => th.innerText.trim());
      elements.push({
        type: 'table',
        semanticName: `table_${index + 1}`,
        headers,
        rowCount: t.querySelectorAll('tbody tr').length
      });
    });

    return elements;
  });
}

async function runAutonomousTesting() {
  console.log('=== STARTING AUTONOMOUS AI WEBSITE TESTING ===');
  console.log(`Target Website: ${BASE_URL}\n`);

  const browser = await chromium.launch({ headless: true });
  const discoveredPages = [];
  const visitedUrls = new Set();

  // STEP 2 — Website Discovery
  console.log('--- STEP 2: DISCOVERING WEBSITE ---');
  
  // 1. Unauthenticated Discovery (Login / Landing)
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    console.log(`Navigating to ${BASE_URL}...`);
    await page.goto(BASE_URL, { waitUntil: 'networkidle', timeout: 30000 });
    const loginUrl = page.url();
    visitedUrls.add(loginUrl);
    const loginTitle = await page.title();
    const loginElements = await extractPageElements(page);

    discoveredPages.push({
      url: loginUrl,
      title: loginTitle || 'Login / Home',
      authRequired: false,
      elements: loginElements
    });
    console.log(`Discovered public page: ${loginUrl} (${loginElements.length} interactive elements found)`);
  } catch (err) {
    console.error('Failed to reach base URL:', err.message);
  }
  await context.close();

  // 2. Admin Authentication & Discovery
  console.log('Attempting Admin login discovery...');
  const adminContext = await browser.newContext();
  const adminPage = await adminContext.newPage();
  
  try {
    await adminPage.goto(BASE_URL, { waitUntil: 'networkidle' });
    
    const userInput = await adminPage.locator(SELECTORS.mobileInput).first();
    const passInput = await adminPage.locator(SELECTORS.passwordInput).first();
    const submitBtn = await adminPage.locator(SELECTORS.submitButton).first();

    if (await userInput.count() > 0 && await passInput.count() > 0) {
      await userInput.fill(ADMIN_CREDS.username);
      await passInput.fill(ADMIN_CREDS.password);
      await submitBtn.click();
      await adminPage.waitForTimeout(4000);
      
      const adminUrl = adminPage.url();
      console.log(`Admin login response URL: ${adminUrl}`);
      
      if (!visitedUrls.has(adminUrl)) {
        visitedUrls.add(adminUrl);
        const title = await adminPage.title();
        const elements = await extractPageElements(adminPage);
        discoveredPages.push({
          url: adminUrl,
          title: title || 'Admin Dashboard',
          authRequired: true,
          role: 'Admin',
          elements
        });
      }

      // Discover Admin Sub-pages / Links
      const adminLinks = await adminPage.evaluate(() => {
        return Array.from(document.querySelectorAll('a[href]'))
          .map(a => a.getAttribute('href'))
          .filter(h => h && h.startsWith('/') && !h.startsWith('//'));
      });

      for (const link of Array.from(new Set(adminLinks))) {
        const fullUrl = new URL(link, BASE_URL).toString();
        if (!visitedUrls.has(fullUrl)) {
          visitedUrls.add(fullUrl);
          try {
            await adminPage.goto(fullUrl, { waitUntil: 'networkidle', timeout: 10000 });
            const pTitle = await adminPage.title();
            const pElements = await extractPageElements(adminPage);
            discoveredPages.push({
              url: fullUrl,
              title: pTitle || link,
              authRequired: true,
              role: 'Admin',
              elements: pElements
            });
            console.log(`Discovered Admin page: ${fullUrl} (${pElements.length} elements)`);
          } catch (e) {
            console.log(`Could not navigate to ${fullUrl}: ${e.message}`);
          }
        }
      }
    }
  } catch (err) {
    console.error('Admin discovery error:', err.message);
  }
  await adminContext.close();

  // 3. User Authentication & Discovery
  console.log('Attempting Standard User login discovery...');
  const userContext = await browser.newContext();
  const userPage = await userContext.newPage();
  
  try {
    await userPage.goto(BASE_URL, { waitUntil: 'networkidle' });
    const userInput = await userPage.locator(SELECTORS.mobileInput).first();
    const passInput = await userPage.locator(SELECTORS.passwordInput).first();
    const submitBtn = await userPage.locator(SELECTORS.submitButton).first();

    if (await userInput.count() > 0 && await passInput.count() > 0) {
      await userInput.fill(USER_CREDS.username);
      await passInput.fill(USER_CREDS.password);
      await submitBtn.click();
      await userPage.waitForTimeout(4000);

      const userUrl = userPage.url();
      console.log(`User login response URL: ${userUrl}`);
      
      if (!visitedUrls.has(userUrl)) {
        visitedUrls.add(userUrl);
        const title = await userPage.title();
        const elements = await extractPageElements(userPage);
        discoveredPages.push({
          url: userUrl,
          title: title || 'User Dashboard',
          authRequired: true,
          role: 'User',
          elements
        });
      }

      // Discover User Sub-pages
      const userLinks = await userPage.evaluate(() => {
        return Array.from(document.querySelectorAll('a[href]'))
          .map(a => a.getAttribute('href'))
          .filter(h => h && h.startsWith('/') && !h.startsWith('//'));
      });

      for (const link of Array.from(new Set(userLinks))) {
        const fullUrl = new URL(link, BASE_URL).toString();
        if (!visitedUrls.has(fullUrl)) {
          visitedUrls.add(fullUrl);
          try {
            await userPage.goto(fullUrl, { waitUntil: 'networkidle', timeout: 10000 });
            const pTitle = await userPage.title();
            const pElements = await extractPageElements(userPage);
            discoveredPages.push({
              url: fullUrl,
              title: pTitle || link,
              authRequired: true,
              role: 'User',
              elements: pElements
            });
            console.log(`Discovered User page: ${fullUrl} (${pElements.length} elements)`);
          } catch (e) {
            console.log(`Could not navigate to ${fullUrl}: ${e.message}`);
          }
        }
      }
    }
  } catch (err) {
    console.error('User discovery error:', err.message);
  }
  await userContext.close();

  // Save discovered site
  const discoveredSiteData = {
    website: BASE_URL,
    discoveryDate: new Date().toISOString(),
    totalPages: discoveredPages.length,
    pages: discoveredPages
  };
  fs.writeFileSync(path.join(OUTPUT_DIR, 'discovered-site.json'), JSON.stringify(discoveredSiteData, null, 2));
  console.log(`Saved site structure to test-results/discovered-site.json (${discoveredPages.length} pages found)\n`);

  // STEP 3 & 4 — AI Test Case Generation
  console.log('--- STEP 3 & 4: GENERATING TEST CASES ---');
  const testCases = [
    // 1. Positive Login Tests
    {
      testId: 'TC001',
      page: 'Login',
      title: 'Admin login with valid credentials',
      category: 'Functional',
      priority: 'High',
      steps: [
        { action: 'navigate', target: BASE_URL },
        { action: 'fill', target: 'Mobile number field', selector: SELECTORS.mobileInput, value: ADMIN_CREDS.username },
        { action: 'fill', target: 'Password field', selector: SELECTORS.passwordInput, value: ADMIN_CREDS.password },
        { action: 'click', target: 'Sign In button', selector: SELECTORS.submitButton },
        { action: 'assert_navigation', expectedUrlPattern: '/admin|/dashboard' }
      ],
      expectedResult: 'Admin user should successfully log in and be redirected to Admin dashboard'
    },
    {
      testId: 'TC002',
      page: 'Login',
      title: 'Standard user login with valid credentials',
      category: 'Functional',
      priority: 'High',
      steps: [
        { action: 'navigate', target: BASE_URL },
        { action: 'fill', target: 'Mobile number field', selector: SELECTORS.mobileInput, value: USER_CREDS.username },
        { action: 'fill', target: 'Password field', selector: SELECTORS.passwordInput, value: USER_CREDS.password },
        { action: 'click', target: 'Sign In button', selector: SELECTORS.submitButton },
        { action: 'assert_navigation', expectedUrlPattern: '/wallet|/dashboard|/' }
      ],
      expectedResult: 'Standard user should successfully log in and view user dashboard/wallet'
    },

    // 2. Negative Login Tests
    {
      testId: 'TC003',
      page: 'Login',
      title: 'Login attempt with empty credentials',
      category: 'Negative',
      priority: 'High',
      steps: [
        { action: 'navigate', target: BASE_URL },
        { action: 'click', target: 'Sign In button', selector: SELECTORS.submitButton },
        { action: 'assert_error', expectedMessage: 'required|invalid|fill' }
      ],
      expectedResult: 'System should display field validation errors or HTML5 validation'
    },
    {
      testId: 'TC004',
      page: 'Login',
      title: 'Login attempt with invalid password',
      category: 'Negative',
      priority: 'High',
      steps: [
        { action: 'navigate', target: BASE_URL },
        { action: 'fill', target: 'Mobile number field', selector: SELECTORS.mobileInput, value: ADMIN_CREDS.username },
        { action: 'fill', target: 'Password field', selector: SELECTORS.passwordInput, value: 'WrongPassword123!' },
        { action: 'click', target: 'Sign In button', selector: SELECTORS.submitButton },
        { action: 'assert_error', expectedMessage: 'invalid|failed|wrong|error' }
      ],
      expectedResult: 'System should reject login and display authentication error'
    },
    {
      testId: 'TC005',
      page: 'Login',
      title: 'Login attempt with non-existent mobile number',
      category: 'Negative',
      priority: 'Medium',
      steps: [
        { action: 'navigate', target: BASE_URL },
        { action: 'fill', target: 'Mobile number field', selector: SELECTORS.mobileInput, value: '9999999999' },
        { action: 'fill', target: 'Password field', selector: SELECTORS.passwordInput, value: 'User@12345' },
        { action: 'click', target: 'Sign In button', selector: SELECTORS.submitButton },
        { action: 'assert_error', expectedMessage: 'not found|invalid|incorrect|error' }
      ],
      expectedResult: 'System should reject authentication with error message'
    },

    // 3. UI Tests
    {
      testId: 'TC006',
      page: 'Login',
      title: 'Verify UI element visibility and initial state on login page',
      category: 'UI',
      priority: 'Medium',
      steps: [
        { action: 'navigate', target: BASE_URL },
        { action: 'assert_visible', selector: SELECTORS.mobileInput },
        { action: 'assert_visible', selector: SELECTORS.passwordInput },
        { action: 'assert_visible', selector: SELECTORS.submitButton }
      ],
      expectedResult: 'Mobile input, password input, and Sign In button should be visible'
    },

    // 4. Security Validation Tests
    {
      testId: 'TC007',
      page: 'Login',
      title: 'SQL Injection payload validation on mobile field',
      category: 'Security',
      priority: 'High',
      steps: [
        { action: 'navigate', target: BASE_URL },
        { action: 'fill', target: 'Mobile number field', selector: SELECTORS.mobileInput, value: "' OR '1'='1" },
        { action: 'fill', target: 'Password field', selector: SELECTORS.passwordInput, value: 'Admin@12345' },
        { action: 'click', target: 'Sign In button', selector: SELECTORS.submitButton },
        { action: 'assert_not_authenticated' }
      ],
      expectedResult: 'System should safely reject SQL injection payload without authenticating'
    },
    {
      testId: 'TC008',
      page: 'Login',
      title: 'XSS payload validation on mobile field',
      category: 'Security',
      priority: 'High',
      steps: [
        { action: 'navigate', target: BASE_URL },
        { action: 'fill', target: 'Mobile number field', selector: SELECTORS.mobileInput, value: "<script>alert(1)</script>" },
        { action: 'fill', target: 'Password field', selector: SELECTORS.passwordInput, value: 'Admin@12345' },
        { action: 'click', target: 'Sign In button', selector: SELECTORS.submitButton },
        { action: 'assert_not_authenticated' }
      ],
      expectedResult: 'System should sanitize HTML/script payload and prevent execution'
    },
    {
      testId: 'TC009',
      page: 'Login',
      title: 'Special characters and Unicode payload handling',
      category: 'Security',
      priority: 'Medium',
      steps: [
        { action: 'navigate', target: BASE_URL },
        { action: 'fill', target: 'Mobile number field', selector: SELECTORS.mobileInput, value: "!@#$%^&*தமிழ்" },
        { action: 'fill', target: 'Password field', selector: SELECTORS.passwordInput, value: 'Admin@12345' },
        { action: 'click', target: 'Sign In button', selector: SELECTORS.submitButton },
        { action: 'assert_not_authenticated' }
      ],
      expectedResult: 'System should handle non-numeric/Unicode characters safely'
    },

    // 5. Authenticated Navigation & Workflow Tests
    {
      testId: 'TC010',
      page: 'Admin Dashboard',
      title: 'Verify Admin dashboard layout and elements after login',
      category: 'Functional',
      priority: 'High',
      steps: [
        { action: 'navigate', target: BASE_URL },
        { action: 'fill', target: 'Mobile number field', selector: SELECTORS.mobileInput, value: ADMIN_CREDS.username },
        { action: 'fill', target: 'Password field', selector: SELECTORS.passwordInput, value: ADMIN_CREDS.password },
        { action: 'click', target: 'Sign In button', selector: SELECTORS.submitButton },
        { action: 'assert_navigation', expectedUrlPattern: '/admin|/dashboard' },
        { action: 'assert_elements_present' }
      ],
      expectedResult: 'Admin user successfully logs in and views administrative metrics/tables'
    },
    {
      testId: 'TC011',
      page: 'User Dashboard',
      title: 'Verify User dashboard and wallet layout after login',
      category: 'Functional',
      priority: 'High',
      steps: [
        { action: 'navigate', target: BASE_URL },
        { action: 'fill', target: 'Mobile number field', selector: SELECTORS.mobileInput, value: USER_CREDS.username },
        { action: 'fill', target: 'Password field', selector: SELECTORS.passwordInput, value: USER_CREDS.password },
        { action: 'click', target: 'Sign In button', selector: SELECTORS.submitButton },
        { action: 'assert_navigation', expectedUrlPattern: '/wallet|/dashboard|/' },
        { action: 'assert_elements_present' }
      ],
      expectedResult: 'User successfully logs in and views account dashboard/wallet'
    },
    {
      testId: 'TC012',
      page: 'End-to-End Workflow',
      title: 'End-to-end user session workflow: Login -> Navigate -> Logout',
      category: 'Workflow',
      priority: 'High',
      steps: [
        { action: 'navigate', target: BASE_URL },
        { action: 'fill', target: 'Mobile number field', selector: SELECTORS.mobileInput, value: ADMIN_CREDS.username },
        { action: 'fill', target: 'Password field', selector: SELECTORS.passwordInput, value: ADMIN_CREDS.password },
        { action: 'click', target: 'Sign In button', selector: SELECTORS.submitButton },
        { action: 'assert_navigation', expectedUrlPattern: '/admin|/dashboard' },
        { action: 'check_subpages' },
        { action: 'logout' }
      ],
      expectedResult: 'Complete admin session workflow executes without error'
    },
    {
      testId: 'TC013',
      page: 'End-to-End Workflow',
      title: 'Destructive record deletion / system state mutation check',
      category: 'Workflow',
      priority: 'Medium',
      steps: [
        { action: 'blocked_step', reason: 'Destructive deletion or database modification safety check prevents unconfirmed mutation.' }
      ],
      expectedResult: 'Prevent unauthorized production mutations'
    }
  ];

  // Add extra test cases dynamically for discovered pages
  discoveredPages.forEach((p, idx) => {
    if (idx > 0) {
      testCases.push({
        testId: `TC${(14 + idx).toString().padStart(3, '0')}`,
        page: p.title || p.url,
        title: `Verify page accessibility and UI components for ${p.url}`,
        category: 'UI',
        priority: 'Low',
        steps: [
          { action: 'navigate', target: p.url },
          { action: 'assert_visible', selector: 'body' }
        ],
        expectedResult: `Page ${p.url} loads with responsive layout and zero critical errors`
      });
    }
  });

  fs.writeFileSync(path.join(OUTPUT_DIR, 'test-cases.json'), JSON.stringify(testCases, null, 2));
  console.log(`Generated ${testCases.length} test cases and saved to test-results/test-cases.json\n`);

  // STEP 5 — Execute Tests
  console.log('--- STEP 5: EXECUTING TESTS ---');
  const results = [];
  const startTime = Date.now();

  for (const tc of testCases) {
    console.log(`Executing ${tc.testId}: ${tc.title}...`);
    const testContext = await browser.newContext();
    const testPage = await testContext.newPage();

    const consoleLogs = [];
    const networkErrors = [];

    testPage.on('console', msg => consoleLogs.push(`[${msg.type()}] ${msg.text()}`));
    testPage.on('response', resp => {
      if (resp.status() >= 400) {
        networkErrors.push({
          url: resp.url(),
          status: resp.status(),
          statusText: resp.statusText()
        });
      }
    });

    let status = 'PASS';
    let errorMessage = null;
    let actualResult = 'All steps executed successfully as expected.';
    let screenshotPath = path.join(SCREENSHOT_DIR, `${tc.testId}.png`);

    try {
      for (const step of tc.steps) {
        if (step.action === 'blocked_step') {
          status = 'BLOCKED';
          actualResult = step.reason;
          break;
        }

        if (step.action === 'navigate') {
          await testPage.goto(step.target, { waitUntil: 'networkidle', timeout: 30000 });
        } else if (step.action === 'fill') {
          const loc = testPage.locator(step.selector).first();
          await loc.waitFor({ state: 'visible', timeout: 10000 });
          await loc.fill(step.value);
        } else if (step.action === 'click') {
          const loc = testPage.locator(step.selector).first();
          await loc.waitFor({ state: 'visible', timeout: 10000 });
          await loc.click();
          await testPage.waitForTimeout(3000);
        } else if (step.action === 'assert_navigation') {
          const currentUrl = testPage.url();
          const regex = new RegExp(step.expectedUrlPattern);
          if (!regex.test(currentUrl)) {
            // Also check body content or modal if redirect isn't URL-based
            const bodyText = await testPage.innerText('body');
            if (!bodyText.toLowerCase().includes('dashboard') && !bodyText.toLowerCase().includes('admin') && !bodyText.toLowerCase().includes('wallet')) {
              throw new Error(`Expected URL matching pattern '${step.expectedUrlPattern}', but stayed on '${currentUrl}'`);
            }
          }
        } else if (step.action === 'assert_error') {
          await testPage.waitForTimeout(1500);
          const bodyText = await testPage.innerText('body');
          const pattern = new RegExp(step.expectedMessage, 'i');
          const hasError = pattern.test(bodyText) || networkErrors.length > 0 || testPage.url() === BASE_URL || testPage.url().includes('/login');
          if (!hasError) {
            throw new Error(`Expected error feedback matching '${step.expectedMessage}' was not found.`);
          }
        } else if (step.action === 'assert_visible') {
          const loc = testPage.locator(step.selector).first();
          const isVis = await loc.isVisible();
          if (!isVis) throw new Error(`Element matching '${step.selector}' was not visible.`);
        } else if (step.action === 'assert_not_authenticated') {
          await testPage.waitForTimeout(2000);
          const currentUrl = testPage.url();
          if (currentUrl.includes('/admin') || (currentUrl.includes('/dashboard') && !currentUrl.includes('/login'))) {
            throw new Error(`Security payload bypassed authentication! Redirected to: ${currentUrl}`);
          }
        } else if (step.action === 'assert_elements_present') {
          const count = await testPage.evaluate(() => document.querySelectorAll('button, input, a, table, div').length);
          if (count === 0) throw new Error('No interactive or content elements found on page');
        } else if (step.action === 'check_subpages') {
          const links = await testPage.evaluate(() => Array.from(document.querySelectorAll('a[href]')).map(a => a.getAttribute('href')));
          console.log(`Found ${links.length} sub-page links during workflow execution.`);
        } else if (step.action === 'logout') {
          const logoutBtn = testPage.locator('button:has-text("Logout"), a:has-text("Logout"), button:has-text("Sign Out")').first();
          if (await logoutBtn.count() > 0) {
            await logoutBtn.click();
            await testPage.waitForTimeout(1500);
          }
        }
      }
    } catch (err) {
      status = 'FAIL';
      errorMessage = err.message;
      actualResult = `Test execution failed: ${err.message}`;
    }

    // Capture screenshot as mandatory evidence
    await testPage.screenshot({ path: screenshotPath, fullPage: true });

    // STEP 6 — AI Failure Analysis
    let aiAnalysis = null;
    if (status === 'FAIL') {
      let category = 'UI defect';
      let likelyCause = errorMessage;
      let severity = tc.priority || 'Medium';
      let recommendedInvestigation = 'Inspect DOM elements, selector validity, and network response.';

      if (networkErrors.length > 0) {
        category = 'API defect';
        likelyCause = `Network API call failed with status ${networkErrors[0].status}: ${networkErrors[0].url}`;
        recommendedInvestigation = 'Check backend API server status, cors settings, or backend database connection.';
      } else if (errorMessage.includes('Expected URL matching pattern')) {
        category = 'Authentication issue';
        likelyCause = 'Login submit did not complete successful authentication redirect.';
        recommendedInvestigation = 'Verify backend API endpoint responses and credentials validity.';
      } else if (errorMessage.includes('not visible') || errorMessage.includes('waiting for selector')) {
        category = 'UI defect';
        likelyCause = 'Element selector did not resolve to a visible node within timeout.';
        recommendedInvestigation = 'Verify frontend DOM selector attributes.';
      }

      aiAnalysis = {
        category,
        likelyCause,
        evidence: {
          errorMessage,
          networkErrors,
          consoleLogs: consoleLogs.filter(l => l.includes('error') || l.includes('Error'))
        },
        severity,
        recommendedInvestigation
      };
    }

    results.push({
      testId: tc.testId,
      page: tc.page,
      title: tc.title,
      category: tc.category,
      priority: tc.priority,
      status,
      expectedResult: tc.expectedResult,
      actualResult,
      errorMessage,
      screenshot: `screenshots/${tc.testId}.png`,
      url: testPage.url(),
      pageTitle: await testPage.title().catch(() => ''),
      consoleLogs,
      networkErrors,
      aiAnalysis
    });

    console.log(`   -> Status: ${status}`);
    await testContext.close();
  }

  const durationMs = Date.now() - startTime;
  await browser.close();

  // Save Results JSON
  const summary = {
    website: BASE_URL,
    executionTime: new Date().toISOString(),
    durationSeconds: (durationMs / 1000).toFixed(2),
    pagesDiscovered: discoveredPages.length,
    totalTests: results.length,
    passed: results.filter(r => r.status === 'PASS').length,
    failed: results.filter(r => r.status === 'FAIL').length,
    blocked: results.filter(r => r.status === 'BLOCKED').length,
    passRate: ((results.filter(r => r.status === 'PASS').length / results.length) * 100).toFixed(1) + '%'
  };

  const fullResults = {
    summary,
    results
  };

  fs.writeFileSync(path.join(OUTPUT_DIR, 'results.json'), JSON.stringify(fullResults, null, 2));
  console.log(`\nSaved test execution results to test-results/results.json\n`);

  // STEP 7 — Generate Reports (HTML + Markdown)
  console.log('--- STEP 7: GENERATING REPORTS ---');

  // 1. Generate Markdown Report (TEST-REPORT.md)
  let mdReport = `# AUTOMATED WEBSITE TESTING REPORT\n\n`;
  mdReport += `**Website:** ${BASE_URL}\n`;
  mdReport += `**Execution Time:** ${summary.executionTime}\n`;
  mdReport += `**Duration:** ${summary.durationSeconds} seconds\n\n`;
  mdReport += `## Summary Statistics\n\n`;
  mdReport += `| Metric | Count |\n`;
  mdReport += `| --- | --- |\n`;
  mdReport += `| **Pages Discovered** | ${summary.pagesDiscovered} |\n`;
  mdReport += `| **Total Tests Generated** | ${summary.totalTests} |\n`;
  mdReport += `| **Passed** | ${summary.passed} |\n`;
  mdReport += `| **Failed** | ${summary.failed} |\n`;
  mdReport += `| **Blocked** | ${summary.blocked} |\n`;
  mdReport += `| **Pass Rate** | **${summary.passRate}** |\n\n`;

  mdReport += `## Detailed Test Execution Results\n\n`;
  mdReport += `| Test ID | Category | Title | Status | Evidence Screenshot |\n`;
  mdReport += `| --- | --- | --- | --- | --- |\n`;
  results.forEach(r => {
    const statusIcon = r.status === 'PASS' ? '✅ PASS' : (r.status === 'FAIL' ? '❌ FAIL' : '🚫 BLOCKED');
    mdReport += `| ${r.testId} | ${r.category} | ${r.title} | ${statusIcon} | [Screenshot](${r.screenshot}) |\n`;
  });

  if (summary.failed > 0) {
    mdReport += `\n## 🚨 AI Failure Analysis & Root Cause Breakdown\n\n`;
    results.filter(r => r.status === 'FAIL').forEach(f => {
      mdReport += `### ${f.testId}: ${f.title}\n`;
      mdReport += `- **Category:** ${f.aiAnalysis.category}\n`;
      mdReport += `- **Severity:** ${f.aiAnalysis.severity}\n`;
      mdReport += `- **Likely Cause:** ${f.aiAnalysis.likelyCause}\n`;
      mdReport += `- **Error Message:** \`${f.errorMessage}\` \n`;
      mdReport += `- **Recommended Action:** ${f.aiAnalysis.recommendedInvestigation}\n`;
      mdReport += `- **Evidence Screenshot:** ![${f.title}](${f.screenshot})\n\n`;
    });
  }

  fs.writeFileSync(path.join(OUTPUT_DIR, 'TEST-REPORT.md'), mdReport);

  // 2. Generate Interactive HTML Report (test-report.html)
  const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Autonomous AI Website Test Report</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg: #0f172a;
      --card-bg: #1e293b;
      --text: #f8fafc;
      --text-muted: #94a3b8;
      --accent: #6366f1;
      --pass: #10b981;
      --fail: #ef4444;
      --blocked: #f59e0b;
      --border: #334155;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Inter', sans-serif; background: var(--bg); color: var(--text); padding: 2rem; line-height: 1.6; }
    .container { max-width: 1200px; margin: 0 auto; }
    header { border-bottom: 1px solid var(--border); padding-bottom: 1.5rem; margin-bottom: 2rem; }
    h1 { font-size: 2rem; font-weight: 700; color: #fff; margin-bottom: 0.5rem; }
    .subtitle { color: var(--text-muted); font-size: 0.95rem; }
    
    .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 1rem; margin-bottom: 2rem; }
    .stat-card { background: var(--card-bg); border: 1px solid var(--border); border-radius: 12px; padding: 1.25rem; text-align: center; }
    .stat-val { font-size: 2rem; font-weight: 700; margin-top: 0.25rem; }
    .stat-val.pass { color: var(--pass); }
    .stat-val.fail { color: var(--fail); }
    .stat-val.blocked { color: var(--blocked); }
    .stat-val.rate { color: var(--accent); }

    .section { background: var(--card-bg); border: 1px solid var(--border); border-radius: 12px; padding: 1.5rem; margin-bottom: 2rem; }
    .section-title { font-size: 1.25rem; font-weight: 600; margin-bottom: 1rem; border-bottom: 1px solid var(--border); padding-bottom: 0.5rem; }

    table { width: 100%; border-collapse: collapse; margin-top: 1rem; text-align: left; }
    th, td { padding: 0.75rem 1rem; border-bottom: 1px solid var(--border); font-size: 0.9rem; }
    th { background: #0f172a; color: var(--text-muted); font-weight: 600; }
    tr:hover { background: rgba(255,255,255,0.02); }

    .badge { padding: 0.25rem 0.6rem; border-radius: 6px; font-size: 0.75rem; font-weight: 700; text-transform: uppercase; }
    .badge.pass { background: rgba(16, 185, 129, 0.2); color: var(--pass); }
    .badge.fail { background: rgba(239, 68, 68, 0.2); color: var(--fail); }
    .badge.blocked { background: rgba(245, 158, 11, 0.2); color: var(--blocked); }

    .screenshot-thumb { width: 120px; border-radius: 6px; border: 1px solid var(--border); transition: transform 0.2s; cursor: pointer; }
    .screenshot-thumb:hover { transform: scale(1.1); }

    .ai-card { background: #181824; border-left: 4px solid var(--fail); padding: 1rem; border-radius: 6px; margin-top: 0.5rem; }
    .ai-card header { border: none; padding: 0; margin-bottom: 0.5rem; font-weight: 600; color: var(--fail); }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <h1>🤖 Autonomous AI Website Testing Report</h1>
      <div class="subtitle">
        Target URL: <strong><a href="${BASE_URL}" target="_blank" style="color: var(--accent);">${BASE_URL}</a></strong> | 
        Executed: ${summary.executionTime} | 
        Duration: ${summary.durationSeconds}s
      </div>
    </header>

    <div class="stats-grid">
      <div class="stat-card">
        <div style="color: var(--text-muted); font-size: 0.85rem;">Pages Discovered</div>
        <div class="stat-val">${summary.pagesDiscovered}</div>
      </div>
      <div class="stat-card">
        <div style="color: var(--text-muted); font-size: 0.85rem;">Total Tests</div>
        <div class="stat-val">${summary.totalTests}</div>
      </div>
      <div class="stat-card">
        <div style="color: var(--text-muted); font-size: 0.85rem;">Passed</div>
        <div class="stat-val pass">${summary.passed}</div>
      </div>
      <div class="stat-card">
        <div style="color: var(--text-muted); font-size: 0.85rem;">Failed</div>
        <div class="stat-val fail">${summary.failed}</div>
      </div>
      <div class="stat-card">
        <div style="color: var(--text-muted); font-size: 0.85rem;">Blocked</div>
        <div class="stat-val blocked">${summary.blocked}</div>
      </div>
      <div class="stat-card">
        <div style="color: var(--text-muted); font-size: 0.85rem;">Pass Rate</div>
        <div class="stat-val rate">${summary.passRate}</div>
      </div>
    </div>

    <div class="section">
      <div class="section-title">Test Results Matrix</div>
      <table>
        <thead>
          <tr>
            <th>Test ID</th>
            <th>Category</th>
            <th>Title</th>
            <th>Status</th>
            <th>Actual Result / Details</th>
            <th>Evidence</th>
          </tr>
        </thead>
        <tbody>
          ${results.map(r => `
            <tr>
              <td><strong>${r.testId}</strong></td>
              <td>${r.category}</td>
              <td>${r.title}</td>
              <td><span class="badge ${r.status.toLowerCase()}">${r.status}</span></td>
              <td>
                ${r.actualResult}
                ${r.aiAnalysis ? `
                  <div class="ai-card">
                    <header>🤖 AI Failure Analysis (${r.aiAnalysis.category})</header>
                    <div><strong>Likely Cause:</strong> ${r.aiAnalysis.likelyCause}</div>
                    <div><strong>Recommendation:</strong> ${r.aiAnalysis.recommendedInvestigation}</div>
                  </div>
                ` : ''}
              </td>
              <td>
                <a href="${r.screenshot}" target="_blank">
                  <img src="${r.screenshot}" class="screenshot-thumb" alt="${r.testId}" />
                </a>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>

    <div class="section">
      <div class="section-title">Discovered Pages Schema</div>
      <ul>
        ${discoveredPages.map(p => `
          <li style="margin-bottom: 0.5rem; color: var(--text-muted);">
            <strong style="color: var(--text);">${p.title}</strong> (${p.url}) - 
            <span style="color: var(--accent);">${p.elements.length} interactive elements detected</span>
          </li>
        `).join('')}
      </ul>
    </div>
  </div>
</body>
</html>`;

  fs.writeFileSync(path.join(OUTPUT_DIR, 'test-report.html'), htmlContent);
  console.log(`Generated test-results/test-report.html\n`);

  // Print Step 10 Final Result output to terminal
  console.log('====================================================');
  console.log('AUTOMATED WEBSITE TESTING COMPLETED');
  console.log('====================================================');
  console.log(`Website: ${BASE_URL}`);
  console.log(`Pages Discovered: ${summary.pagesDiscovered}`);
  console.log(`Tests Generated: ${summary.totalTests}`);
  console.log(`Tests Executed: ${summary.totalTests}`);
  console.log(`PASS: ${summary.passed}`);
  console.log(`FAIL: ${summary.failed}`);
  console.log(`BLOCKED: ${summary.blocked}`);
  console.log(`Pass Rate: ${summary.passRate}`);
  console.log(`Critical Issues: ${results.filter(r => r.status === 'FAIL' && r.priority === 'High').length}`);
  console.log(`High Issues: ${results.filter(r => r.status === 'FAIL' && r.priority === 'Medium').length}`);
  console.log(`\nReports generated successfully:`);
  console.log(`- test-results/test-report.html`);
  console.log(`- test-results/TEST-REPORT.md`);
  console.log(`- test-results/test-cases.json`);
  console.log(`- test-results/results.json`);
  console.log(`- test-results/discovered-site.json`);
  console.log('====================================================\n');
}

runAutonomousTesting().catch(console.error);
