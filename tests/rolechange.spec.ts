import { expect, test } from "@playwright/test";
import { login } from "./fixtures/login";
import { login as userLogin } from "./fixtures/userlogin";

test("should allow admin to change user role and revert it back", async ({
	page,
}) => {
	await login(page);
	await page.goto("/admin/users/1");

	const currentRole = await page.locator("p#role").textContent();

	await page.getByText("Change role").click();
	await page.locator("select#role").selectOption("USER2");
	await page.getByRole("button", { name: "Update" }).click();

	await expect(
		page.locator(
			'span[role="status"][aria-live="assertive"]:has-text("User role updated successfully")',
		),
	).toBeVisible();
	await expect(page.locator("p#role")).toHaveText("USER2");

	await page.getByText("Change role").click();
	await page.locator("select#role").selectOption(currentRole);
	await page.getByRole("button", { name: "Update" }).click();
	await expect(
		page.locator(
			'span[role="status"][aria-live="assertive"]:has-text("User role updated successfully")',
		),
	).toBeVisible();
	await expect(page.locator("p#role")).toHaveText(currentRole);
});

test("should display all role options except current role in dropdown", async ({
	page,
}) => {
	await login(page);
	await page.goto("/admin/users/2");
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
	await login(page);
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

test("should logout when current user (normal_user) changes their own role from ADMIN to USER1", async ({
	page,
}) => {
	await login(page);
	await page.goto("/admin/users/1");
	await expect(page.locator("p#role")).toHaveText("USER1");
	await page.getByText("Change role").click();
	await page.locator("select#role").selectOption("ADMIN");
	await page.waitForTimeout(3000);
	await page.getByRole("button", { name: "Update" }).click();
	await expect(
		page.locator(
			'span[role="status"]:has-text("User role updated successfully")',
		),
	).toBeVisible();
	await expect(page.locator("p#role")).toHaveText("ADMIN");
	await page.waitForTimeout(3000);
	await page.context().clearCookies();
	await page.waitForTimeout(3000);

	await userLogin(page);
	await page.waitForTimeout(3000);

	await page.goto("/admin/users/1");
	await page.waitForTimeout(3000);
	await expect(page.locator("p#role")).toHaveText("ADMIN");
	await page.waitForTimeout(3000);
	await page.getByText("Change role").click();
	await page.locator("select#role").selectOption("USER1");
	await page.waitForTimeout(3000);
	await page.getByRole("button", { name: "Update" }).click();
	await page.getByRole("alertdialog").waitFor({ state: "visible" });
	await page.getByRole("button", { name: "Confirm" }).click();
	await page.waitForURL("http://localhost:4000", { timeout: 5000 });
	await expect(page).toHaveURL("http://localhost:4000");
});
