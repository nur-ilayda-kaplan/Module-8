import { test, expect } from "@playwright/test";

test("example page opens", async ({ page }) => {
  await page.goto("https://example.com");
  await expect(page).toHaveTitle(/Example/);
});
