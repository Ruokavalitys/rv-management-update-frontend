import { expect, test } from "@playwright/test";
import { login } from "./fixtures/login";

const BASE_URL = "http://127.0.0.1:4000";
const USERNAME = "normal_user";
const OLD_PASSWORD = "hunter2";
const NEW_PASSWORD = "1234";

async function logout(page) {
	await page.getByRole("button", { name: "Log out" }).click();
	await expect(page).toHaveURL(`${BASE_URL}/`);
}

async function getUserRole(page) {
	await page.goto(`${BASE_URL}/admin/users/1`);
	return await page.locator("#role").innerText();
}

async function setUserRole(page, role) {
	await page.goto(`${BASE_URL}/admin/users/1`);
	await page.getByText("Change role").click();
	await page.locator("select#role").selectOption(role);
	await page.getByRole("button", { name: "Update" }).click();
	await expect(
	page.locator(
	'span[role="status"][aria-live="assertive"]:has-text("User role updated successfully")',
	),
	).toBeVisible();
}

async function changePassword(page, newPassword) {
await page.getByRole("button", { name: "Change password" }).click();
await expect(page.locator(".bg-gray-500.bg-opacity-50")).toBeVisible();
await page.getByLabel("New password*").fill(newPassword);
await page.getByLabel("Confirm password*").fill(newPassword);
await page.getByRole("button", { name: "Update" }).click();
await expect(page.locator(".bg-gray-500.bg-opacity-50")).toBeHidden();
}

let previousRole = "USER";

test.beforeAll(async ({ browser }) => {
	const context = await browser.newContext();
	const page = await context.newPage();

	await login(page, "admin_user", "admin123");
	previousRole = await getUserRole(page);

	if (previousRole !== "ADMIN") {
	await setUserRole(page, "ADMIN");
	}

	await logout(page);
	await context.close();
});

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

test.afterAll(async ({ browser }) => {
	const context = await browser.newContext();
	const page = await context.newPage();

	await login(page, "admin_user", "admin123");

	if (previousRole !== "ADMIN") {
	await setUserRole(page, previousRole);
	}

	await logout(page);
	await context.close();
});