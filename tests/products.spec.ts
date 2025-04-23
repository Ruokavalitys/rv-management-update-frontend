import { expect, test } from "@playwright/test";
import { login } from "./fixtures/login";
import { getRandomBarcode, getRandomName } from "./utils/random";

let randomBarcode: string;
let randomName: string;
let randomRename: string;

test.beforeAll(async () => {
	randomBarcode = await getRandomBarcode();
	randomName = await getRandomName();
	randomRename = await getRandomName();
});

test.beforeEach(async ({ page }) => {
	await login(page);
});

test("User can list products", async ({ page }) => {
	await page.goto("/admin/products");
	await expect(page.getByText("Karjala")).toBeVisible();
});

test.describe
	.serial("CRUD", () => {
		test("User can add a product", async ({ page }) => {
			await page.goto("/admin/new/product");
			await page.getByPlaceholder("Barcode").fill(randomBarcode);
			await page.getByPlaceholder("Barcode").press("Enter");
			await page.getByPlaceholder("Name").fill(randomName);
			await page.getByText("Select category").click();
			await page.getByLabel("Food, other").click();
			await page.getByRole("button", { name: "Create Product" }).click();
			await page.waitForURL(`/admin/products/${randomBarcode}`);
			await expect(
				page.locator("h1").filter({ hasText: randomName }),
			).toBeVisible();
			await expect(page.locator("#category")).toHaveText(
				"Food, other (meat pies etc.)",
			);
			await expect(page.getByLabel("Barcode")).toHaveText(randomBarcode);
		});

		test("User can view a product", async ({ page }) => {
			await page.goto(`/admin/products/${randomBarcode}`);
			await expect(
				page.locator("h1").filter({ hasText: randomName }),
			).toBeVisible();
			await expect(page.locator("#category")).toHaveText(
				"Food, other (meat pies etc.)",
			);
			await expect(page.getByLabel("Barcode")).toHaveText(randomBarcode);
		});

		test("User can edit buyPrice and sellPrice of a product", async ({
			page,
		}) => {
			const randomBuyPrice = (Math.random() * (1000 - 1) + 1).toFixed(2);
			const randomSellPrice = (Math.random() * (1000 - 1) + 1).toFixed(2);

			await page.goto(`/admin/products/${randomBarcode}`);

			await page
				.getByRole("link", { name: "Edit Product Details", exact: true })
				.click();

			const buyPriceField = await page.locator('input[name="buyPrice"]');
			await buyPriceField.waitFor({ state: "visible" });
			await buyPriceField.click();
			await buyPriceField.fill(randomBuyPrice.toString());

			const sellPriceField = await page.locator('input[name="sellPrice"]');
			await sellPriceField.waitFor({ state: "visible" });
			await sellPriceField.click();
			await sellPriceField.fill(randomSellPrice.toString());

			await page.getByRole("button", { name: "Update Product" }).click();

			await page.waitForURL(`/admin/products/${randomBarcode}`);

			await expect(page.locator("#buyPrice")).toHaveText(
				`${randomBuyPrice.replace(".", ",")} €`,
			);

			await expect(page.locator("#sellPrice")).toHaveText(
				`${randomSellPrice.replace(".", ",")} €`,
			);
		});
	});

test.describe
	.serial("Filtering and Sorting", () => {
		test.beforeEach(async ({ page }) => {
			await page.goto("/admin/products");
		});

		test("User can sort products by price (Low to High)", async ({ page }) => {
			await page.locator("#low_to_high").click();
			const prices = await page.$$eval(".product-price", (elements) =>
				elements.map((el) =>
					parseFloat(el.textContent!.replace("€", "").trim()),
				),
			);
			expect(prices).toEqual([...prices].sort((a, b) => a - b));
		});

		test("User can sort products by price (High to Low)", async ({ page }) => {
			await page.locator("#high_to_low").click();
			const prices = await page.$$eval(".product-price", (elements) =>
				elements.map((el) =>
					parseFloat(el.textContent!.replace("€", "").trim()),
				),
			);
			expect(prices).toEqual([...prices].sort((a, b) => b - a));
		});

		test("User can sort products by quantity (Low to High)", async ({
			page,
		}) => {
			await page.locator("#low_to_high_quantity").click();
			const quantities = await page.$$eval(".product-quantity", (elements) =>
				elements.map((el) => parseInt(el.textContent!.trim(), 10)),
			);
			expect(quantities).toEqual([...quantities].sort((a, b) => a - b));
		});

		test("User can sort products by quantity (High to Low)", async ({
			page,
		}) => {
			await page.locator("#high_to_low_quantity").click();
			const quantities = await page.$$eval(".product-quantity", (elements) =>
				elements.map((el) => parseInt(el.textContent!.trim(), 10)),
			);
			expect(quantities).toEqual([...quantities].sort((a, b) => b - a));
		});

		test("User can filter products by stock (In Stock)", async ({ page }) => {
			await page.getByLabel("Show in stock only").click();
			const stocks = await page.$$eval(".product-quantity", (elements) =>
				elements.map((el) => parseInt(el.textContent!.trim(), 10)),
			);
			expect(stocks.every((stock) => stock > 0)).toBeTruthy();
		});

		test("User can filter products by stock (Out of Stock)", async ({
			page,
		}) => {
			await page.getByLabel("Show out of stock only").click();
			const stocks = await page.$$eval(".product-quantity", (elements) =>
				elements.map((el) => parseInt(el.textContent!.trim(), 10)),
			);
			expect(stocks.every((stock) => stock === 0)).toBeTruthy();
		});

		test("User can filter products by (Min) quantity", async ({ page }) => {
			await page.fill("#minQuantity", "10");
			await page.waitForTimeout(1000);
			const stocks = await page.$$eval(".product-quantity", (elements) =>
				elements.map((el) => parseInt(el.textContent!.trim(), 10)),
			);
			expect(stocks.every((stock) => stock >= 10)).toBeTruthy();
		});

		test("User can filter products by (Max) quantity", async ({ page }) => {
			await page.fill("#maxQuantity", "50");
			await page.waitForTimeout(1000);
			const stocks = await page.$$eval(".product-quantity", (elements) =>
				elements.map((el) => parseInt(el.textContent!.trim(), 10)),
			);
			expect(stocks.every((stock) => stock <= 50)).toBeTruthy();
		});

		test("User can filter products by (Min and Max) quantity", async ({
			page,
		}) => {
			await page.fill("#minQuantity", "10");
			await page.fill("#maxQuantity", "50");
			await page.waitForTimeout(1000);
			const stocks = await page.$$eval(".product-quantity", (elements) =>
				elements.map((el) => parseInt(el.textContent!.trim(), 10)),
			);
			expect(stocks.every((stock) => stock >= 10 && stock <= 50)).toBeTruthy();
		});

		test("User can filter products by quantity where (Min > Max)", async ({
			page,
		}) => {
			await page.fill("#minQuantity", "50");
			await page.fill("#maxQuantity", "10");
			await page.waitForTimeout(1000);
			const stocks = await page.$$eval(".product-quantity", (elements) =>
				elements.map((el) => parseInt(el.textContent!.trim(), 10)),
			);
			expect(stocks.length).toBe(0);
		});

		test("User can filter products by (Min) quantity only, and products are correctly filtered", async ({
			page,
		}) => {
			await page.fill("#minQuantity", "10");
			await page.waitForTimeout(1000);
			const stocks = await page.$$eval(".product-quantity", (elements) =>
				elements.map((el) => parseInt(el.textContent!.trim(), 10)),
			);
			expect(stocks.every((stock) => stock >= 10)).toBeTruthy();
		});

		test("User can filter products by (Max) quantity only, and products are correctly filtered", async ({
			page,
		}) => {
			await page.fill("#maxQuantity", "50");
			await page.waitForTimeout(1000);
			const stocks = await page.$$eval(".product-quantity", (elements) =>
				elements.map((el) => parseInt(el.textContent!.trim(), 10)),
			);
			expect(stocks.every((stock) => stock <= 50)).toBeTruthy();
		});

		test("Selecting Sort by quantity clears Sort by price selection", async ({
			page,
		}) => {
			await page.locator("#low_to_high").click();
			await page.waitForTimeout(500);
			const priceLowToHighChecked = await page
				.locator("#low_to_high")
				.isChecked();
			expect(priceLowToHighChecked).toBe(true);
			await page.locator("#low_to_high_quantity").click();
			await page.waitForTimeout(500);
			const updatedPriceLowToHighChecked = await page
				.locator("#low_to_high")
				.isChecked();
			expect(updatedPriceLowToHighChecked).toBe(false);
			const quantityLowToHighChecked = await page
				.locator("#low_to_high_quantity")
				.isChecked();
			expect(quantityLowToHighChecked).toBe(true);
		});

		test("Show products by stock can be activated with any sorting option", async ({
			page,
		}) => {
			await page.locator("#low_to_high").click();
			await page.waitForTimeout(500);
			await page.getByLabel("Show in stock only").click();
			await page.waitForTimeout(500);
			const inStockChecked = await page
				.getByLabel("Show in stock only")
				.isChecked();
			expect(inStockChecked).toBe(true);
			const priceLowToHighChecked = await page
				.locator("#low_to_high")
				.isChecked();
			expect(priceLowToHighChecked).toBe(true);
			await page.getByLabel("Show in stock only").click();
			await page.waitForTimeout(500);
			await page.locator("#low_to_high_quantity").click();
			await page.waitForTimeout(500);
			await page.getByLabel("Show out of stock only").click();
			await page.waitForTimeout(500);
			const outOfStockChecked = await page
				.getByLabel("Show out of stock only")
				.isChecked();
			expect(outOfStockChecked).toBe(true);
			const quantityLowToHighChecked = await page
				.locator("#low_to_high_quantity")
				.isChecked();
			expect(quantityLowToHighChecked).toBe(true);
		});

		test("Reset button clears Sort by quantity selection", async ({ page }) => {
			await page.locator("#low_to_high_quantity").click();
			await page.waitForTimeout(500);
			const isLowToHighChecked = await page
				.locator("#low_to_high_quantity")
				.isChecked();
			expect(isLowToHighChecked).toBe(true);
			await page
				.getByRole("button", { name: "Reset", exact: true })
				.nth(0)
				.click();
			await page.waitForTimeout(500);
			const isLowToHighCheckedAfterReset = await page
				.locator("#low_to_high_quantity")
				.isChecked();
			expect(isLowToHighCheckedAfterReset).toBe(false);
			const isHighToLowCheckedAfterReset = await page
				.locator("#high_to_low_quantity")
				.isChecked();
			expect(isHighToLowCheckedAfterReset).toBe(false);
		});

		test("Reset button clears Filter by quantity inputs", async ({ page }) => {
			const minQuantityField = await page.locator("#minQuantity");
			const maxQuantityField = await page.locator("#maxQuantity");
			await minQuantityField.fill("10");
			await maxQuantityField.fill("50");
			await page.waitForTimeout(500);
			expect(await minQuantityField.inputValue()).toBe("10");
			expect(await maxQuantityField.inputValue()).toBe("50");
			await page
				.getByRole("button", { name: "Reset", exact: true })
				.nth(0)
				.click();
			await page.waitForTimeout(500);
			expect(await minQuantityField.inputValue()).toBe("");
			expect(await maxQuantityField.inputValue()).toBe("");
		});

		test("Reset button clears Sort by price selection", async ({ page }) => {
			await page.locator("#low_to_high").click();
			await page.waitForTimeout(500);
			const isLowToHighChecked = await page.locator("#low_to_high").isChecked();
			expect(isLowToHighChecked).toBe(true);
			await page
				.getByRole("button", { name: "Reset", exact: true })
				.nth(0)
				.click();
			await page.waitForTimeout(500);
			const isLowToHighCheckedAfterReset = await page
				.locator("#low_to_high")
				.isChecked();
			expect(isLowToHighCheckedAfterReset).toBe(false);
			const isHighToLowCheckedAfterReset = await page
				.locator("#high_to_low")
				.isChecked();
			expect(isHighToLowCheckedAfterReset).toBe(false);
		});

		test("Reset button clears Show products by stock selection", async ({
			page,
		}) => {
			await page.getByLabel("Show in stock only").click();
			await page.waitForTimeout(500);
			const isInStockChecked = await page
				.getByLabel("Show in stock only")
				.isChecked();
			expect(isInStockChecked).toBe(true);
			await page
				.getByRole("button", { name: "Reset", exact: true })
				.nth(0)
				.click();
			await page.waitForTimeout(500);
			const isInStockCheckedAfterReset = await page
				.getByLabel("Show in stock only")
				.isChecked();
			expect(isInStockCheckedAfterReset).toBe(false);
			const isOutOfStockCheckedAfterReset = await page
				.getByLabel("Show out of stock only")
				.isChecked();
			expect(isOutOfStockCheckedAfterReset).toBe(false);
		});

		test("Reset all filters button clears all selections", async ({ page }) => {
			await page.locator("#low_to_high").click();
			await page.waitForTimeout(500);
			expect(await page.locator("#low_to_high").isChecked()).toBe(true);
			await page.locator("#low_to_high_quantity").click();
			await page.waitForTimeout(500);
			expect(await page.locator("#low_to_high_quantity").isChecked()).toBe(
				true,
			);
			const minQuantityField = await page.locator("#minQuantity");
			const maxQuantityField = await page.locator("#maxQuantity");
			await minQuantityField.fill("10");
			await maxQuantityField.fill("50");
			await page.waitForTimeout(500);
			expect(await minQuantityField.inputValue()).toBe("10");
			expect(await maxQuantityField.inputValue()).toBe("50");
			await page.getByLabel("Show in stock only").click();
			await page.waitForTimeout(500);
			expect(await page.getByLabel("Show in stock only").isChecked()).toBe(
				true,
			);
			const searchField = await page.locator(
				'input[placeholder="Search products / boxes"]',
			);
			await searchField.fill("test search");
			await page.waitForTimeout(500);
			expect(await searchField.inputValue()).toBe("test search");
			await page
				.getByRole("button", { name: "Reset all filters", exact: true })
				.click();
			await page.waitForTimeout(500);
			expect(await page.locator("#low_to_high").isChecked()).toBe(false);
			expect(await page.locator("#high_to_low").isChecked()).toBe(false);
			expect(await page.locator("#low_to_high_quantity").isChecked()).toBe(
				false,
			);
			expect(await page.locator("#high_to_low_quantity").isChecked()).toBe(
				false,
			);
			expect(await minQuantityField.inputValue()).toBe("");
			expect(await maxQuantityField.inputValue()).toBe("");
			expect(await page.getByLabel("Show in stock only").isChecked()).toBe(
				false,
			);
			expect(await page.getByLabel("Show out of stock only").isChecked()).toBe(
				false,
			);
			expect(await searchField.inputValue()).toBe("");
		});

		test("User can filter products by regex (lemon/lime/citrus/7up flavors) and max quantity", async ({
			page,
		}) => {
			await page.goto("/admin/products");
			const regexInput = await page.locator(
				'input[placeholder="Search with Regex (e.g., ^A.*$)"]',
			);
			await regexInput.fill(".*(lemon|lime|citrus|7up).*");
			await page.waitForFunction(
				() => document.querySelectorAll("h3.font-semibold").length > 0,
				{ timeout: 1000 },
			);
			await page.fill("#maxQuantity", "100");
			await page.waitForFunction(
				() => document.querySelectorAll("h3.font-semibold").length > 0,
				{ timeout: 1000 },
			);
			await page.waitForSelector("span:has-text('items available')", {
				state: "visible",
				timeout: 1000,
			});
			const initialCountText = await page
				.locator("span:has-text('items available')")
				.textContent();
			const initialCount = initialCountText
				? parseInt(initialCountText.match(/\d+/)?.[0] || "0", 10)
				: 0;
			const productNames = await page.$$eval("h3.font-semibold", (elements) =>
				elements.map((el) => el.textContent!.trim()),
			);
			const stocks = await page.$$eval(".product-quantity", (elements) =>
				elements.map((el) => parseInt(el.textContent!.trim(), 10)),
			);
			expect(productNames.length).toBe(initialCount);
			const regex = new RegExp(".*(lemon|lime|citrus|7up).*", "i");
			expect(productNames.every((name) => regex.test(name))).toBeTruthy();
			expect(stocks.every((stock) => stock <= 100)).toBeTruthy();
			await page.fill("#maxQuantity", "50");
			await page.waitForFunction(
				() => document.querySelectorAll("h3.font-semibold").length > 0,
				{ timeout: 1000 },
			);
			await page.waitForSelector("span:has-text('items available')", {
				state: "visible",
				timeout: 1000,
			});
			const updatedCountText = await page
				.locator("span:has-text('items available')")
				.textContent();
			const updatedCount = updatedCountText
				? parseInt(updatedCountText.match(/\d+/)?.[0] || "0", 10)
				: 0;
			const productNamesAfter = await page.$$eval(
				"h3.font-semibold",
				(elements) => elements.map((el) => el.textContent!.trim()),
			);
			const stocksAfter = await page.$$eval(".product-quantity", (elements) =>
				elements.map((el) => parseInt(el.textContent!.trim(), 10)),
			);
			expect(productNamesAfter.length).toBe(updatedCount);
			expect(productNamesAfter.every((name) => regex.test(name))).toBeTruthy();
			expect(stocksAfter.every((stock) => stock <= 50)).toBeTruthy();
			await page
				.getByRole("button", { name: "Reset all filters", exact: true })
				.click();
			await page.waitForTimeout(500);
		});

		test("User can filter products by regex, stock, quantity, and sort by price", async ({
			page,
		}) => {
			await page.goto("/admin/products");
			const regexInput = await page.locator(
				'input[placeholder="Search with Regex (e.g., ^A.*$)"]',
			);
			await regexInput.fill(".*cola.*");
			await page.waitForFunction(
				() => document.querySelectorAll("h3.font-semibold").length > 0,
				{ timeout: 5000 },
			);
			await page.getByLabel("Show in stock only").click();
			await page.waitForFunction(
				() => document.querySelectorAll("h3.font-semibold").length > 0,
				{ timeout: 5000 },
			);
			await page.fill("#minQuantity", "10");
			await page.fill("#maxQuantity", "50");
			await page.waitForFunction(
				() => document.querySelectorAll("h3.font-semibold").length > 0,
				{ timeout: 5000 },
			);
			await page.locator("#low_to_high").click();
			await page.waitForFunction(
				() => document.querySelectorAll("h3.font-semibold").length > 0,
				{ timeout: 5000 },
			);
			await page.waitForSelector("span:has-text('items available')", {
				state: "visible",
				timeout: 5000,
			});
			const countText = await page
				.locator("span:has-text('items available')")
				.textContent();
			const expectedCount = countText
				? parseInt(countText.match(/\d+/)?.[0] || "0", 10)
				: 0;
			const productNames = await page.$$eval("h3.font-semibold", (elements) =>
				elements.map((el) => el.textContent!.trim()),
			);
			const stocks = await page.$$eval(".product-quantity", (elements) =>
				elements.map((el) => parseInt(el.textContent!.trim(), 10)),
			);
			const prices = await page.$$eval(".product-price", (elements) =>
				elements.map((el) =>
					parseFloat(el.textContent!.replace("€", "").trim()),
				),
			);
			expect(productNames.length).toBe(expectedCount);
			const regex = new RegExp(".*cola.*", "i");
			expect(productNames.every((name) => regex.test(name))).toBeTruthy();
			expect(stocks.every((stock) => stock > 0)).toBeTruthy();
			expect(stocks.every((stock) => stock >= 10 && stock <= 50)).toBeTruthy();
			expect(prices).toEqual([...prices].sort((a, b) => a - b));
			await page
				.getByRole("button", { name: "Reset all filters", exact: true })
				.click();
			await page.waitForTimeout(500);
		});
	});

test.describe
	.serial("Product dynamic counter", () => {
		let initialCount: number;

		test.beforeEach(async ({ page }) => {
			await page.goto("/admin/products");
			await page.waitForSelector(
				"span.text-sm.text-gray-500.font-medium.ml-2",
				{
					state: "visible",
					timeout: 5000,
				},
			);
			await page.waitForFunction(
				() => document.querySelectorAll("h3.font-semibold").length > 0,
				{ timeout: 5000 },
			);
			const initialCountText = await page
				.locator("span.text-sm.text-gray-500.font-medium.ml-2")
				.textContent();
			initialCount = initialCountText
				? parseInt(initialCountText.trim().match(/\d+/)?.[0] || "0", 10)
				: 0;
		});

		test("User can filter products by stock and see product count update", async ({
			page,
		}) => {
			await page.getByLabel("Show in stock only").click();
			await page.waitForFunction(
				() => document.querySelectorAll("h3.font-semibold").length > 0,
				{ timeout: 5000 },
			);
			const inStockCountText = await page
				.locator("span.text-sm.text-gray-500.font-medium.ml-2")
				.textContent();
			const inStockCount = inStockCountText
				? parseInt(inStockCountText.trim().match(/\d+/)?.[0] || "0", 10)
				: 0;
			expect(inStockCount).toBeLessThanOrEqual(initialCount);
			await page.getByLabel("Show in stock only").click();
			await page.getByLabel("Show out of stock only").click();
			await page.waitForFunction(
				() => document.querySelectorAll("h3.font-semibold").length >= 0,
				{ timeout: 5000 },
			);
			const outOfStockCountText = await page
				.locator("span.text-sm.text-gray-500.font-medium.ml-2")
				.textContent();
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
			const finalCountText = await page
				.locator("span.text-sm.text-gray-500.font-medium.ml-2")
				.textContent();
			const finalCount = finalCountText
				? parseInt(finalCountText.trim().match(/\d+/)?.[0] || "0", 10)
				: 0;
			expect(outOfStockCount + inStockCount).toBeLessThanOrEqual(finalCount);
		});

		test("User can add a product and the count updates", async ({ page }) => {
			await page.goto("/admin/products");
			await page.waitForSelector("span.text-sm.text-gray-500.font-medium.ml-2");
			const countBeforeAddingText = await page
				.locator("span.text-sm.text-gray-500.font-medium.ml-2")
				.textContent();
			const countBeforeAdding = countBeforeAddingText
				? parseInt(countBeforeAddingText.match(/\d+/)?.[0] || "0", 10)
				: 0;

			const uniqueBarcode = await getRandomBarcode();
			await page.goto("/admin/new/product");
			await page.getByPlaceholder("Barcode").fill(uniqueBarcode);
			await page.getByPlaceholder("Barcode").press("Enter");
			await page.getByPlaceholder("Name").fill(randomName);
			await page.getByText("Select category").click();
			await page.getByLabel("Food, other").click();
			await page.getByRole("button", { name: "Create Product" }).click();
			await page.waitForURL(`/admin/products/${uniqueBarcode}`);
			await page.goto("/admin/products");
			await page.waitForSelector("span.text-sm.text-gray-500.font-medium.ml-2");
			const updatedCountText = await page
				.locator("span.text-sm.text-gray-500.font-medium.ml-2")
				.textContent();
			const updatedCount = updatedCountText
				? parseInt(updatedCountText.match(/\d+/)?.[0] || "0", 10)
				: 0;
			expect(updatedCount).toBe(countBeforeAdding + 1);
		});

		test.describe
			.serial("Filtering by Quantity with Negative Values", () => {
				test("User can filter products by negative to negative quantity", async ({
					page,
				}) => {
					await page.fill("#minQuantity", "-50");
					await page.fill("#maxQuantity", "-10");
					await page.waitForTimeout(1000);
					const stocks = await page.$$eval(".product-quantity", (elements) =>
						elements.map((el) => parseInt(el.textContent!.trim(), 10)),
					);
					expect(
						stocks.every((stock) => stock >= -50 && stock <= -10),
					).toBeTruthy();
				});

				test("User can filter products by negative to positive quantity", async ({
					page,
				}) => {
					await page.fill("#minQuantity", "-50");
					await page.fill("#maxQuantity", "10");
					await page.waitForTimeout(1000);
					const stocks = await page.$$eval(".product-quantity", (elements) =>
						elements.map((el) => parseInt(el.textContent!.trim(), 10)),
					);
					expect(
						stocks.every((stock) => stock >= -50 && stock <= 10),
					).toBeTruthy();
				});
			});
	});
