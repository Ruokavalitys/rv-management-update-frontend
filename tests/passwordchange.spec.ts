import { expect, test, Page } from "@playwright/test";
import { login } from "./fixtures/login";

export const customLogin = async (
  page: Page,
  username: string = "admin_user",
  password: string = "1234",
) => {
  await page.goto("/");
  await page.getByLabel("Username").click();
  await page.getByLabel("Username").fill(username);
  await page.getByLabel("Username").press("Tab");
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Log in" }).click();
  await page.waitForURL("/admin");
};
 
test.describe('Password Change', () => {

  test.beforeEach( async ({ page }) => {
    await login(page);
    await page.goto('/admin/users/1');
  });

  test('Should be able to login after password change with new password', async ({ page }) => {
    await page.getByLabel("Change Password").click();

    await page.getByLabel("New Password").click();
    await page.getByLabel("New Password").fill("1234");

    await page.getByLabel("Confirm Password").click();
    await page.getByLabel("Confirm Password").fill("1234");

    await page.getByLabel("Update").click();

    await page.getByLabel("Log out").click();

    await customLogin(page);

    await expect(page).toHaveURL('/admin');

    await page.getByLabel("Log out").click();
  });

  test.afterEach(async ({ page }) => {
    await customLogin(page);
    await page.goto('/admin/users/1');

    await page.getByLabel("Change Password").click();

    await page.getByLabel("New Password").click();
    await page.getByLabel("New Password").fill("admin123");

    await page.getByLabel("Confirm Password").click();
    await page.getByLabel("Confirm Password").fill("admin123");

    await page.getByLabel("Update").click();
    await page.getByLabel("Log out").click();
  });
});