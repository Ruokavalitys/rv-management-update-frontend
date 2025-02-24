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

  test("User can edit a product", async ({ page }) => {
    await page.goto(`/admin/products/${randomBarcode}`);
    await page.locator('a[href*="/admin/products/"][href$="/edit"]').click();
    await page.locator("#name").click();
    await page.locator("#name").fill(randomRename);
    await page.locator("#categoryId").click();
    await page.getByLabel("Sweets, chocolate").click();
    await page.getByPlaceholder("Sell Price").click();
    await page.getByPlaceholder("Sell Price").fill("3");
    await page.getByRole("button", { name: "Update Product" }).click();

    await page.waitForURL(`/admin/products/${randomBarcode}`);

    await expect(
      page.locator("h1").filter({ hasText: randomRename }),
    ).toBeVisible();
    await expect(page.getByText("Sweets, chocolate")).toBeVisible();
    await expect(
      page.locator("h3").filter({ hasText: randomRename }),
    ).toBeVisible();
  });

  // Deletion is disabled in the backend, so this test is skipped
  test.skip("User can delete a product", async ({ page }) => {
    await page.goto(`/admin/products/${randomBarcode}`);

    await page.getByRole("button", { name: "Delete" }).click();
    await page.getByRole("button", { name: "Delete" }).click();
    await page.waitForURL("/admin/products");

    await expect(
      page.locator("h1").filter({ hasText: "Products" }),
    ).toBeVisible();
    await expect(
      page.locator("h3").filter({ hasText: randomRename }),
    ).not.toBeVisible();
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