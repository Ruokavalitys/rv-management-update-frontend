import { expect, test } from "@playwright/test";
import { login } from "./fixtures/login";

test.beforeEach(async ({ page }) => {
	await login(page);
});

test("should display Dashboard title", async ({ page }) => {
	await expect(page.getByText("Dashboard")).toBeVisible();
});

test("should display all section titles", async ({ page }) => {
	await expect(page.getByText("Stock value")).toBeVisible();
	await expect(page.getByText("Low stock")).toBeVisible();
	await expect(page.getByText("Most sold products")).toBeVisible();
	await expect(page.getByText("Latest transactions")).toBeVisible();
	await expect(page.getByText("Total sales value")).toBeVisible();
	await expect(page.getByText("Average sale value")).toBeVisible();
	await expect(page.getByText("Total transactions")).toBeVisible();
});

test("should display dropdown with All time text", async ({ page }) => {
	await expect(page.getByRole("button", { name: "All time" })).toBeVisible();
});

test("should show custom date inputs when Custom is selected", async ({
	page,
}) => {
	await page.getByRole("button", { name: "All time" }).click();
	await page.getByText("Custom").click();
	await expect(page.getByLabel("Custom start date")).toBeVisible();
	await expect(page.getByLabel("Custom end date")).toBeVisible();
	await expect(page.getByLabel("Reset custom date range")).toBeVisible();
});
