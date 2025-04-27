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
	await page.locator("select#role").waitFor({ state: "visible" });
	const roleOptions = await page.locator("select#role").evaluate((select) =>
		Array.from(select.options)
			.map((option) => option.value)
			.filter((value) => value),
	);
	const newRole = roleOptions.find((role) => role !== currentRole);
	await page.locator("select#role").selectOption(newRole);
	await page.getByRole("button", { name: "Update" }).click();
	const dialog = page.getByRole("alertdialog");
	if (await dialog.isVisible()) {
		await page.getByRole("button", { name: "Confirm" }).click();
	}
	await page
		.locator('span[role="status"]:has-text("updated successfully")')
		.waitFor({ state: "visible" });
	await expect(
		page.locator('span[role="status"]:has-text("updated successfully")'),
	).toBeVisible();
	await expect(page.locator("p#role")).toHaveText(newRole);

	await page.getByText("Change role").click();
	await page.locator("select#role").waitFor({ state: "visible" });
	await page.locator("select#role").selectOption(currentRole);
	await page.getByRole("button", { name: "Update" }).click();

	if (await dialog.isVisible()) {
		await page.getByRole("button", { name: "Confirm" }).click();
	}
	await page
		.locator('span[role="status"]:has-text("updated successfully")')
		.waitFor({ state: "visible" });
	await expect(
		page.locator('span[role="status"]:has-text("updated successfully")'),
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

test("should logout when current user changes their role from ADMIN to USER1", async ({
	page,
}) => {
	await login(page);
	await page.goto("/admin/users/1");
	await page.reload();
	await page.locator("p#role").waitFor({ state: "visible", timeout: 10000 });
	await page.waitForFunction(
		() => document.querySelector("p#role")?.textContent !== "",
		null,
		{ timeout: 10000 },
	);
	const currentRole = await page.locator("p#role").textContent();

	if (currentRole !== "ADMIN") {
		await page.getByText("Change role").click();
		await page.locator("select#role").waitFor({ state: "visible" });
		await page.locator("select#role").selectOption("ADMIN");
		await page
			.getByRole("button", { name: "Update" })
			.waitFor({ state: "visible", timeout: 10000 });
		await page.getByRole("button", { name: "Update" }).click();
		const dialog = page.getByRole("alertdialog");
		if (await dialog.isVisible()) {
			await page.getByRole("button", { name: "Confirm" }).click();
		}
		await page
			.locator('span[role="status"]:has-text("updated successfully")')
			.waitFor({ state: "visible", timeout: 10000 });
		await page.waitForFunction(
			() => document.querySelector("p#role")?.textContent === "ADMIN",
			null,
			{ timeout: 10000 },
		);
		await expect(page.locator("p#role")).toHaveText("ADMIN", {
			timeout: 10000,
		});
		await page.reload();
		await page.locator("p#role").waitFor({ state: "visible", timeout: 10000 });
		await page.waitForFunction(
			() => document.querySelector("p#role")?.textContent === "ADMIN",
			null,
			{ timeout: 10000 },
		);
		await expect(page.locator("p#role")).toHaveText("ADMIN", {
			timeout: 10000,
		});
	}
	await page.context().clearCookies();
	await userLogin(page);
	await page.waitForURL("http://127.0.0.1:4000/admin", { timeout: 10000 });
	await expect(page).toHaveURL("http://127.0.0.1:4000/admin");
	await page.goto("/admin/users/1");
	await expect(page).toHaveURL(`http://127.0.0.1:4000/admin/users/1`);
	await page.locator("p#role").waitFor({ state: "visible", timeout: 10000 });
	await page.waitForFunction(
		() => document.querySelector("p#role")?.textContent !== "",
		null,
		{ timeout: 10000 },
	);
	await page.waitForFunction(
		() => document.querySelector("p#role")?.textContent === "ADMIN",
		null,
		{ timeout: 10000 },
	);
	await expect(page.locator("p#role")).toHaveText("ADMIN", { timeout: 10000 });
	await page.getByText("Change role").click();
	await page.locator("select#role").waitFor({ state: "visible" });
	await page.locator("select#role").selectOption("USER1");
	await page
		.getByRole("button", { name: "Update" })
		.waitFor({ state: "visible", timeout: 10000 });
	await page.getByRole("button", { name: "Update" }).click();
	const dialog2 = page.getByRole("alertdialog");
	if (await dialog2.isVisible()) {
		await page.getByRole("button", { name: "Confirm" }).click();
	}
	await page.waitForURL("http://localhost:4000", { timeout: 10000 });
	await expect(page).toHaveURL("http://localhost:4000");
	await page.goto("/admin/users/1");
	await expect(page).not.toHaveURL(new RegExp(`/admin/users/1`));
});
