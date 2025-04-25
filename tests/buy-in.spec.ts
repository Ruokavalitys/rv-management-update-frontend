import { expect, test } from "@playwright/test";
import { login } from "./fixtures/login";
import { getRandomBarcode, getRandomName } from "./utils/random";

declare module "@playwright/test" {
	interface TestInfo {
		data: { randomBarcode: string; randomProductName: string };
	}
}

test.beforeEach(async ({ page }, testInfo) => {
	const randomBarcode = await getRandomBarcode();
	const randomProductName = await getRandomName();
	testInfo.data = { randomBarcode, randomProductName };
	await login(page);
	await page.goto("/admin/buy_in");
});

test("Input unknown barcode, select product, attach a box and finish buy-in", async ({
	page,
}, testInfo) => {
	const { randomBarcode, randomProductName } = testInfo.data;

	await page.getByLabel("Enter barcode").fill(randomBarcode);
	await page.getByRole("button", { name: /buy in/i }).click();
	await expect(page).toHaveURL(`/admin/new/${randomBarcode}`);
	await page.locator("#create-product").click();
	await expect(page).toHaveURL(
		new RegExp(
			`^http://127.0.0.1:4000/admin/new/product\\?barcode=${randomBarcode}`,
		),
	);
	const productNameInput = page.locator('input[name="name"]');
	await productNameInput.fill(randomProductName);
	await expect(productNameInput).toHaveValue(randomProductName);
	const createProductButton = page.locator("#productSubmit");
	await createProductButton.click();
	await expect(page).toHaveURL(
		new RegExp(`^http://127.0.0.1:4000/admin/new/${randomBarcode}/box-prompt`),
	);
	const attachBoxButton = page.locator("button", { hasText: "Attach Box" });
	await attachBoxButton.click();
	await expect(page).toHaveURL(
		new RegExp(`^http://127.0.0.1:4000/admin/new/${randomBarcode}/box-prompt`),
	);
	const randomizeBoxButton = page.locator("button svg.lucide-dice5");
	await randomizeBoxButton.click();
	const boxBarcodeInput = page.locator('input[name="boxBarcode"]');
	await expect(boxBarcodeInput).not.toHaveValue("");
	const itemsPerBoxInput = page.locator('input[name="itemsPerBox"]');
	await itemsPerBoxInput.fill("7");
	await expect(itemsPerBoxInput).toHaveValue("7");
	await page
		.locator('button[type="submit"]', {
			hasText: "Attach Box",
		})
		.click();
	await expect(page).toHaveURL(
		new RegExp(`^http://127.0.0.1:4000/admin/buy_in/product/${randomBarcode}`),
	);
	const quantityField = page.locator('input[name="count"]');
	await quantityField.waitFor({ state: "visible" });
	await expect(quantityField).toHaveValue("1");
	const adjustBuyPriceField = page.locator('input[name="buyPrice"]');
	await adjustBuyPriceField.waitFor({ state: "visible" });
	await adjustBuyPriceField.fill("1");
	await expect(adjustBuyPriceField).toHaveValue("1");
	const marginNote = page.locator("text=Default margin");
	await expect(marginNote).toBeVisible();
	const marginText = await marginNote.textContent();
	const marginMatch = marginText?.match(/([\d.]+)%/);
	const marginPercent = marginMatch ? parseFloat(marginMatch[1]) : null;
	const expectedSellPrice = (1 * (1 + marginPercent! / 100)).toFixed(2);
	const adjustSellPriceField = page.locator('input[name="sellPrice"]');
	await expect(adjustSellPriceField).toHaveValue(expectedSellPrice);
	const confirmBuyInButton = page.locator("button", {
		hasText: "Confirm Buy-In (Product)",
	});
	await confirmBuyInButton.click();
	await expect(page).toHaveURL("http://127.0.0.1:4000/admin/buy_in");
});

test("Input unknown barcode, select product and finish buy-in without attaching a box", async ({
	page,
}, testInfo) => {
	const { randomBarcode, randomProductName } = testInfo.data;

	await page.getByLabel("Enter barcode").fill(randomBarcode);
	await page.getByRole("button", { name: /buy in/i }).click();
	await expect(page).toHaveURL(`/admin/new/${randomBarcode}`);
	await page.locator("#create-product").click();
	await expect(page).toHaveURL(
		new RegExp(
			`^http://127.0.0.1:4000/admin/new/product\\?barcode=${randomBarcode}`,
		),
	);
	const productNameInput = page.locator('input[name="name"]');
	await productNameInput.fill(randomProductName);
	await expect(productNameInput).toHaveValue(randomProductName);
	const createProductButton = page.locator("#productSubmit");
	await createProductButton.click();
	await expect(page).toHaveURL(
		new RegExp(`^http://127.0.0.1:4000/admin/new/${randomBarcode}/box-prompt`),
	);
	const noBoxButton = page.locator("button", { hasText: "No Box" });
	await noBoxButton.click();
	await expect(page).toHaveURL(
		new RegExp(`^http://127.0.0.1:4000/admin/buy_in/product/${randomBarcode}`),
	);
	const quantityField = page.locator('input[name="count"]');
	await quantityField.waitFor({ state: "visible" });
	await expect(quantityField).toHaveValue("1");
	const adjustBuyPriceField = page.locator('input[name="buyPrice"]');
	await adjustBuyPriceField.waitFor({ state: "visible" });
	await adjustBuyPriceField.fill("1");
	await expect(adjustBuyPriceField).toHaveValue("1");
	const marginNote = page.locator("text=Default margin");
	await expect(marginNote).toBeVisible();
	const marginText = await marginNote.textContent();
	const marginMatch = marginText?.match(/([\d.]+)%/);
	const marginPercent = marginMatch ? parseFloat(marginMatch[1]) : null;
	const expectedSellPrice = (1 * (1 + marginPercent! / 100)).toFixed(2);
	const adjustSellPriceField = page.locator('input[name="sellPrice"]');
	await expect(adjustSellPriceField).toHaveValue(expectedSellPrice);
	const confirmBuyInButton = page.locator("button", {
		hasText: "Confirm Buy-In (Product)",
	});
	await confirmBuyInButton.click();
	await expect(page).toHaveURL("http://127.0.0.1:4000/admin/buy_in");
});

test("Input unknown barcode, select box, attach product, test dropdown cancel button, attach product again and finish buy-in", async ({
	page,
}, testInfo) => {
	const { randomBarcode } = testInfo.data;

	await page.getByLabel("Enter barcode").fill(randomBarcode);
	await page.getByRole("button", { name: /buy in/i }).click();
	await expect(page).toHaveURL(`/admin/new/${randomBarcode}`);
	await page.locator("#create-box").click();
	await expect(page).toHaveURL(
		new RegExp(`^http://127.0.0.1:4000/admin/new/${randomBarcode}/new-box`),
	);
	const itemsPerBoxInput = page.locator('input[name="itemsPerBox"]');
	await itemsPerBoxInput.fill("10");
	await expect(itemsPerBoxInput).toHaveValue("10");
	const itemsPerBox = parseFloat(await itemsPerBoxInput.inputValue());
	const productButton = page.locator("button#product");
	await productButton.click();
	const options = page.locator('[role="option"]');
	const count = await options.count();
	const randomIndex = Math.floor(Math.random() * count);
	await options.nth(randomIndex).click();
	const cancelButton = page.locator("svg.lucide-x");
	await cancelButton.click();
	await productButton.click();
	const newRandomIndex = Math.floor(Math.random() * count);
	await options.nth(newRandomIndex).click();
	const createBoxButton = page.locator("button", { hasText: "Create Box" });
	await createBoxButton.click();
	await expect(page).toHaveURL(
		new RegExp(
			"^http://127.0.0.1:4000/admin/buy_in/product/[\\d]+\\?type=box&boxBarcode=[\\d]+$",
		),
	);
	const boxBuyPriceField = page.locator('input[name="boxBuyPrice"]');
	await boxBuyPriceField.fill("10");
	await expect(boxBuyPriceField).toHaveValue("10");
	const boxBuyPrice = parseFloat(await boxBuyPriceField.inputValue());
	const baseBuyPrice = boxBuyPrice / itemsPerBox;
	const adjustBuyPriceField = page.locator('input[name="buyPrice"]');
	await adjustBuyPriceField.waitFor({ state: "visible" });
	await expect(adjustBuyPriceField).toHaveValue(baseBuyPrice.toFixed(2));
	const marginNote = page.locator("text=Default margin");
	await expect(marginNote).toBeVisible();
	const marginText = await marginNote.textContent();
	const marginMatch = marginText?.match(/([\d.]+)%/);
	const marginPercent = marginMatch ? parseFloat(marginMatch[1]) : null;
	const expectedSellPrice = (baseBuyPrice * (1 + marginPercent! / 100)).toFixed(
		2,
	);
	const adjustSellPriceField = page.locator('input[name="sellPrice"]');
	await expect(adjustSellPriceField).toHaveValue(expectedSellPrice);
	const confirmBuyInButton = page.locator("button", {
		hasText: "Confirm Buy-In (Box)",
	});
	await confirmBuyInButton.click();
	await expect(page).toHaveURL("http://127.0.0.1:4000/admin/buy_in");
});

test("Input unknown barcode, select box, create new product, and finish buy-in", async ({
	page,
}, testInfo) => {
	const { randomBarcode, randomProductName } = testInfo.data;

	await page.getByLabel("Enter barcode").fill(randomBarcode);
	await page.getByRole("button", { name: /buy in/i }).click();
	await expect(page).toHaveURL(`/admin/new/${randomBarcode}`);
	await page.locator("#create-box").click();
	await expect(page).toHaveURL(
		new RegExp(`^http://127.0.0.1:4000/admin/new/${randomBarcode}/new-box`),
	);
	const itemsPerBoxInput = page.locator('input[name="itemsPerBox"]');
	await itemsPerBoxInput.fill("10");
	await expect(itemsPerBoxInput).toHaveValue("10");
	const itemsPerBox = parseFloat(await itemsPerBoxInput.inputValue());
	const addNewProductButton = page.locator("button", {
		hasText: "Product not found? Add new product.",
	});
	await addNewProductButton.click();
	await expect(page).toHaveURL(
		new RegExp(
			"^http://127.0.0.1:4000/admin/new/product\\?boxBarcode=\\d+&itemsPerBox=\\d+$",
		),
	);
	const randomizeBoxButton = page.locator("button svg.lucide-dice5");
	await randomizeBoxButton.click();
	const boxBarcodeInput = page.locator('input[name="barcode"]');
	await expect(boxBarcodeInput).not.toHaveValue("");
	const productNameInput = page.locator('input[name="name"]');
	await productNameInput.fill(randomProductName);
	await expect(productNameInput).toHaveValue(randomProductName);
	const createProductButton = page.locator("button#productSubmit");
	await createProductButton.click();
	await expect(page).toHaveURL(
		new RegExp(
			"^http://127.0.0.1:4000/admin/buy_in/product/\\d+\\?type=box&boxBarcode=\\d+$",
		),
	);
	const boxBuyPriceField = page.locator('input[name="boxBuyPrice"]');
	await boxBuyPriceField.fill("10");
	await expect(boxBuyPriceField).toHaveValue("10");
	const boxBuyPrice = parseFloat(await boxBuyPriceField.inputValue());
	const baseBuyPrice = boxBuyPrice / itemsPerBox;
	const adjustBuyPriceField = page.locator('input[name="buyPrice"]');
	await adjustBuyPriceField.waitFor({ state: "visible" });
	await expect(adjustBuyPriceField).toHaveValue(baseBuyPrice.toFixed(2));
	const marginNote = page.locator("text=Default margin");
	await expect(marginNote).toBeVisible();
	const marginText = await marginNote.textContent();
	const marginMatch = marginText?.match(/([\d.]+)%/);
	const marginPercent = marginMatch ? parseFloat(marginMatch[1]) : null;
	const expectedSellPrice = (baseBuyPrice * (1 + marginPercent! / 100)).toFixed(
		2,
	);
	const adjustSellPriceField = page.locator('input[name="sellPrice"]');
	await expect(adjustSellPriceField).toHaveValue(expectedSellPrice);
	const confirmBuyInButton = page.locator("button", {
		hasText: "Confirm Buy-In (Box)",
	});
	await confirmBuyInButton.click();
	await expect(page).toHaveURL("http://127.0.0.1:4000/admin/buy_in");
});

test("Cancel button on /admin/new/:barcode returns to /admin/buy_in", async ({
	page,
}, testInfo) => {
	const { randomBarcode } = testInfo.data;

	await page.getByLabel("Enter barcode").fill(randomBarcode);
	await page.getByRole("button", { name: /buy in/i }).click();
	await expect(page).toHaveURL(`/admin/new/${randomBarcode}`);
	await page.locator("#cancel").click();
	await expect(page).toHaveURL("http://127.0.0.1:4000/admin/buy_in");
});
