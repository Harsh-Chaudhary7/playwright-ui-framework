import { test, expect } from '@utils/fixtures.js';
import { LoginPage } from '@pages/login.page.js';
import { InventoryPage } from '@pages/inventory.page.js';
import { CheckoutPage } from '@pages/checkout.page.js';
import user from '@test-data/user.json' with { type: 'json' };

test.describe('E2E Tests - Complete User Flow', () => {
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
  
  test(
    'E2E: Login → Add to Cart → Checkout',
    {
      tag: ['@e2e', '@smoke', '@critical'],
      annotation: [
        { type: 'testID', description: 'E2E_001' },
        { type: 'severity', description: 'critical' },
        { type: 'author', description: 'QA Team' }
      ]
    },
    async ({ page }) => {
      const login = new LoginPage(page);
      const inventory = new InventoryPage(page);
      const checkout = new CheckoutPage(page);

      // Login
      await login.navigate();
      await login.login(user.username, user.password);
      await expect(page).toHaveURL(/inventory/);

      // Add to cart
      await inventory.addFirstItemToCart();
      await inventory.goToCart();

      // Go to checkout
      await page.waitForLoadState('networkidle');
      const checkoutBtn = page.locator('[data-test="checkout"]');
      await checkoutBtn.waitFor({ state: 'visible', timeout: 10000 });
      await checkoutBtn.click();
      await page.waitForURL(/checkout-step-one/, { timeout: 10000 });

      // Fill checkout form and complete
      await checkout.checkout("Harsh", "QA", "110001");
      await expect(page).toHaveURL(/checkout-complete/);
      await expect(page.locator('[data-test="complete-header"]')).toHaveText('Thank you for your order!');
    }
  );
});