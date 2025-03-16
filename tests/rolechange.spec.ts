import { expect, test } from "@playwright/test";
import { login } from "./fixtures/login";

test.describe("UserView Role Change", () => {
	test.beforeEach(async ({ page }) => {
		await login(page);
		await page.goto("/admin/users/1");
	});

	test("should change role to USER1 when selected from dropdown", async ({
		page,
	}) => {
		await page.getByText("Change role").click();
		await page.locator("select#role").selectOption("USER1");
		await page.getByRole("button", { name: "Update" }).click();
		await expect(
			page.locator(
				'span[role="status"][aria-live="assertive"]:has-text("User role updated successfully")',
			),
		).toBeVisible();
		await expect(page.locator("p#role")).toHaveText("USER1");
		await page.getByText("Change role").click();
		const option = page.locator('select#role option[value="USER1"]');
		expect(await option.isVisible()).toBe(false);
		await page.locator("select#role").selectOption("ADMIN");
		await page.getByRole("button", { name: "Update" }).click();
		await expect(
			page.locator(
				'span[role="status"][aria-live="assertive"]:has-text("User role updated successfully")',
			),
		).toBeVisible();
		await expect(page.locator("p#role")).toHaveText("ADMIN");
	});

	test("should display all role options except current role in dropdown", async ({
		page,
	}) => {
		await expect(page.locator("#role")).toHaveText("ADMIN");
		await page.getByText("Change role").click();
		const roleOptions = await page
			.locator("select#role")
			.evaluate((select) =>
				Array.from(select.options).map((option) => option.value),
			);
		expect(roleOptions).toContain("USER1");
		expect(roleOptions).toContain("USER2");
		expect(roleOptions).toContain("INACTIVE");
		expect(roleOptions).not.toContain("ADMIN");
	});

	test("should cancel role change in confirmation dialog", async ({ page }) => {
		await page.goto("/admin/users/2");
		await page.getByText("Change role").click();
		await page.locator("select#role").selectOption("USER1");
		await page.getByRole("button", { name: "Update" }).click();
		await page.getByRole("alertdialog").waitFor({ state: "visible" });
		await page.getByRole("button", { name: "Cancel" }).click();
		await expect(page.locator("alertdialog")).not.toBeVisible();
		await page.getByRole("button", { name: "Cancel" }).click();
		await expect(page.locator("select#role")).not.toBeVisible();
		await expect(page.locator("p#role")).toHaveText("ADMIN");
	});

	test("should change role to USER1 and make sure /users is updated", async ({
		page,
	}) => {
		await page.getByText("Change role").click();
		await page.locator("select#role").selectOption("USER1");
		await page.getByRole("button", { name: "Update" }).click();
		await expect(
			page.locator(
				'span[role="status"][aria-live="assertive"]:has-text("User role updated successfully")',
			),
		).toBeVisible();
		await expect(page.locator("p#role")).toHaveText("USER1");
		await page.goto("/admin/users");
		await expect(
			page.locator("div.place-self-center.self-center >> p.text-stone-500"),
		).toHaveText("USER1");
	});

	test.skip("should logout when current user (admin_user) changes their own role", async ({
		page,
	}) => {
		await page.goto("/admin/users/2");
		await page.getByText("Change role").click();
		await page.locator("select#role").selectOption("USER1");
		await page.getByRole("button", { name: "Update" }).click();
		await page.getByRole("alertdialog").waitFor({ state: "visible" });
		await page.getByRole("button", { name: "Confirm" }).click();
		await page.waitForURL("http://localhost:4000", { timeout: 5000 });
		await expect(page).toHaveURL("http://localhost:4000");
	});
});
