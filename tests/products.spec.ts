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

test.describe.serial("CRUD", () => {
  test("User can add a product", async ({ page }) => {
    await page.goto("/admin/new/product");

    await page.getByPlaceholder("Barcode").fill(randomBarcode);
    await page.getByPlaceholder("Barcode").press("Enter");
    await page.getByPlaceholder("Name").fill(randomName);
    await page.getByText("Select category").click();
    await page.getByLabel("Food, other").click();
    await page.getByRole("button", { name: "Create Product" }).click();

    await page.waitForURL(`/admin/products/${randomBarcode}`);

    await expect(page.locator("h1").filter({ hasText: randomName })).toBeVisible();
    await expect(page.locator("#category")).toHaveText("Food, other (meat pies etc.)");
    await expect(page.getByLabel("Barcode")).toHaveText(randomBarcode);
  });

  test("User can view a product", async ({ page }) => {
    await page.goto(`/admin/products/${randomBarcode}`);

    await expect(page.locator("h1").filter({ hasText: randomName })).toBeVisible();
    await expect(page.locator("#category")).toHaveText("Food, other (meat pies etc.)");
    await expect(page.getByLabel("Barcode")).toHaveText(randomBarcode);
  });

  test("User can edit a product", async ({ page }) => {
    await page.goto(`/admin/products/${randomBarcode}`);

    await page.getByRole("link", { name: "Edit Product Details", exact: true }).click();
    await page.locator("#name").click();
    await page.locator("#name").fill(randomRename);
    await page.locator("#categoryId").click();
    await page.getByLabel("Sweets, chocolate").click();
    await page.getByPlaceholder("Sell Price").click();
    await page.getByPlaceholder("Sell Price").fill("3");
    await page.getByRole("button", { name: "Update Product" }).click();

    await page.waitForURL(`/admin/products/${randomBarcode}`);

    await expect(page.locator("h1").filter({ hasText: randomRename })).toBeVisible();
    await expect(page.getByText("Sweets, chocolate")).toBeVisible();
    await expect(page.locator("h3").filter({ hasText: randomRename })).toBeVisible();
  });

  test("User can edit buyPrice and sellPrice of a product", async ({ page }) => {
    const randomBuyPrice = (Math.random() * (1000 - 1) + 1).toFixed(5);
    const randomSellPrice = (Math.random() * (1000 - 1) + 1).toFixed(5);

    const roundedBuyPrice = Math.floor(parseFloat(randomBuyPrice) * 100) / 100;
    const roundedSellPrice = Math.floor(parseFloat(randomSellPrice) * 100) / 100;

    await page.goto(`/admin/products/${randomBarcode}`);
    await page.getByRole("link", { name: "Edit Product Details", exact: true }).click();

    await page.getByPlaceholder("Buy Price").click();
    await page.getByPlaceholder("Buy Price").fill(roundedBuyPrice.toString());
    await page.getByPlaceholder("Sell Price").click();
    await page.getByPlaceholder("Sell Price").fill(roundedSellPrice.toString());

    await page.getByRole("button", { name: "Update Product" }).click();
    await page.waitForURL(`/admin/products/${randomBarcode}`);

    await expect(page.locator("#buyPrice")).toHaveText(`${roundedBuyPrice.toFixed(2).replace('.', ',')} €`);
    await expect(page.locator("#sellPrice")).toHaveText(`${roundedSellPrice.toFixed(2).replace('.', ',')} €`);
  });
});

test.describe.serial("Filtering and Sorting", () => {

  test.beforeEach(async ({ page }) => {
    await page.goto("/admin/products");
  });

  test("User can sort products by price (Low to High)", async ({ page }) => {
    await page.locator("#low_to_high").click();
  
    const prices = await page.$$eval(".product-price", (elements) =>
      elements.map(el => parseFloat(el.textContent!.replace("€", "").trim()))
    );
  
    expect(prices).toEqual([...prices].sort((a, b) => a - b));
  });
  
  test("User can sort products by price (High to Low)", async ({ page }) => {
    await page.locator("#high_to_low").click();
  
    const prices = await page.$$eval(".product-price", (elements) =>
      elements.map(el => parseFloat(el.textContent!.replace("€", "").trim()))
    );
  
    expect(prices).toEqual([...prices].sort((a, b) => b - a));
  });
  
  test("User can sort products by quantity (Low to High)", async ({ page }) => {
    await page.locator("#low_to_high_quantity").click();
  
    const quantities = await page.$$eval(".product-quantity", (elements) =>
      elements.map(el => parseInt(el.textContent!.trim(), 10))
    );
  
    expect(quantities).toEqual([...quantities].sort((a, b) => a - b));
  });
  
  test("User can sort products by quantity (High to Low)", async ({ page }) => {
    await page.locator("#high_to_low_quantity").click();
  
    const quantities = await page.$$eval(".product-quantity", (elements) =>
      elements.map(el => parseInt(el.textContent!.trim(), 10))
    );
  
    expect(quantities).toEqual([...quantities].sort((a, b) => b - a));
  });

  test("User can filter products by stock (In Stock)", async ({ page }) => {
    await page.getByLabel("Show in stock only").click();

    const stocks = await page.$$eval(".product-quantity", (elements) =>
      elements.map(el => parseInt(el.textContent!.trim(), 10))
    );

    expect(stocks.every(stock => stock > 0)).toBeTruthy();
  });

  test("User can filter products by stock (Out of Stock)", async ({ page }) => {
    await page.getByLabel("Show out of stock only").click();

    const stocks = await page.$$eval(".product-quantity", (elements) =>
      elements.map(el => parseInt(el.textContent!.trim(), 10))
    );

    expect(stocks.every(stock => stock === 0)).toBeTruthy();
  });

  test("User can filter products by quantity (<10)", async ({ page }) => {
    await page.getByLabel("< 10").click();

    const stocks = await page.$$eval(".product-quantity", (elements) =>
      elements.map(el => parseInt(el.textContent!.trim(), 10))
    );

    expect(stocks.every(stock => stock < 10)).toBeTruthy();
  });

  test("User can filter products by quantity (10-50)", async ({ page }) => {
    await page.getByLabel("10 - 50").click();

    const stocks = await page.$$eval(".product-quantity", (elements) =>
      elements.map(el => parseInt(el.textContent!.trim(), 10))
    );

    expect(stocks.every(stock => stock >= 10 && stock <= 50)).toBeTruthy();
  });

  test("User can filter products by quantity (>50)", async ({ page }) => {
    await page.getByLabel("> 50").click();

    const stocks = await page.$$eval(".product-quantity", (elements) =>
      elements.map(el => parseInt(el.textContent!.trim(), 10))
    );

    expect(stocks.every(stock => stock > 50)).toBeTruthy();
  });

    test("User can filter by (In Stock) and sort by price (Low to High)", async ({ page }) => {
      await page.getByLabel("Show in stock only").click();
      await page.locator("#low_to_high").click();
  
      const stocks = await page.$$eval(".product-quantity", (elements) =>
        elements.map(el => parseInt(el.textContent!.trim(), 10))
      );
      
      const prices = await page.$$eval(".product-price", (elements) =>
        elements.map(el => parseFloat(el.textContent!.replace("€", "").trim()))
      );
  
      expect(stocks.every(stock => stock > 0)).toBeTruthy(); 
      expect(prices).toEqual([...prices].sort((a, b) => a - b));
    });
  
    test("User can filter by quantity (>50) and sort by quantity (High to Low)", async ({ page }) => {
      await page.getByLabel("> 50").click();
      await page.locator("#high_to_low_quantity").click();
  
      const quantities = await page.$$eval(".product-quantity", (elements) =>
        elements.map(el => parseInt(el.textContent!.trim(), 10))
      );
  
      expect(quantities.every(q => q > 50)).toBeTruthy(); 
      expect(quantities).toEqual([...quantities].sort((a, b) => b - a));
    });
  
    test("User can filter by price (<10) & (Out of Stock) and sort by price (High to Low)", async ({ page }) => {
      await page.getByLabel("Show out of stock only").click();
      await page.getByLabel("< 10").click();
      await page.locator("#high_to_low").click();
  
      const stocks = await page.$$eval(".product-quantity", (elements) =>
        elements.map(el => parseInt(el.textContent!.trim(), 10))
      );
  
      const prices = await page.$$eval(".product-price", (elements) =>
        elements.map(el => parseFloat(el.textContent!.replace("€", "").trim()))
      );
  
      expect(stocks.every(stock => stock === 0)).toBeTruthy(); 
      expect(prices.every(price => price < 10)).toBeTruthy(); 
      expect(prices).toEqual([...prices].sort((a, b) => b - a)
   }); 

  test("User can edit buyPrice and sellPrice of a product", async ({ page }) => {
    const randomBuyPrice = (Math.random() * (1000 - 1) + 1).toFixed(5);
    const randomSellPrice = (Math.random() * (1000 - 1) + 1).toFixed(5);
  
    const roundedBuyPrice = Math.floor(parseFloat(randomBuyPrice) * 100) / 100;
    const roundedSellPrice = Math.floor(parseFloat(randomSellPrice) * 100) / 100;
  
    await page.goto(`/admin/products/${randomBarcode}`);
    await page.getByRole("link", { name: "Edit Product Details", exact: true }).click();
  
    await page.getByPlaceholder("Buy Price").click();
    await page.getByPlaceholder("Buy Price").fill(roundedBuyPrice.toString());
    await page.getByPlaceholder("Sell Price").click();
    await page.getByPlaceholder("Sell Price").fill(roundedSellPrice.toString());
  
    await page.getByRole("button", { name: "Update Product" }).click();
    await page.waitForURL(`/admin/products/${randomBarcode}`);
  
    await expect(page.locator("#buyPrice")).toHaveText(`${roundedBuyPrice.toFixed(2).replace('.', ',')} €`);
    await expect(page.locator("#sellPrice")).toHaveText(`${roundedSellPrice.toFixed(2).replace('.', ',')} €`);
  });
});
