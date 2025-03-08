import { expect, test } from "@playwright/test";
import { login } from "./fixtures/login";
import { getRandomBarcode, getRandomName } from "./utils/random";

let randomBarcode: string;
let randomCategoryName: string;
let randomName: string;

test.beforeAll(async () => {
  randomBarcode = await getRandomBarcode();
  randomCategoryName = await getRandomName();
  randomName = await getRandomName();
});

test.beforeEach(async ({ page }) => {
  await login(page);
  await page.goto("/admin/categories");
});

test("User can list categories", async ({ page }) => {
  await expect(page.getByText("DEFAULT GROUP")).toBeVisible();
});

test.describe.serial("CRUD", () => {
  test("User can add a category", async ({ page }) => {
    await page.getByPlaceholder("New Category").fill(randomCategoryName);
    await page.getByRole("button", { name: "Create" }).click();

    await expect(
      page.getByText(randomCategoryName, { exact: true }),
    ).toBeVisible();
  });

  test("user can delete a category", async ({ page }) => {
    const categoryRow = page
      .locator("form")
      .filter({ hasText: randomCategoryName })
      .first();
    await expect(categoryRow).toBeVisible();

    await categoryRow.hover();

    const deleteButton = categoryRow.locator('button:has-text("Delete")');
    await deleteButton.waitFor({ state: "visible" });
    await deleteButton.click();

    const confirmDeleteButton = page
      .locator('button:has-text("Delete")')
      .last();
    await confirmDeleteButton.waitFor({ state: "visible" });
    await confirmDeleteButton.click();

    await expect(categoryRow).not.toBeVisible();
  });

  test("When user deletes a category the product moves to default category", async ({
    page,
  }) => {
    const TestcategoryName = "This category will be deleted";
    await page.fill('input[placeholder="New Category"]', TestcategoryName);

    await page.click('button:has-text("Create")');

    const toast = page.locator(
      'span[role="status"]:has-text(\'Category "This category will be deleted" has been created\')',
    );
    await toast.waitFor({ state: "visible" });

    await expect(toast).toContainText(
      `Category "${TestcategoryName}" has been created`,
    );

    await page.goto("/admin/new/product");

    await page.getByPlaceholder("Barcode").fill(randomBarcode);
    await page.getByPlaceholder("Barcode").press("Enter");
    await page.getByPlaceholder("Name").fill(randomName);
    await page.getByText("Select category").click();
    await page.getByLabel(TestcategoryName).click();
    await page.getByRole("button", { name: "Create Product" }).click();

    await page.waitForURL(`/admin/products/${randomBarcode}`);

    await expect(
      page.locator("h1").filter({ hasText: randomName }),
    ).toBeVisible();
    await expect(page.locator("#category")).toHaveText(TestcategoryName);
    await expect(page.getByLabel("Barcode")).toHaveText(randomBarcode);

    await page.goto("/admin/categories");

    const categoryRow = page
      .locator("form")
      .filter({ hasText: TestcategoryName })
      .first();
    await expect(categoryRow).toBeVisible();

    await categoryRow.hover();

    const deleteButton = categoryRow.locator('button:has-text("Delete")');
    await deleteButton.waitFor({ state: "visible" });
    await deleteButton.click();

    const confirmDeleteButton = page
      .locator('button:has-text("Delete")')
      .last();
    await confirmDeleteButton.waitFor({ state: "visible" });
    await confirmDeleteButton.click();

    await expect(categoryRow).not.toBeVisible();

    const toaster = page.locator(
      "span[role=\"status\"]:has-text('Moved 1 products to the default category')",
    );
    await toaster.waitFor({ state: "visible" });

    await expect(toaster).toContainText(`Category deleted`);

    await page.goto(`/admin/products/${randomBarcode}`);
    await expect(page.locator("#category")).toHaveText(
      "DEFAULT GROUP, NO DEFINITION",
    );
  });
  test("Category product count updates correctly", async ({ page }) => {
    await page.getByPlaceholder("New Category").fill(randomCategoryName);
    await page.getByRole("button", { name: "Create" }).click();
    await expect(
      page.getByText(randomCategoryName, { exact: true }),
    ).toBeVisible();

    const categoryRow = page
      .locator("form")
      .filter({ hasText: randomCategoryName })
      .first();
    const productCountLocator = categoryRow.locator("div").nth(1);

    const initialCount = await productCountLocator.innerText();
    const initialNumber = parseInt(initialCount) || 0;

    const newRandomBarcode = await getRandomBarcode();
    const newRandomName = await getRandomName();

    await page.goto("/admin/new/product");

    await page.getByPlaceholder("Barcode").fill(newRandomBarcode);
    await page.getByPlaceholder("Barcode").press("Enter");
    await page.getByPlaceholder("Name").fill(newRandomName);
    await page.getByText("Select category").click();
    await page.getByLabel(randomCategoryName).click();
    await page.getByRole("button", { name: "Create Product" }).click();

    await page.waitForURL(`/admin/products/${newRandomBarcode}`);

    await expect(page.locator("#category")).toHaveText(randomCategoryName);

    await page.goto("/admin/categories");

    const updatedCount = await productCountLocator.innerText();
    const updatedNumber = parseInt(updatedCount) || 0;

    expect(updatedNumber).toBe(initialNumber + 1);
  });
});
