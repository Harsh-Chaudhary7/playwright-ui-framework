import { test, expect } from '@utils/fixtures.js';
import { LoginPage } from '@pages/login.page.js';
import user from '@test-data/user.json' with { type: 'json' };

test.describe('Login Page Tests', () => {
  // Cleanup after each test
  test.afterEach(async ({ page, context }) => {
    try {
      await context.clearCookies();
      await page.evaluate(() => localStorage.clear()).catch(() => {});
      await page.evaluate(() => sessionStorage.clear()).catch(() => {});
    } catch (e) {
      // Silently ignore cleanup errors
    }
  });

  // ============ POSITIVE SCENARIOS ============

  test(
    'Login with valid credentials',
    {
      tag: ['@login', '@smoke', '@positive'],
      annotation: [
        { type: 'testID', description: 'LOGIN_001' },
        { type: 'severity', description: 'critical' },
        { type: 'author', description: 'QA Team' }
      ]
    },
    async ({ page }) => {
      const login = new LoginPage(page);

      await login.navigate();
      await login.login(user.username, user.password);

      await expect(page).toHaveURL(/inventory/);
      await expect(page.locator('[data-test="title"]')).toBeVisible();
    }
  );

  // ============ NEGATIVE SCENARIOS ============

  test(
    'Login with invalid username',
    {
      tag: ['@login', '@negative'],
      annotation: [
        { type: 'testID', description: 'LOGIN_002' },
        { type: 'severity', description: 'high' },
        { type: 'author', description: 'QA Team' }
      ]
    },
    async ({ page }) => {
      const login = new LoginPage(page);

      await login.navigate();
      await login.login('invalid_user', user.password);

      await expect(page.locator('[data-test="error"]')).toContainText(
        'Username and password do not match any user in this service'
      );
      await expect(page).toHaveURL(/\/$/);
    }
  );

  test(
    'Login with invalid password',
    {
      tag: ['@login', '@negative'],
      annotation: [
        { type: 'testID', description: 'LOGIN_003' },
        { type: 'severity', description: 'high' },
        { type: 'author', description: 'QA Team' }
      ]
    },
    async ({ page }) => {
      const login = new LoginPage(page);

      await login.navigate();
      await login.login(user.username, 'wrong_password');

      await expect(page.locator('[data-test="error"]')).toContainText(
        'Username and password do not match any user in this service'
      );
      await expect(page).toHaveURL(/\/$/);
    }
  );

  test(
    'Login with empty username',
    {
      tag: ['@login', '@negative', '@validation'],
      annotation: [
        { type: 'testID', description: 'LOGIN_004' },
        { type: 'severity', description: 'medium' },
        { type: 'author', description: 'QA Team' }
      ]
    },
    async ({ page }) => {
      const login = new LoginPage(page);

      await login.navigate();
      await login.login('', user.password);
      await page.click('[data-test="login-button"]');

      await expect(page.locator('[data-test="error"]')).toContainText(
        'Username is required'
      );
      await expect(page).toHaveURL(/\/$/);
    }
  );

  test(
    'Login with empty password',
    {
      tag: ['@login', '@negative', '@validation'],
      annotation: [
        { type: 'testID', description: 'LOGIN_005' },
        { type: 'severity', description: 'medium' },
        { type: 'author', description: 'QA Team' }
      ]
    },
    async ({ page }) => {
      const login = new LoginPage(page);

      await login.navigate();
      await login.login(user.username, '');
      await page.click('[data-test="login-button"]');

      await expect(page.locator('[data-test="error"]')).toContainText(
        'Password is required'
      );
      await expect(page).toHaveURL(/\/$/);
    }
  );

  test(
    'Login with empty username and password',
    {
      tag: ['@login', '@negative', '@validation'],
      annotation: [
        { type: 'testID', description: 'LOGIN_006' },
        { type: 'severity', description: 'medium' },
        { type: 'author', description: 'QA Team' }
      ]
    },
    async ({ page }) => {
      const login = new LoginPage(page);

      await login.navigate();
      await page.click('[data-test="login-button"]');

      await expect(page.locator('[data-test="error"]')).toContainText(
        'Username is required'
      );
      await expect(page).toHaveURL(/\/$/);
    }
  );

  test(
    'Login with username containing special characters',
    {
      tag: ['@login', '@negative', '@validation'],
      annotation: [
        { type: 'testID', description: 'LOGIN_007' },
        { type: 'severity', description: 'medium' },
        { type: 'author', description: 'QA Team' }
      ]
    },
    async ({ page }) => {
      const login = new LoginPage(page);

      await login.navigate();
      await login.login('user@#$%', user.password);

      await expect(page.locator('[data-test="error"]')).toContainText(
        'Username and password do not match any user in this service'
      );
    }
  );

  test(
    'Login with SQL injection attempt in username',
    {
      tag: ['@login', '@negative', '@security'],
      annotation: [
        { type: 'testID', description: 'LOGIN_008' },
        { type: 'severity', description: 'critical' },
        { type: 'author', description: 'QA Team' }
      ]
    },
    async ({ page }) => {
      const login = new LoginPage(page);

      await login.navigate();
      await login.login("' OR '1'='1", user.password);

      await expect(page.locator('[data-test="error"]')).toContainText(
        'Username and password do not match any user in this service'
      );
      await expect(page).toHaveURL(/\/$/);
    }
  );

  test(
    'Login with very long username',
    {
      tag: ['@login', '@negative', '@boundary'],
      annotation: [
        { type: 'testID', description: 'LOGIN_009' },
        { type: 'severity', description: 'low' },
        { type: 'author', description: 'QA Team' }
      ]
    },
    async ({ page }) => {
      const login = new LoginPage(page);
      const longUsername = 'a'.repeat(1000);

      await login.navigate();
      await login.login(longUsername, user.password);

      await expect(page.locator('[data-test="error"]')).toContainText(
        'Username and password do not match any user in this service'
      );
    }
  );

  test(
    'Login with whitespace-only username',
    {
      tag: ['@login', '@negative', '@validation'],
      annotation: [
        { type: 'testID', description: 'LOGIN_010' },
        { type: 'severity', description: 'medium' },
        { type: 'author', description: 'QA Team' }
      ]
    },
    async ({ page }) => {
      const login = new LoginPage(page);

      await login.navigate();
      await page.fill('[data-test="username"]', '   ');
      await page.fill('[data-test="password"]', user.password);
      await page.click('[data-test="login-button"]');

      await expect(page.locator('[data-test="error"]')).toBeVisible();
      await expect(page).toHaveURL(/\/$/);
    }
  );

  test(
    'Login then immediate logout',
    {
      tag: ['@login', '@logout', '@positive'],
      annotation: [
        { type: 'testID', description: 'LOGIN_011' },
        { type: 'severity', description: 'high' },
        { type: 'author', description: 'QA Team' }
      ]
    },
    async ({ page }) => {
      const login = new LoginPage(page);

      await login.navigate();
      await login.login(user.username, user.password);
      await expect(page).toHaveURL(/inventory/);

      // Logout
      await page.click('[data-test="logout-btn"]');

      await expect(page).toHaveURL(/\/$/);
      await expect(page.locator('[data-test="username"]')).toBeVisible();
    }
  );

  test(
    'Login with case-sensitive username',
    {
      tag: ['@login', '@negative', '@validation'],
      annotation: [
        { type: 'testID', description: 'LOGIN_012' },
        { type: 'severity', description: 'medium' },
        { type: 'author', description: 'QA Team' }
      ]
    },
    async ({ page }) => {
      const login = new LoginPage(page);

      await login.navigate();
      const uppercaseUsername = user.username.toUpperCase();
      await login.login(uppercaseUsername, user.password);

      await expect(page.locator('[data-test="error"]')).toContainText(
        'Username and password do not match any user in this service'
      );
    }
  );
});
