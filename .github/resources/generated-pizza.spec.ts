import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://localhost:5173/bobs-react-app';

test('Scenario: Add pizza to cart', async ({ page }) => {
  await page.goto(BASE_URL);
  
  // When I click "Pizzas"
  await page.click('button:has-text("Pizzas")');
  
  // And I click "Add to Cart" on "Margherita"
  await page.locator('.grid > div:has-text("Margherita")').getByRole('button').click();
  
  // Then cart badge shows "1"
  await expect(page.locator('header button:has(span) span')).toHaveText('1');
});

test('Scenario: Open cart and view items', async ({ page }) => {
  await page.goto(BASE_URL);
  
  // Setup: add to cart first
  await page.click('button:has-text("Pizzas")');
  await page.locator('.grid > div:has-text("Margherita")').getByRole('button').click();
  
  // When I click "Cart"
  await page.click('button:has-text("Cart")');
  
  // Then cart drawer opens
  await expect(page.locator('h2:has-text("Your Cart")')).toBeVisible();
  
  // And I see "Margherita" in cart
  await expect(page.locator('.space-y-4')).toContainText('Margherita');
});

test('Scenario: Place order', async ({ page }) => {
  await page.goto(BASE_URL);
  
  // Setup: add to cart
  await page.click('button:has-text("Pizzas")');
  await page.locator('.grid > div:has-text("Margherita")').getByRole('button').click();
  
  // When I click "Cart"
  await page.click('button:has-text("Cart")');
  
  // And I click "Place Order"
  await page.click('button:has-text("Place Order")');
  
  // Then I am on the "Orders" page
  await expect(page.locator('h2:has-text("Your Orders")')).toBeVisible();
  
  // And I see the order in list
  await expect(page.locator('.space-y-4')).toContainText('Margherita');
});

test('Scenario: View orders list', async ({ page }) => {
  await page.goto(BASE_URL);
  
  // When I click "Orders"
  await page.click('button:has-text("Orders")');
  
  // Then I see all my orders
  await expect(page.locator('h2:has-text("Your Orders")')).toBeVisible();
  
  // And each order shows status (if orders exist)
  const orders = page.locator('.bg-white.rounded-lg');
  const count = await orders.count();
  if (count > 0) {
    await expect(orders.first()).toContainText('Order #');
  }
});
