import { expect, test } from "@playwright/test";
import { login } from "./fixtures/login";

test.beforeEach(async ({ page }) => {
	await login(page);
});

test("User can login", async ({ page }) => {
	await expect(page.getByText("Dashboard")).toBeVisible();
});

test("User can login and nav displays correct username and profile link", async ({
	page,
}) => {
	await expect(page.getByText("Dashboard")).toBeVisible();

	const loggedInAs = await page.getByText(/Logged in as /).innerText();
	const username = loggedInAs.replace("Logged in as ", "").trim();
	await expect(page.getByText(loggedInAs)).toBeVisible();

	const userLink = page.locator("a", { hasText: username });
	const href = await userLink.getAttribute("href");
	const userId = href!.split("/").pop();

	await userLink.click();
	await page.waitForURL(new RegExp(`/admin/users/${userId}`));
	await expect(page.locator("h1").filter({ hasText: username })).toBeVisible();
});

test("User can logout", async ({ page }) => {
	await page.getByRole("button", { name: "Log out" }).click();
	await expect(page.getByPlaceholder("Enter username...")).toBeVisible();
});
