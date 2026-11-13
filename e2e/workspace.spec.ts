import { expect, test } from "@playwright/test";

test("explores and resets a career scenario", async ({ page }) => {
  const runtimeErrors: string[] = [];
  page.on("pageerror", (error) => runtimeErrors.push(error.message));

  const response = await page.goto("/");

  expect(response?.headers()["x-content-type-options"]).toBe("nosniff");

  await expect(
    page.getByRole("heading", {
      name: "Build a credible path to your next role.",
    }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Scenarios", exact: true }),
  ).toBeVisible();

  const learningHours = page.getByRole("slider", {
    name: "Focused learning",
  });
  await learningHours.fill("20");
  await expect(page.locator("output[for='assumption-weeklyHours']")).toHaveText(
    "20h",
  );

  await page.getByRole("button", { name: "Reset" }).click();
  await expect(page.locator("output[for='assumption-weeklyHours']")).toHaveText(
    "12h",
  );

  const hasHorizontalOverflow = await page.evaluate(
    () => document.documentElement.scrollWidth > window.innerWidth,
  );
  expect(hasHorizontalOverflow).toBe(false);
  expect(runtimeErrors).toEqual([]);
});

test("creates and persists a scenario draft", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: "New scenario" }).click();

  await expect(page).toHaveURL(/\/scenarios\/new\?step=intent/);

  await page.getByLabel("Scenario name").fill("Berlin frontend path");
  await page
    .getByLabel("Target role")
    .fill("Product-focused Frontend Engineer");
  await page.getByLabel("Destination").fill("Berlin, Germany");
  await page.getByRole("button", { name: "Save draft" }).click();
  await expect(page.getByText("Draft saved on this device.")).toBeVisible();

  await page.reload();
  await expect(page.getByLabel("Scenario name")).toHaveValue(
    "Berlin frontend path",
  );

  await page.getByRole("button", { name: "Continue" }).click();
  await expect(page).toHaveURL(/\/scenarios\/new\?step=assumptions/);

  await page.getByLabel("Monthly learning budget").fill("220");
  await page.getByRole("button", { name: "Continue" }).click();
  await expect(page).toHaveURL(/\/scenarios\/new\?step=review/);

  await page.getByRole("button", { name: "Create scenario" }).click();
  await expect(
    page.getByRole("heading", { name: "Berlin frontend path" }),
  ).toBeVisible();

  await page.getByRole("link", { name: "Back to workspace" }).click();
  await expect(page).toHaveURL(/\/$/);
  await expect(
    page.getByLabel("Active scenario: Berlin frontend path"),
  ).toBeVisible();

  await page.goto("/scenarios");
  await expect(
    page.getByRole("heading", { name: "Compare the paths you could take." }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Active scenario" }),
  ).toBeDisabled();

  await page
    .getByRole("button", { name: "Remove Berlin frontend path" })
    .click();
  await page.getByRole("button", { name: "Remove permanently" }).click();
  await expect(
    page.getByRole("heading", { name: "No saved scenarios yet" }),
  ).toBeVisible();

  await page.getByRole("link", { name: "Compare" }).click();
  await expect(page).toHaveURL(/\/scenarios\/compare$/);
  await expect(
    page.getByRole("heading", { name: "Create a scenario before comparing" }),
  ).toBeVisible();
});
