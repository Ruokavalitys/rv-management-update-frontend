import { expect, test } from "@playwright/test";
import { login } from "./fixtures/login";
import { getRandomName } from "./utils/random";

let randomCategoryName: string;
let randomRenamedCategory: string;

test.beforeAll(async () => {
  randomCategoryName = await getRandomName();
  randomRenamedCategory = await getRandomName();
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

  test.skip("user can edit a category", async ({ page }) => {
    const categoryRow = page
      .locator("form")
      .filter({ hasText: randomCategoryName })
      .first();
    await expect(categoryRow).toBeVisible();
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
});
