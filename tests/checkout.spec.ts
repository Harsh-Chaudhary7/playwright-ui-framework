import { test, expect } from '@utils/fixtures.js';
import { LoginPage } from '@pages/login.page.js';
import { InventoryPage } from '@pages/inventory.page.js';
import { CheckoutPage } from '@pages/checkout.page.js';
import user from '@test-data/user.json' with { type: 'json' };

test.describe('Checkout Page Tests', () => {
  // Setup: Login and add items before each test
  test.beforeEach(async ({ page }) => {
    const login = new LoginPage(page);
    const inventory = new InventoryPage(page);

    await login.navigate();
    await login.login(user.username, user.password);
    
    // Wait for inventory page to load
    await page.waitForLoadState('networkidle');
    await page.waitForSelector('[data-test="inventory-container"]', { timeout: 10000 }).catch(() => null);
    
    await inventory.addFirstItemToCart();
    await inventory.goToCart();
    
    // Wait for cart page to fully load
    await page.waitForLoadState('networkidle');
    await page.waitForSelector('[data-test="cart-contents"]', { timeout: 10000 }).catch(() => null);

    // Proceed to checkout
    const checkoutBtn = page.locator('[data-test="checkout"]');
    await checkoutBtn.waitFor({ state: 'visible', timeout: 10000 }).catch(() => null);
    await checkoutBtn.click().catch(async () => {
      // If data-test doesn't work, try button with text
      await page.click('text=Checkout');
    });
    
    await page.waitForURL(/checkout-step-one/, { timeout: 10000 });
  });

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
    'Complete checkout with valid data',
    {
      tag: ['@checkout', '@smoke', '@positive'],
      annotation: [
        { type: 'testID', description: 'CHECKOUT_001' },
        { type: 'severity', description: 'critical' },
        { type: 'author', description: 'QA Team' }
      ]
    },
    async ({ page }) => {
      const checkout = new CheckoutPage(page);

      await checkout.checkout('John', 'Doe', '12345');

      await expect(page).toHaveURL(/checkout-complete/);
      await expect(page.locator('[data-test="complete-header"]')).toContainText('Thank you for your order!');
    }
  );

  test(
    'Verify order summary displayed',
    {
      tag: ['@checkout', '@positive'],
      annotation: [
        { type: 'testID', description: 'CHECKOUT_002' },
        { type: 'severity', description: 'high' },
        { type: 'author', description: 'QA Team' }
      ]
    },
    async ({ page }) => {
      // Verify item is in cart summary
      await expect(page.locator('[data-test="inventory-item"]')).toBeVisible();

      // Verify subtotal is displayed
      await expect(page.locator('[data-test="subtotal-label"]')).toBeVisible();

      // Verify tax is calculated
      await expect(page.locator('[data-test="tax-label"]')).toBeVisible();

      // Verify total is displayed
      await expect(page.locator('[data-test="total-label"]')).toBeVisible();
    }
  );

  test(
    'Cancel checkout and return to cart',
    {
      tag: ['@checkout', '@positive'],
      annotation: [
        { type: 'testID', description: 'CHECKOUT_003' },
        { type: 'severity', description: 'high' },
        { type: 'author', description: 'QA Team' }
      ]
    },
    async ({ page }) => {
      // Click cancel/back button
      await page.click('[data-test="cancel"]');

      // Should return to cart
      await expect(page).toHaveURL(/cart/);
    }
  );

  test(
    'Checkout with numbers and special characters in name',
    {
      tag: ['@checkout', '@positive'],
      annotation: [
        { type: 'testID', description: 'CHECKOUT_004' },
        { type: 'severity', description: 'medium' },
        { type: 'author', description: 'QA Team' }
      ]
    },
    async ({ page }) => {
      const checkout = new CheckoutPage(page);

      await checkout.checkout('John-123', "O'Brien", '12345');

      await expect(page).toHaveURL(/checkout-complete/);
    }
  );

  // ============ NEGATIVE SCENARIOS ============

  test(
    'Checkout without first name',
    {
      tag: ['@checkout', '@negative', '@validation'],
      annotation: [
        { type: 'testID', description: 'CHECKOUT_005' },
        { type: 'severity', description: 'high' },
        { type: 'author', description: 'QA Team' }
      ]
    },
    async ({ page }) => {
      const checkout = new CheckoutPage(page);

      // Fill last name and zip, skip first name
      await page.fill('[data-test="firstName"]', '');
      await page.fill('[data-test="lastName"]', 'Doe');
      await page.fill('[data-test="postalCode"]', '12345');
      await page.click('[data-test="continue"]');

      // Should show error
      await expect(page.locator('[data-test="error"]')).toContainText(
        'First Name is required'
      );
      await expect(page).toHaveURL(/checkout-step-one/);
    }
  );

  test(
    'Checkout without last name',
    {
      tag: ['@checkout', '@negative', '@validation'],
      annotation: [
        { type: 'testID', description: 'CHECKOUT_006' },
        { type: 'severity', description: 'high' },
        { type: 'author', description: 'QA Team' }
      ]
    },
    async ({ page }) => {
      // Fill first name and zip, skip last name
      await page.fill('[data-test="firstName"]', 'John');
      await page.fill('[data-test="lastName"]', '');
      await page.fill('[data-test="postalCode"]', '12345');
      await page.click('[data-test="continue"]');

      // Should show error
      await expect(page.locator('[data-test="error"]')).toContainText(
        'Last Name is required'
      );
      await expect(page).toHaveURL(/checkout-step-one/);
    }
  );

  test(
    'Checkout without postal code',
    {
      tag: ['@checkout', '@negative', '@validation'],
      annotation: [
        { type: 'testID', description: 'CHECKOUT_007' },
        { type: 'severity', description: 'high' },
        { type: 'author', description: 'QA Team' }
      ]
    },
    async ({ page }) => {
      // Fill name fields, skip postal code
      await page.fill('[data-test="firstName"]', 'John');
      await page.fill('[data-test="lastName"]', 'Doe');
      await page.fill('[data-test="postalCode"]', '');
      await page.click('[data-test="continue"]');

      // Should show error
      await expect(page.locator('[data-test="error"]')).toContainText(
        'Postal Code is required'
      );
      await expect(page).toHaveURL(/checkout-step-one/);
    }
  );

  test(
    'Checkout with all fields empty',
    {
      tag: ['@checkout', '@negative', '@validation'],
      annotation: [
        { type: 'testID', description: 'CHECKOUT_008' },
        { type: 'severity', description: 'high' },
        { type: 'author', description: 'QA Team' }
      ]
    },
    async ({ page }) => {
      // Clear all fields
      await page.fill('[data-test="firstName"]', '');
      await page.fill('[data-test="lastName"]', '');
      await page.fill('[data-test="postalCode"]', '');
      await page.click('[data-test="continue"]');

      // Should show error for first required field
      await expect(page.locator('[data-test="error"]')).toBeVisible();
      await expect(page).toHaveURL(/checkout-step-one/);
    }
  );

  test(
    'Checkout with invalid postal code (letters)',
    {
      tag: ['@checkout', '@negative', '@validation'],
      annotation: [
        { type: 'testID', description: 'CHECKOUT_009' },
        { type: 'severity', description: 'medium' },
        { type: 'author', description: 'QA Team' }
      ]
    },
    async ({ page }) => {
      const checkout = new CheckoutPage(page);

      await checkout.checkout('John', 'Doe', 'ABCDE');

      // Depending on validation, either error or completion
      const isError = await page.locator('[data-test="error"]').isVisible();
      if (isError) {
        await expect(page.locator('[data-test="error"]')).toBeVisible();
      } else {
        await expect(page).toHaveURL(/checkout-complete/);
      }
    }
  );

  test(
    'Checkout with very long first name',
    {
      tag: ['@checkout', '@negative', '@boundary'],
      annotation: [
        { type: 'testID', description: 'CHECKOUT_010' },
        { type: 'severity', description: 'low' },
        { type: 'author', description: 'QA Team' }
      ]
    },
    async ({ page }) => {
      const checkout = new CheckoutPage(page);
      const longName = 'A'.repeat(500);

      await checkout.checkout(longName, 'Doe', '12345');

      // Should either accept or show error
      const isCompleted = await page.url().includes('checkout-complete');
      expect(isCompleted || await page.locator('[data-test="error"]').isVisible()).toBeTruthy();
    }
  );

  test(
    'Checkout with whitespace-only first name',
    {
      tag: ['@checkout', '@negative', '@validation'],
      annotation: [
        { type: 'testID', description: 'CHECKOUT_011' },
        { type: 'severity', description: 'medium' },
        { type: 'author', description: 'QA Team' }
      ]
    },
    async ({ page }) => {
      await page.fill('[data-test="firstName"]', '   ');
      await page.fill('[data-test="lastName"]', 'Doe');
      await page.fill('[data-test="postalCode"]', '12345');
      await page.click('[data-test="continue"]');

      // Should show error
      await expect(page.locator('[data-test="error"]')).toBeVisible();
    }
  );

  test(
    'Checkout with special characters in first name',
    {
      tag: ['@checkout', '@negative'],
      annotation: [
        { type: 'testID', description: 'CHECKOUT_012' },
        { type: 'severity', description: 'low' },
        { type: 'author', description: 'QA Team' }
      ]
    },
    async ({ page }) => {
      const checkout = new CheckoutPage(page);

      await checkout.checkout('John@#$%', 'Doe', '12345');

      // Should either accept or show error
      const isCompleted = await page.url().includes('checkout-complete');
      expect(isCompleted || await page.locator('[data-test="error"]').isVisible()).toBeTruthy();
    }
  );

  test(
    'Step back from checkout step one to cart',
    {
      tag: ['@checkout', '@positive'],
      annotation: [
        { type: 'testID', description: 'CHECKOUT_013' },
        { type: 'severity', description: 'medium' },
        { type: 'author', description: 'QA Team' }
      ]
    },
    async ({ page }) => {
      // Click cancel button
      await page.click('[data-test="cancel"]');

      await expect(page).toHaveURL(/cart/);
      await expect(page.locator('[data-test="title"]')).toContainText('Your Cart');
    }
  );

  test(
    'Verify checkout form displays correctly',
    {
      tag: ['@checkout', '@positive'],
      annotation: [
        { type: 'testID', description: 'CHECKOUT_014' },
        { type: 'severity', description: 'medium' },
        { type: 'author', description: 'QA Team' }
      ]
    },
    async ({ page }) => {
      // Verify all form fields are visible
      await expect(page.locator('[data-test="firstName"]')).toBeVisible();
      await expect(page.locator('[data-test="lastName"]')).toBeVisible();
      await expect(page.locator('[data-test="postalCode"]')).toBeVisible();
      
      // Verify buttons are visible
      await expect(page.locator('[data-test="continue"]')).toBeVisible();
      await expect(page.locator('[data-test="cancel"]')).toBeVisible();
    }
  );

  test(
    'Continue to checkout step two',
    {
      tag: ['@checkout', '@positive'],
      annotation: [
        { type: 'testID', description: 'CHECKOUT_015' },
        { type: 'severity', description: 'high' },
        { type: 'author', description: 'QA Team' }
      ]
    },
    async ({ page }) => {
      // Fill form
      await page.fill('[data-test="firstName"]', 'John');
      await page.fill('[data-test="lastName"]', 'Doe');
      await page.fill('[data-test="postalCode"]', '12345');
      
      // Click continue
      await page.click('[data-test="continue"]');

      // Should move to step two
      await expect(page).toHaveURL(/checkout-step-two/);
    }
  );
});
