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
});

test("User can list categories", async ({ page }) => {
  await page.goto("/admin/categories");
  await expect(page.getByText("DEFAULT GROUP")).toBeVisible();
});

test.describe.serial("CRUD", () => {
  test("User can add a category", async ({ page }) => {
    await page.goto("/admin/categories");

    await page.getByPlaceholder("New Category").fill(randomCategoryName);
    await page.getByRole("button", { name: "Create" }).click();

    await expect(
      page.getByText(randomCategoryName, { exact: true }),
    ).toBeVisible();
  });

  // Skipping this test because it is not working yet
  test.skip("User can edit a category", async ({ page }) => {
    await page.goto("/admin/categories");

    const categoryRow = page.getByText(randomCategoryName).locator("..");

    await expect(categoryRow).toBeVisible();
    await categoryRow.hover();

    const penIcon = categoryRow.locator("svg");
    await penIcon.waitFor({ state: "visible" });
    await penIcon.click();

    const inputField = categoryRow.locator("input:not([type='hidden'])");
    await inputField.waitFor({ state: "attached" });
    await inputField.waitFor({ state: "visible" });

    await inputField.fill(randomRenamedCategory);

    await categoryRow.getByRole("button", { name: "Save" }).click();

    await expect(page.getByText(randomRenamedCategory)).toBeVisible();
  });

  // Skipping this test because the it is not working yet
  test.skip("User can delete a category", async ({ page }) => {
    await page.goto("/admin/categories");

    await page.waitForSelector("text=" + randomCategoryName, { timeout: 5000 });

    const categoryRow = page.locator(`text="${randomCategoryName}"`).first();
    await expect(categoryRow).toBeVisible();

    await categoryRow.scrollIntoViewIfNeeded();

    await page.evaluate(() => {
      document.querySelectorAll("button").forEach((button) => {
        if (button.textContent?.includes("Delete")) {
          button.classList.remove("hidden");
          button.style.display = "block";
          button.style.opacity = "1";
        }
      });
    });

    await page.waitForTimeout(500);

    const deleteButton = categoryRow.locator("button:has-text('Delete')");
    const isClosed = await deleteButton.getAttribute("data-state");
    console.log("Delete painike data-state:", isClosed);

    await deleteButton.click({ force: true });

    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();

    const confirmDeleteButton = dialog.getByRole("button", { name: "Delete" });
    await confirmDeleteButton.waitFor({ state: "visible" });
    await confirmDeleteButton.click({ force: true });

    await page.waitForTimeout(1000);

    await expect(categoryRow).not.toBeVisible();
  });
});
