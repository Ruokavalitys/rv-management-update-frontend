import { expect, test } from "@playwright/test";
import { login } from "./fixtures/login";

test.describe('UserView Role Change', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await page.goto('/admin/users/2');
  });

  test('should change role to admin when "Make Admin" button is clicked', async ({ page }) => {
    await page.getByLabel("Make Admin").click();

    const roleText = await page.locator('#role');
    await expect(roleText).toHaveText('ADMIN');

    const makeUser1Button = await page.locator('button:has-text("Make User1")');
    await expect(makeUser1Button).toBeVisible();
  });

  test('display "Make Admin" button when user is not an admin', async ({ page }) => {
    const makeAdminButton = await page.locator('button:has-text("Make Admin")');
    await expect(makeAdminButton).toBeVisible();
  });


  test('display "Make User1" button when user is an admin', async ({ page }) => {
    const makeUser1Button = await page.locator('button:has-text("Make User1")');
    const makeBackupButton = await page.locator('button:has-text("Make Admin")');
    if (!makeUser1Button) {
      makeBackupButton.click()
    }
    await expect(makeUser1Button).toBeVisible();
  });

  test('should change role to user1 when "Make User1" button is clicked', async ({ page }) => {
    const makeUser1Button = await page.locator('button:has-text("Make User1")');
    await makeUser1Button.click();

    const roleText = await page.locator('#role');
    await expect(roleText).toHaveText('USER1');

    const makeAdminButton = await page.locator('button:has-text("Make Admin")');
    await expect(makeAdminButton).toBeVisible();
  });

});