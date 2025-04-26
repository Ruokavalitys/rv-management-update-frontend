import { expect, test } from "@playwright/test";
import { login } from "./fixtures/login";
import { getRandomBarcode, getRandomName } from "./utils/random";

const globalBarcodes: { randomBarcode?: string; boxBarcode?: string } = {};

test.afterAll(async () => {
	globalBarcodes.randomBarcode = undefined;
	globalBarcodes.boxBarcode = undefined;
});

async function createProduct(page, barcode: string, productName: string) {
	await page.getByLabel("Enter barcode").fill(barcode);
	await page.getByRole("button", { name: /buy in/i }).click();
	await expect(page).toHaveURL(
		new RegExp(`^http://127.0.0.1:4000/admin/new/${barcode}`),
	);
	await page.locator("#create-product").click();
	await expect(page).toHaveURL(
		new RegExp(`^http://127.0.0.1:4000/admin/new/product\\?barcode=${barcode}`),
	);
	await page.locator('input[name="name"]').fill(productName);
	await expect(page.locator('input[name="name"]')).toHaveValue(productName);
	await page.locator("#productSubmit").click();
}

async function attachBox(page, barcode: string, itemsPerBox: string) {
	await page.locator("button", { hasText: "Attach Box" }).click();
	await expect(page).toHaveURL(
		new RegExp(`^http://127.0.0.1:4000/admin/new/${barcode}/box-prompt`),
	);
	await page.locator("button svg.lucide-dice5").click();
	const boxBarcode = await page
		.locator('input[name="boxBarcode"]')
		.inputValue();
	await expect(page.locator('input[name="boxBarcode"]')).not.toHaveValue("");
	await page.locator('input[name="itemsPerBox"]').fill(itemsPerBox);
	await expect(page.locator('input[name="itemsPerBox"]')).toHaveValue(
		itemsPerBox,
	);
	await page
		.locator('button[type="submit"]', { hasText: "Attach Box" })
		.click();
	return boxBarcode;
}

async function confirmProductBuyIn(page, barcode: string, buyPrice: string) {
	await expect(page).toHaveURL(
		new RegExp(`^http://127.0.0.1:4000/admin/buy_in/product/${barcode}`),
	);
	const quantityField = page.locator('input[name="count"]');
	await quantityField.waitFor({ state: "visible" });
	await expect(quantityField).toHaveValue("1");
	await page.locator('input[name="buyPrice"]').fill(buyPrice);
	await expect(page.locator('input[name="buyPrice"]')).toHaveValue(buyPrice);
	const marginNote = page.locator("text=Default margin");
	await expect(marginNote).toBeVisible();
	const marginText = await marginNote.textContent();
	const marginPercent = parseFloat(marginText!.match(/([\d.]+)%/)![1]);
	const expectedSellPrice = (
		parseFloat(buyPrice) *
		(1 + marginPercent / 100)
	).toFixed(2);
	await expect(page.locator('input[name="sellPrice"]')).toHaveValue(
		expectedSellPrice,
	);
	await page.locator("button", { hasText: "Confirm Buy-In (Product)" }).click();
	await expect(page).toHaveURL("http://127.0.0.1:4000/admin/buy_in");
}

test.beforeEach(async ({ page }) => {
	await login(page);
	await page.goto("/admin/buy_in");
});

test.describe
	.serial("All buy-in tests", () => {
		test("Input unknown barcode, select product, attach a box and finish buy-in", async ({
			page,
		}) => {
			const randomBarcode = await getRandomBarcode();
			const randomProductName = await getRandomName();
			await createProduct(page, randomBarcode, randomProductName);
			const boxBarcode = await attachBox(page, randomBarcode, "7");
			await confirmProductBuyIn(page, randomBarcode, "1");
			globalBarcodes.randomBarcode = randomBarcode;
			globalBarcodes.boxBarcode = boxBarcode;
		});

		test("Input unknown barcode, select product and finish buy-in without attaching a box", async ({
			page,
		}) => {
			const randomBarcode = await getRandomBarcode();
			const randomProductName = await getRandomName();
			await createProduct(page, randomBarcode, randomProductName);
			await expect(page).toHaveURL(
				new RegExp(
					`^http://127.0.0.1:4000/admin/new/${randomBarcode}/box-prompt`,
				),
			);
			await page.locator("button", { hasText: "No Box" }).click();
			await confirmProductBuyIn(page, randomBarcode, "1");
		});

		test("Input unknown barcode, select box, attach product, test dropdown cancel button, attach product again and finish buy-in", async ({
			page,
		}) => {
			const randomBarcode = await getRandomBarcode();
			await page.getByLabel("Enter barcode").fill(randomBarcode);
			await page.getByRole("button", { name: /buy in/i }).click();
			await expect(page).toHaveURL(
				new RegExp(`^http://127.0.0.1:4000/admin/new/${randomBarcode}`),
			);
			await page.locator("#create-box").click();
			await expect(page).toHaveURL(
				new RegExp(`^http://127.0.0.1:4000/admin/new/${randomBarcode}/new-box`),
			);
			await page.locator('input[name="itemsPerBox"]').fill("10");
			await expect(page.locator('input[name="itemsPerBox"]')).toHaveValue("10");
			const itemsPerBox = parseFloat(
				await page.locator('input[name="itemsPerBox"]').inputValue(),
			);
			await page.locator("button#product").click();
			const options = page.locator('[role="option"]');
			const count = await options.count();
			const randomIndex = Math.floor(Math.random() * count);
			await options.nth(randomIndex).click();
			await page.locator("svg.lucide-x").click();
			await page.locator("button#product").click();
			const newRandomIndex = Math.floor(Math.random() * count);
			await options.nth(newRandomIndex).click();
			await page.locator("button", { hasText: "Create Box" }).click();
			await expect(page).toHaveURL(
				new RegExp(
					"^http://127.0.0.1:4000/admin/buy_in/product/[\\d]+\\?type=box&boxBarcode=[\\d]+$",
				),
			);
			await page.locator('input[name="boxBuyPrice"]').fill("10");
			await expect(page.locator('input[name="boxBuyPrice"]')).toHaveValue("10");
			const boxBuyPrice = parseFloat(
				await page.locator('input[name="boxBuyPrice"]').inputValue(),
			);
			const baseBuyPrice = (boxBuyPrice / itemsPerBox).toFixed(2);
			await expect(page.locator('input[name="buyPrice"]')).toHaveValue(
				baseBuyPrice,
			);
			const marginNote = page.locator("text=Default margin");
			await expect(marginNote).toBeVisible();
			const marginText = await marginNote.textContent();
			const marginPercent = parseFloat(marginText!.match(/([\d.]+)%/)![1]);
			const expectedSellPrice = (
				parseFloat(baseBuyPrice) *
				(1 + marginPercent / 100)
			).toFixed(2);
			await expect(page.locator('input[name="sellPrice"]')).toHaveValue(
				expectedSellPrice,
			);
			await page.locator("button", { hasText: "Confirm Buy-In (Box)" }).click();
			await expect(page).toHaveURL("http://127.0.0.1:4000/admin/buy_in");
		});

		test("Input unknown barcode, select box, create new product, and finish buy-in", async ({
			page,
		}) => {
			const randomBarcode = await getRandomBarcode();
			const randomProductName = await getRandomName();
			await page.getByLabel("Enter barcode").fill(randomBarcode);
			await page.getByRole("button", { name: /buy in/i }).click();
			await expect(page).toHaveURL(
				new RegExp(`^http://127.0.0.1:4000/admin/new/${randomBarcode}`),
			);
			await page.locator("#create-box").click();
			await expect(page).toHaveURL(
				new RegExp(`^http://127.0.0.1:4000/admin/new/${randomBarcode}/new-box`),
			);
			await page.locator('input[name="itemsPerBox"]').fill("10");
			await expect(page.locator('input[name="itemsPerBox"]')).toHaveValue("10");
			const itemsPerBox = parseFloat(
				await page.locator('input[name="itemsPerBox"]').inputValue(),
			);
			await page
				.locator("button", { hasText: "Product not found? Add new product." })
				.click();
			await expect(page).toHaveURL(
				new RegExp(
					"^http://127.0.0.1:4000/admin/new/product\\?boxBarcode=\\d+&itemsPerBox=\\d+$",
				),
			);
			await page.locator("button svg.lucide-dice5").click();
			await expect(page.locator('input[name="barcode"]')).not.toHaveValue("");
			await page.locator('input[name="name"]').fill(randomProductName);
			await expect(page.locator('input[name="name"]')).toHaveValue(
				randomProductName,
			);
			await page.locator("button#productSubmit").click();
			await expect(page).toHaveURL(
				new RegExp(
					"^http://127.0.0.1:4000/admin/buy_in/product/\\d+\\?type=box&boxBarcode=\\d+$",
				),
			);
			await page.locator('input[name="boxBuyPrice"]').fill("10");
			await expect(page.locator('input[name="boxBuyPrice"]')).toHaveValue("10");
			const boxBuyPrice = parseFloat(
				await page.locator('input[name="boxBuyPrice"]').inputValue(),
			);
			const baseBuyPrice = (boxBuyPrice / itemsPerBox).toFixed(2);
			await expect(page.locator('input[name="buyPrice"]')).toHaveValue(
				baseBuyPrice,
			);
			const marginNote = page.locator("text=Default margin");
			await expect(marginNote).toBeVisible();
			const marginText = await marginNote.textContent();
			const marginPercent = parseFloat(marginText!.match(/([\d.]+)%/)![1]);
			const expectedSellPrice = (
				parseFloat(baseBuyPrice) *
				(1 + marginPercent / 100)
			).toFixed(2);
			await expect(page.locator('input[name="sellPrice"]')).toHaveValue(
				expectedSellPrice,
			);
			await page.locator("button", { hasText: "Confirm Buy-In (Box)" }).click();
			await expect(page).toHaveURL("http://127.0.0.1:4000/admin/buy_in");
		});

		test("Cancel button on /admin/new/:barcode returns to /admin/buy_in", async ({
			page,
		}) => {
			const randomBarcode = await getRandomBarcode();
			await page.getByLabel("Enter barcode").fill(randomBarcode);
			await page.getByRole("button", { name: /buy in/i }).click();
			await expect(page).toHaveURL(
				new RegExp(`^http://127.0.0.1:4000/admin/new/${randomBarcode}`),
			);
			await page.locator("#cancel").click();
			await expect(page).toHaveURL("http://127.0.0.1:4000/admin/buy_in");
		});

		test("Restock one new product using a known barcode", async ({ page }) => {
			const randomBarcode = globalBarcodes.randomBarcode;
			await page.getByLabel("Enter barcode").fill(randomBarcode);
			await page.getByRole("button", { name: /buy in/i }).click();
			await expect(page).toHaveURL(
				new RegExp(
					`^http://127.0.0.1:4000/admin/buy_in/product/${randomBarcode}`,
				),
			);
			const quantityField = page.locator('input[name="count"]');
			await quantityField.waitFor({ state: "visible" });
			await expect(quantityField).toHaveValue("1");
			await page
				.locator("button", { hasText: "Confirm Buy-In (Product)" })
				.click();
			await expect(page).toHaveURL("http://127.0.0.1:4000/admin/buy_in");
		});

		test("Restock one new box using a known barcode", async ({ page }) => {
			const boxBarcode = globalBarcodes.boxBarcode;
			await page.getByLabel("Enter barcode").fill(boxBarcode);
			await page.getByRole("button", { name: /buy in/i }).click();
			await expect(page).toHaveURL(
				new RegExp(
					`^http://127.0.0.1:4000/admin/buy_in/product/${boxBarcode}$`,
				),
			);
			const boxCountField = page.locator('input[name="boxCount"]');
			await boxCountField.waitFor({ state: "visible" });
			await expect(boxCountField).toHaveValue("1");
			await page.locator("button", { hasText: "Confirm Buy-In (Box)" }).click();
			await expect(page).toHaveURL("http://127.0.0.1:4000/admin/buy_in");
		});
	});
