import { expect, test } from "@playwright/test";

const BASE_URL = "http://127.0.0.1:4000";
const USERNAME = "normal_user";
const OLD_PASSWORD = "hunter2";
const NEW_PASSWORD = "1234";

async function login(page, username, password) {
	await page.goto(BASE_URL);
	await page.reload();
	await page.getByLabel("Username").fill(username);
	await page.getByLabel("Password").fill(password);
	await page.getByRole("button", { name: "Log in" }).click();
	await expect(page).toHaveURL(`${BASE_URL}/admin`);
}

async function logout(page) {
	await page.getByRole("button", { name: "Log out" }).click();
	await expect(page).toHaveURL(`${BASE_URL}/`);
}

async function changePassword(page, newPassword) {
	await page.getByRole("button", { name: "Change password" }).click();
	await expect(page.locator(".bg-gray-500.bg-opacity-50")).toBeVisible();
	await page.getByLabel("New password*").fill(newPassword);
	await page.getByLabel("Confirm password*").fill(newPassword);
	await page.getByRole("button", { name: "Update" }).click();
	await expect(page.locator(".bg-gray-500.bg-opacity-50")).toBeHidden();
}

test.describe("Password Change", () => {
	test.beforeEach(async ({ page }) => {
		await login(page, USERNAME, OLD_PASSWORD);
		await page.goto(`${BASE_URL}/admin/users/1`);
		await expect(page).toHaveURL(`${BASE_URL}/admin/users/1`);
	});

	test("Should be able to login after password change with new password", async ({
		page,
	}) => {
		await changePassword(page, NEW_PASSWORD);
		await logout(page);

		await login(page, USERNAME, NEW_PASSWORD);
		await logout(page);
	});

	test.afterEach(async ({ page }) => {
		await login(page, USERNAME, NEW_PASSWORD);
		await page.goto(`${BASE_URL}/admin/users/1`);
		await changePassword(page, OLD_PASSWORD);
		await logout(page);
	});
});
