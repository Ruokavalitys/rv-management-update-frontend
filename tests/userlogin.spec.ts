import { expect, test } from "@playwright/test";
import { login } from "./fixtures/login";
import { login as userLogin } from "./fixtures/userlogin";

test.beforeEach(async ({ page }) => {
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
	if (currentRole === "ADMIN" || currentRole === "INACTIVE") {
		await page.getByText("Change role").click();
		await page.locator("select#role").waitFor({ state: "visible" });
		await page.locator("select#role").selectOption("USER1");
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
			() => document.querySelector("p#role")?.textContent === "USER1",
			null,
			{ timeout: 10000 },
		);
		await expect(page.locator("p#role")).toHaveText("USER1", {
			timeout: 10000,
		});
		await page.reload();
		await page.locator("p#role").waitFor({ state: "visible", timeout: 10000 });
		await page.waitForFunction(
			() => document.querySelector("p#role")?.textContent === "USER1",
			null,
			{ timeout: 10000 },
		);
		await expect(page.locator("p#role")).toHaveText("USER1", {
			timeout: 10000,
		});
	}
	await page.context().clearCookies();
	await userLogin(page);
});

test("User can login", async ({ page }) => {
	await expect(page.getByText("Products", { exact: true })).toBeVisible();
	await expect(page.getByText("My account", { exact: true })).toBeVisible();
});

test("User can login and nav displays correct username and profile link", async ({
	page,
}) => {
	await expect(page.getByText("Products", { exact: true })).toBeVisible();
	await expect(page.getByText("My account", { exact: true })).toBeVisible();
	const loggedInAs = await page.getByText(/Logged in as /).innerText();
	const username = loggedInAs.replace("Logged in as ", "").trim();
	await expect(page.getByText(loggedInAs)).toBeVisible();
	const userLink = page.locator("a", { hasText: username });
	const href = await userLink.getAttribute("href");
	const userId = href!.split("/").pop();
	await userLink.click();
	await page.waitForURL(new RegExp(`/users/${userId}`));
	await expect(page.locator("h1").filter({ hasText: username })).toBeVisible();
});

test("User can logout", async ({ page }) => {
	await page.getByRole("button", { name: "Log out" }).click();
	await expect(page.getByPlaceholder("Enter username...")).toBeVisible();
});
