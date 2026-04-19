import { Page } from '@playwright/test';
import selectors from '@utils/../helpers/checkoutSelectors.json' with { type: 'json' };

export class CheckoutPage {
  constructor(private page: Page) {}

  async fillCheckoutForm(firstName: string, lastName: string, zip: string) {
    await this.page.fill(selectors.firstNameInput, firstName);
    await this.page.fill(selectors.lastNameInput, lastName);
    await this.page.fill(selectors.postalCodeInput, zip);
  }

  async clickContinue() {
    await this.page.click(selectors.continueButton);
  }

  async clickFinish() {
    await this.page.click(selectors.finishButton);
  }

  async checkout(firstName: string, lastName: string, zip: string) {
    // Fill checkout form (step 1)
    await this.fillCheckoutForm(firstName, lastName, zip);
    
    // Continue to review (step 2)
    await this.clickContinue();
    
    // Finish checkout
    await this.clickFinish();
  }
}