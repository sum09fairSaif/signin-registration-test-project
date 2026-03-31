import { test, expect } from "@playwright/test";

test("redirects unauthenticated users from dashboard to login", async ({
  page,
}) => {
  await page.goto("/dashboard");
  await expect(page).toHaveURL(/\/login/);
  await expect(page.getByRole("heading", { name: "Login" })).toBeVisible();
});
