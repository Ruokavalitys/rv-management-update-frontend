import { expect, test } from "@playwright/test";
import { login } from "./fixtures/login";
import { login as userLogin } from "./fixtures/userlogin";

test.describe("User Products Page", () => {
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
			await page
				.locator("p#role")
				.waitFor({ state: "visible", timeout: 10000 });
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

	test("User can view products", async ({ page }) => {
		await page.waitForSelector("h3.font-semibold", { timeout: 5000 });
		await expect(page.locator("h3.font-semibold").first()).toBeVisible();
	});

	test("User can search products", async ({ page }) => {
		await page.waitForSelector("h3.font-semibold", { timeout: 5000 });
		await page.fill('input[placeholder="Search products"]', "7up");
		await page.waitForFunction(
			() => document.querySelectorAll("h3.font-semibold").length > 0,
			{ timeout: 5000 },
		);
		const productNames = await page.$$eval("h3.font-semibold", (elements) =>
			elements.map((el) => el.textContent?.trim() || ""),
		);
		expect(
			productNames.every((name) => name.toLowerCase().includes("7up")),
		).toBeTruthy();
	});

	test("User can sort products by price (Low to High)", async ({ page }) => {
		await page.locator("#low_to_high").click();
		const prices = await page.$$eval(".product-price", (elements) =>
			elements.map((el) =>
				parseFloat(el.textContent!.replace("€", "").replace(",", ".").trim()),
			),
		);
		expect(prices).toEqual([...prices].sort((a, b) => a - b));
	});

	test("User can sort products by price (High to Low)", async ({ page }) => {
		await page.locator("#high_to_low").click();
		const prices = await page.$$eval(".product-price", (elements) =>
			elements.map((el) =>
				parseFloat(el.textContent!.replace("€", "").replace(",", ".").trim()),
			),
		);
		expect(prices).toEqual([...prices].sort((a, b) => b - a));
	});

	test("User can filter products by stock (In Stock)", async ({ page }) => {
		await page.getByLabel("Show in stock only").click();
		const stocks = await page.$$eval(".product-stock", (elements) =>
			elements.map((el) => el.textContent!.trim()),
		);
		expect(stocks.every((stock) => stock === "In stock")).toBeTruthy();
	});

	test("User can filter products by stock (Out of Stock)", async ({ page }) => {
		await page.getByLabel("Show out of stock only").click();
		const stocks = await page.$$eval(".product-stock", (elements) =>
			elements.map((el) => el.textContent!.trim()),
		);
		expect(stocks.every((stock) => stock === "Out of stock")).toBeTruthy();
	});

	test("Reset filters clears all selections", async ({ page }) => {
		await page.waitForSelector("h3.font-semibold", { timeout: 10000 });
		const sortLowToHigh = page.locator("#low_to_high");
		const inStockFilter = page.getByLabel("Show in stock only");
		const searchField = page.locator('input[placeholder="Search products"]');
		await sortLowToHigh.click();
		await page.waitForSelector("h3.font-semibold", { timeout: 5000 });
		await inStockFilter.click();
		await page.waitForSelector("h3.font-semibold", { timeout: 5000 });
		await searchField.fill("7up");
		expect(await sortLowToHigh.isChecked()).toBe(true);
		expect(await inStockFilter.isChecked()).toBe(true);
		expect(await searchField.inputValue()).toBe("7up");
		await page
			.getByRole("button", { name: "Reset all filters", exact: true })
			.click();
		await page.waitForSelector("h3.font-semibold", { timeout: 5000 });
		expect(await sortLowToHigh.isChecked()).toBe(false);
		expect(await page.locator("#high_to_low").isChecked()).toBe(false);
		expect(await inStockFilter.isChecked()).toBe(false);
		expect(await page.getByLabel("Show out of stock only").isChecked()).toBe(
			false,
		);
		expect(await searchField.inputValue()).toBe("");
	});

	test.describe("Product Dynamic Counter", () => {
		test("User can filter products by stock and see product count update", async ({
			page,
		}) => {
			const countElement = page.locator(
				"span.text-sm.text-gray-500.font-medium.ml-2",
			);
			await countElement.waitFor({ state: "visible", timeout: 5000 });
			const initialCountText = await countElement.textContent();
			const initialCount = initialCountText
				? parseInt(initialCountText.trim().match(/\d+/)?.[0] || "0", 10)
				: 0;
			const inStockFilter = page.getByLabel("Show in stock only");
			await inStockFilter.click();
			await page.waitForFunction(
				() => document.querySelectorAll("h3.font-semibold").length > 0,
				{ timeout: 5000 },
			);
			const inStockCountText = await countElement.textContent();
			const inStockCount = inStockCountText
				? parseInt(inStockCountText.trim().match(/\d+/)?.[0] || "0", 10)
				: 0;
			expect(inStockCount).toBeLessThanOrEqual(initialCount);
			await inStockFilter.click();
			const outOfStockFilter = page.getByLabel("Show out of stock only");
			await outOfStockFilter.click();
			await page.waitForFunction(
				() => document.querySelectorAll("h3.font-semibold").length >= 0,
				{ timeout: 5000 },
			);
			const outOfStockCountText = await countElement.textContent();
			const outOfStockCount = outOfStockCountText
				? parseInt(outOfStockCountText.trim().match(/\d+/)?.[0] || "0", 10)
				: 0;
			await page
				.getByRole("button", { name: "Reset all filters", exact: true })
				.click();
			await page.waitForFunction(
				() => document.querySelectorAll("h3.font-semibold").length > 0,
				{ timeout: 5000 },
			);
			const finalCountText = await countElement.textContent();
			const finalCount = finalCountText
				? parseInt(finalCountText.trim().match(/\d+/)?.[0] || "0", 10)
				: 0;
			expect(outOfStockCount + inStockCount).toBeLessThanOrEqual(finalCount);
		});
	});
});
