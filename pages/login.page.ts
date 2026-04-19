import { Page } from '@playwright/test';
import selectors from '@utils/../helpers/loginSelectors.json' with { type: 'json' };

export class LoginPage {
  constructor(private page: Page) {}

  async navigate() {
    await this.page.goto('/');
  }
  
  async login(username: string, password: string) {
    await this.page.fill(selectors.usernameInput, username);
    await this.page.fill(selectors.passwordInput, password);
    await this.page.click(selectors.loginButton);
  }
}