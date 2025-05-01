import { expect, test } from "@playwright/test";
import { login } from "./fixtures/login";

test.beforeEach(async ({ page }) => {
	await login(page);
	await page.goto("admin/configuration");
});

test("changes margin to new value and reverts it back", async ({ page }) => {
	const marginInput = page.locator('input[aria-label="Default margin"]');
	const saveButton = page.locator("button#marginSubmit");

	await expect(marginInput).toBeVisible({ timeout: 10000 });
	const originalMargin = await marginInput.inputValue();
	const newMargin = (parseInt(originalMargin, 10) + 1).toString();
	await marginInput.fill(newMargin);
	await expect(saveButton).toBeEnabled({ timeout: 5000 });
	await saveButton.click();
	await page.waitForTimeout(5000);
	await expect(marginInput).toHaveValue(newMargin, { timeout: 5000 });
	await marginInput.fill(originalMargin);
	await expect(marginInput).toHaveValue(originalMargin, { timeout: 5000 });
	await saveButton.click();
	await page.waitForTimeout(5000);
	await expect(marginInput).toHaveValue(originalMargin, { timeout: 5000 });
	await expect(saveButton).toBeDisabled({ timeout: 5000 });
});

test("save button remains disabled if margin is not changed", async ({
	page,
}) => {
	const marginInput = page.locator('input[aria-label="Default margin"]');
	const saveButton = page.locator("button#marginSubmit");

	await expect(marginInput).toBeVisible({ timeout: 5000 });
	await expect(saveButton).toBeDisabled({ timeout: 5000 });
});
