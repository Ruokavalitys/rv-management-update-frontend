import { Page } from "@playwright/test";

export const login = async (
	page: Page,
	username: string = "normal_user",
	password: string = "hunter2",
) => {
	await page.goto("/");
	await page
		.getByLabel("Username")
		.waitFor({ state: "visible", timeout: 10000 });
	await page
		.getByLabel("Password")
		.waitFor({ state: "visible", timeout: 10000 });
	await page.getByLabel("Username").fill(username);
	await page.getByLabel("Password").fill(password);
	await page.getByRole("button", { name: "Log in" }).click();
	await page.waitForURL("/", { timeout: 10000 });
};
