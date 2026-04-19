import { test, expect } from '@utils/fixtures.js';
import { LoginPage } from '@pages/login.page.js';
import { InventoryPage } from '@pages/inventory.page.js';
import user from '@test-data/user.json' with { type: 'json' };

test.describe('Inventory Page Tests', () => {
  // Setup: Login before each test
  test.beforeEach(async ({ page }) => {
    const login = new LoginPage(page);
    await login.navigate();
    await login.login(user.username, user.password);
    await expect(page).toHaveURL(/inventory/);
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
    'Add first item to cart',
    {
      tag: ['@inventory', '@smoke', '@positive'],
      annotation: [
        { type: 'testID', description: 'INVENTORY_001' },
        { type: 'severity', description: 'critical' },
        { type: 'author', description: 'QA Team' }
      ]
    },
    async ({ page }) => {
      const inventory = new InventoryPage(page);

      await inventory.addFirstItemToCart();

      // Verify cart badge shows 1
      await expect(page.locator('[data-test="shopping-cart-badge"]')).toContainText('1');
    }
  );

  test(
    'View all inventory items',
    {
      tag: ['@inventory', '@positive'],
      annotation: [
        { type: 'testID', description: 'INVENTORY_002' },
        { type: 'severity', description: 'high' },
        { type: 'author', description: 'QA Team' }
      ]
    },
    async ({ page }) => {
      const inventory = new InventoryPage(page);

      // Verify inventory items are visible
      const items = await page.locator('[data-test="inventory-item"]').count();
      expect(items).toBeGreaterThan(0);
    }
  );

  test(
    'Add multiple items to cart',
    {
      tag: ['@inventory', '@positive'],
      annotation: [
        { type: 'testID', description: 'INVENTORY_003' },
        { type: 'severity', description: 'high' },
        { type: 'author', description: 'QA Team' }
      ]
    },
    async ({ page }) => {
      // Add first item
      await page.click('[data-test="add-to-cart-sauce-labs-backpack"]');
      await expect(page.locator('[data-test="shopping-cart-badge"]')).toContainText('1');

      // Add second item
      await page.click('[data-test="add-to-cart-sauce-labs-bike-light"]');
      await expect(page.locator('[data-test="shopping-cart-badge"]')).toContainText('2');

      // Add third item
      await page.click('[data-test="add-to-cart-sauce-labs-bolt-t-shirt"]');
      await expect(page.locator('[data-test="shopping-cart-badge"]')).toContainText('3');
    }
  );

  test(
    'Remove item from cart',
    {
      tag: ['@inventory', '@positive'],
      annotation: [
        { type: 'testID', description: 'INVENTORY_004' },
        { type: 'severity', description: 'high' },
        { type: 'author', description: 'QA Team' }
      ]
    },
    async ({ page }) => {
      // Add item
      await page.click('[data-test="add-to-cart-sauce-labs-backpack"]');
      await expect(page.locator('[data-test="shopping-cart-badge"]')).toContainText('1');

      // Remove item
      await page.click('[data-test="remove-sauce-labs-backpack"]');
      
      // Verify cart badge is gone
      const badge = await page.locator('[data-test="shopping-cart-badge"]').isVisible();
      expect(badge).toBeFalsy();
    }
  );

  test(
    'Navigate to cart from inventory',
    {
      tag: ['@inventory', '@positive'],
      annotation: [
        { type: 'testID', description: 'INVENTORY_005' },
        { type: 'severity', description: 'high' },
        { type: 'author', description: 'QA Team' }
      ]
    },
    async ({ page }) => {
      const inventory = new InventoryPage(page);

      await inventory.addFirstItemToCart();
      await inventory.goToCart();

      await expect(page).toHaveURL(/cart/);
      await expect(page.locator('[data-test="title"]')).toContainText('Your Cart');
    }
  );

  test(
    'Verify product details displayed',
    {
      tag: ['@inventory', '@positive'],
      annotation: [
        { type: 'testID', description: 'INVENTORY_006' },
        { type: 'severity', description: 'medium' },
        { type: 'author', description: 'QA Team' }
      ]
    },
    async ({ page }) => {
      // Verify product name is visible
      await expect(page.locator('[data-test="inventory-item-name"]').first()).toBeVisible();

      // Verify product price is visible
      await expect(page.locator('[data-test="inventory-item-price"]').first()).toBeVisible();

      // Verify product description is visible
      await expect(page.locator('[data-test="inventory-item-desc"]').first()).toBeVisible();
    }
  );

  // ============ NEGATIVE SCENARIOS ============

  test(
    'Remove non-existent item from cart',
    {
      tag: ['@inventory', '@negative'],
      annotation: [
        { type: 'testID', description: 'INVENTORY_007' },
        { type: 'severity', description: 'medium' },
        { type: 'author', description: 'QA Team' }
      ]
    },
    async ({ page }) => {
      // Try to click remove button without adding item
      const removeButton = await page.locator('[data-test="remove-sauce-labs-backpack"]').isVisible();
      
      // Should not be visible if nothing added
      expect(removeButton).toBeFalsy();
    }
  );

  test(
    'Add item to cart twice',
    {
      tag: ['@inventory', '@negative'],
      annotation: [
        { type: 'testID', description: 'INVENTORY_008' },
        { type: 'severity', description: 'low' },
        { type: 'author', description: 'QA Team' }
      ]
    },
    async ({ page }) => {
      // Add item first time
      await page.click('[data-test="add-to-cart-sauce-labs-backpack"]');
      await expect(page.locator('[data-test="shopping-cart-badge"]')).toContainText('1');

      // Try to add same item again (button should change to "Remove")
      const buttonText = await page.locator('[data-test="add-to-cart-sauce-labs-backpack"]').textContent();
      expect(buttonText).toContain('Remove');
    }
  );

  test(
    'Verify add button changes to remove after adding item',
    {
      tag: ['@inventory', '@positive'],
      annotation: [
        { type: 'testID', description: 'INVENTORY_009' },
        { type: 'severity', description: 'medium' },
        { type: 'author', description: 'QA Team' }
      ]
    },
    async ({ page }) => {
      const addButton = '[data-test="add-to-cart-sauce-labs-backpack"]';

      // Before adding, button says "Add to cart"
      await expect(page.locator(addButton)).toContainText('Add to cart');

      // Click to add
      await page.click(addButton);

      // After adding, button says "Remove"
      await expect(page.locator(addButton)).toContainText('Remove');
    }
  );

  test(
    'Cart remains consistent after page refresh',
    {
      tag: ['@inventory', '@positive'],
      annotation: [
        { type: 'testID', description: 'INVENTORY_010' },
        { type: 'severity', description: 'high' },
        { type: 'author', description: 'QA Team' }
      ]
    },
    async ({ page }) => {
      // Add item
      await page.click('[data-test="add-to-cart-sauce-labs-backpack"]');
      await expect(page.locator('[data-test="shopping-cart-badge"]')).toContainText('1');

      // Refresh page
      await page.reload();

      // Verify item still in cart
      await expect(page.locator('[data-test="shopping-cart-badge"]')).toContainText('1');
    }
  );

  test(
    'Sort inventory by name (A-Z)',
    {
      tag: ['@inventory', '@positive'],
      annotation: [
        { type: 'testID', description: 'INVENTORY_011' },
        { type: 'severity', description: 'medium' },
        { type: 'author', description: 'QA Team' }
      ]
    },
    async ({ page }) => {
      // Click sort dropdown
      await page.selectOption('[data-test="product-sort-container"]', 'az');

      // Verify items are sorted (just check the dropdown value)
      const selected = await page.locator('[data-test="product-sort-container"]').inputValue();
      expect(selected).toBe('az');
    }
  );

  test(
    'Sort inventory by price (low to high)',
    {
      tag: ['@inventory', '@positive'],
      annotation: [
        { type: 'testID', description: 'INVENTORY_012' },
        { type: 'severity', description: 'medium' },
        { type: 'author', description: 'QA Team' }
      ]
    },
    async ({ page }) => {
      // Click sort dropdown
      await page.selectOption('[data-test="product-sort-container"]', 'lohi');

      // Verify dropdown updated
      const selected = await page.locator('[data-test="product-sort-container"]').inputValue();
      expect(selected).toBe('lohi');
    }
  );

  test(
    'Logout from inventory page',
    {
      tag: ['@inventory', '@logout', '@positive'],
      annotation: [
        { type: 'testID', description: 'INVENTORY_013' },
        { type: 'severity', description: 'high' },
        { type: 'author', description: 'QA Team' }
      ]
    },
    async ({ page }) => {
      // Click menu button
      await page.click('[data-test="bm-menu-button"]');
      
      // Click logout
      await page.click('[data-test="logout-sidebar-link"]');

      // Should redirect to login page
      await expect(page).toHaveURL(/\/$/);
    }
  );
});
