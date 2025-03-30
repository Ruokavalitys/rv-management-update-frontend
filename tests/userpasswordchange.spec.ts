import { expect, test } from "@playwright/test";
import { login } from "./fixtures/userlogin";

const USERNAME = "normal_user";
const OLD_PASSWORD = "hunter2";
const NEW_PASSWORD = "1234";

async function resetPassword(page, oldPassword) {
	await page.getByRole("button", { name: "Change password" }).click();
	await expect(page.locator(".bg-gray-500.bg-opacity-50")).toBeVisible();
	await page.getByLabel("New password*").fill(oldPassword);
	await page.getByLabel("Confirm password*").fill(oldPassword);
	await page.getByRole("button", { name: "Update" }).click();
	await expect(
		page.getByText("User's password changed successfully", { exact: true }),
	).toBeVisible({ timeout: 10000 });
	await expect(page.locator(".bg-gray-500.bg-opacity-50")).toBeHidden();
}

test("Normal user should be able to change password and log in with new password", async ({
	page,
}) => {
	await login(page, USERNAME, OLD_PASSWORD);
	await page.getByText("My account").click();
	await page.getByRole("button", { name: "Change password" }).click();
	await expect(page.locator(".bg-gray-500.bg-opacity-50")).toBeVisible();
	await page.getByLabel("New password*").fill(NEW_PASSWORD);
	await page.getByLabel("Confirm password*").fill(NEW_PASSWORD);
	await page.getByRole("button", { name: "Update" }).click();
	await expect(
		page.getByText("User's password changed successfully", { exact: true }),
	).toBeVisible({ timeout: 5000 });
	await expect(page.locator(".bg-gray-500.bg-opacity-50")).toBeHidden();
	await page.getByRole("button", { name: "Log out" }).click();
	await expect(page).toHaveURL("/");
	await expect(page.getByLabel("Username")).toBeVisible({ timeout: 10000 });
	await login(page, USERNAME, NEW_PASSWORD);
	await page.getByRole("button", { name: "Log out" }).click();
	await expect(page).toHaveURL("/");
	await expect(page.getByLabel("Username")).toBeVisible({ timeout: 10000 });
});

test.afterEach(async ({ page }) => {
	await login(page, USERNAME, NEW_PASSWORD);
	await page.getByText("My account").click();
	await resetPassword(page, OLD_PASSWORD);
	await page.getByRole("button", { name: "Log out" }).click();
	await expect(page).toHaveURL("/");
	await expect(page.getByLabel("Username")).toBeVisible({ timeout: 10000 });
});
