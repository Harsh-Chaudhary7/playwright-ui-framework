import { Page } from '@playwright/test';
import selectors from '@utils/../helpers/inventorySelectos.json' with { type: 'json' };

export class InventoryPage {
  constructor(private page: Page) {}

  async addFirstItemToCart() {
    await this.page.click(selectors.firstItemButton);
  }

  async goToCart() {
    await this.page.click(selectors.cartLink);
  }
}