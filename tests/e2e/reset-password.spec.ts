import { test, expect } from "@playwright/test";

test("shows a confirmation message after requesting a password reset link", async ({
  page,
}) => {
  await page.goto("/forgot-password");

  await page.getByPlaceholder("Email").fill("nobody@example.com");
  await page.getByRole("button", { name: "Send Reset Link" }).click({
    force: true,
  });

  await expect(
    page.getByText("If an account exists, a reset link has been sent.")
  ).toBeVisible();
  await expect(page.getByPlaceholder("Email")).toHaveValue("");
});
