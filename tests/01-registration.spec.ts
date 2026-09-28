import { test, expect } from '@playwright/test';
import { RegisterPage } from '../pages/RegisterPage';
import { LoginPage } from '../pages/LoginPage';
import { buildUser } from '../fixtures/user';

test.describe('Customer registration', () => {
  test('@smoke a new customer can register and is signed in straight away', async ({ page }) => {
    const user = buildUser();
    const register = new RegisterPage(page);
    await register.goto();
    await register.register(user);
    await register.expectRegistered(user.username);
  });

  test('a registered customer can sign out and sign back in', async ({ page }) => {
    const user = buildUser();
    const register = new RegisterPage(page);
    await register.goto();
    await register.register(user);
    const login = new LoginPage(page);
    await login.logout();
    await login.login(user.username, user.password);
    await login.expectSignedIn();
  });

  test('a wrong password is rejected with a message', async ({ page }) => {
    const login = new LoginPage(page);
    await login.goto();
    await login.login('no_such_user_qa', 'wrong-password');
    await expect(page.locator('#rightPanel')).toContainText(/error|could not be verified/i);
  });
});
