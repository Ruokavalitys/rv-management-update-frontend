import { expect, test } from "@playwright/test";
import { login } from "./fixtures/login";

const newPassword = "1234";
const baseUrl = "http://127.0.0.1:4000";

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
	await expect(page).toHaveURL(`${baseUrl}/admin/users/2`);
	await page.getByRole("button", { name: "Change password" }).click();
	await expect(page.locator(".bg-gray-500.bg-opacity-50")).toBeVisible();
	await page.getByLabel("New password*").fill(newPassword);
	await page.getByLabel("Confirm password*").fill(newPassword);
	await page.getByRole("button", { name: "Update" }).click();
	await expect(page.locator(".bg-gray-500.bg-opacity-50")).toBeHidden();
	await page.getByRole("button", { name: "Log out" }).click();
	await expect(page).toHaveURL(`${baseUrl}/`);
	await expect(page.getByLabel("Username")).toBeVisible({ timeout: 10000 });
	await login(page, "admin_user", newPassword);
	await expect(page).toHaveURL(`${baseUrl}/admin`);
	await page.getByRole("button", { name: "Log out" }).click();
	await expect(page).toHaveURL(`${baseUrl}/`);
	await expect(page.getByLabel("Username")).toBeVisible({ timeout: 10000 });
});

test.afterEach(async ({ page }) => {
	await login(page, "admin_user", newPassword);
	await page.locator('a[href="/admin/users/2"] span.font-bold').click();
	await expect(page).toHaveURL(`${baseUrl}/admin/users/2`);
	await resetPassword(page, "admin123");
	await page.getByRole("button", { name: "Log out" }).click();
	await expect(page).toHaveURL(`${baseUrl}/`);
	await expect(page.getByLabel("Username")).toBeVisible({ timeout: 10000 });
});
