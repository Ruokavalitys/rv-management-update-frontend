import { expect, test } from "@playwright/test";
import { login } from "./fixtures/login";

const NEW_PASSWORD = "1234";
const BASE_URL = "http://127.0.0.1:4000";

async function resetPassword(page, newPassword) {
	await page.getByRole("button", { name: "Change password" }).click();
	await expect(page.locator(".bg-gray-500.bg-opacity-50")).toBeVisible();
	await page.getByLabel("New password*").fill(newPassword);
	await page.getByLabel("Confirm password*").fill(newPassword);
	await page.getByRole("button", { name: "Update" }).click();
	await expect(page.locator(".bg-gray-500.bg-opacity-50")).toBeHidden();
}

test("Admin user should be able to change password and log in with new password", async ({
	page,
}) => {
	await login(page);

	await page.locator('a[href="/admin/users/2"] span.font-bold').click();
	await expect(page).toHaveURL(`${BASE_URL}/admin/users/2`);

	await page.getByRole("button", { name: "Change password" }).click();
	await expect(page.locator(".bg-gray-500.bg-opacity-50")).toBeVisible();

	await page.getByLabel("New password*").fill(NEW_PASSWORD);
	await page.getByLabel("Confirm password*").fill(NEW_PASSWORD);

	await page.getByRole("button", { name: "Update" }).click();
	await expect(page.locator(".bg-gray-500.bg-opacity-50")).toBeHidden();

	await page.getByRole("button", { name: "Log out" }).click();
	await expect(page).toHaveURL(`${BASE_URL}/`);
	await expect(page.getByLabel("Username")).toBeVisible({ timeout: 10000 });

	await login(page, "admin_user", NEW_PASSWORD);
	await expect(page).toHaveURL(`${BASE_URL}/admin`);
	await page.getByRole("button", { name: "Log out" }).click();
	await expect(page).toHaveURL(`${BASE_URL}/`);
	await expect(page.getByLabel("Username")).toBeVisible({ timeout: 10000 });
});

test.afterEach(async ({ page }) => {
	await login(page, "admin_user", NEW_PASSWORD);
	await page.locator('a[href="/admin/users/2"] span.font-bold').click();
	await expect(page).toHaveURL(`${BASE_URL}/admin/users/2`);
	await resetPassword(page, "admin123");

	await page.getByRole("button", { name: "Log out" }).click();
	await expect(page).toHaveURL(`${BASE_URL}/`);
	await expect(page.getByLabel("Username")).toBeVisible({ timeout: 10000 });
});
