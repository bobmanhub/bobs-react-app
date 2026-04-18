# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: .github/resources/generated-pizza.spec.ts >> Scenario: View orders list
- Location: .github/resources/generated-pizza.spec.ts:67:1

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: page.click: Test timeout of 30000ms exceeded.
Call log:
  - waiting for locator('button:has-text("Orders")')

```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - text: The server is configured with a public base URL of /bobs-react-app/ - did you mean to visit
  - link /bobs-react-app/ [ref=e2] [cursor=pointer]:
    - /url: /bobs-react-app/
  - text: instead?
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | const BASE_URL = process.env.BASE_URL || 'http://localhost:5173/bobs-react-app';
  4  | 
  5  | test('Scenario: Add pizza to cart', async ({ page }) => {
  6  |   await page.goto(BASE_URL);
  7  |   await page.waitForLoadState('networkidle');
  8  |   
  9  |   // When I click "Pizzas"
  10 |   await page.click('button:has-text("Pizzas")');
  11 |   await page.waitForTimeout(500);
  12 |   
  13 |   // And I click "Add to Cart" on "Margherita"
  14 |   await page.locator('.grid > div:has-text("Margherita")').getByRole('button').click();
  15 |   await page.waitForTimeout(300);
  16 |   
  17 |   // Then cart badge shows "1"
  18 |   await expect(page.locator('header button:has(span) span')).toHaveText('1');
  19 | });
  20 | 
  21 | test('Scenario: Open cart and view items', async ({ page }) => {
  22 |   await page.goto(BASE_URL);
  23 |   await page.waitForLoadState('networkidle');
  24 |   
  25 |   // Setup: add to cart first
  26 |   await page.click('button:has-text("Pizzas")');
  27 |   await page.waitForTimeout(500);
  28 |   await page.locator('.grid > div:has-text("Margherita")').getByRole('button').click();
  29 |   await page.waitForTimeout(300);
  30 |   
  31 |   // When I click "Cart"
  32 |   await page.click('button:has-text("Cart")');
  33 |   await page.waitForTimeout(500);
  34 |   
  35 |   // Then cart drawer opens
  36 |   await expect(page.locator('h2:has-text("Your Cart")')).toBeVisible();
  37 |   
  38 |   // And I see "Margherita" in cart
  39 |   await expect(page.locator('.space-y-4')).toContainText('Margherita');
  40 | });
  41 | 
  42 | test('Scenario: Place order', async ({ page }) => {
  43 |   await page.goto(BASE_URL);
  44 |   await page.waitForLoadState('networkidle');
  45 |   
  46 |   // Setup: add to cart
  47 |   await page.click('button:has-text("Pizzas")');
  48 |   await page.waitForTimeout(500);
  49 |   await page.locator('.grid > div:has-text("Margherita")').getByRole('button').click();
  50 |   await page.waitForTimeout(300);
  51 |   
  52 |   // When I click "Cart"
  53 |   await page.click('button:has-text("Cart")');
  54 |   await page.waitForTimeout(500);
  55 |   
  56 |   // And I click "Place Order"
  57 |   await page.click('button:has-text("Place Order")');
  58 |   await page.waitForTimeout(1000);
  59 |   
  60 |   // Then I am on the "Orders" page
  61 |   await expect(page.locator('h2:has-text("Your Orders")')).toBeVisible();
  62 |   
  63 |   // And I see the order in list
  64 |   await expect(page.locator('.space-y-4')).toContainText('Margherita');
  65 | });
  66 | 
  67 | test('Scenario: View orders list', async ({ page }) => {
  68 |   await page.goto(BASE_URL);
  69 |   await page.waitForLoadState('networkidle');
  70 |   
  71 |   // When I click "Orders"
> 72 |   await page.click('button:has-text("Orders")');
     |              ^ Error: page.click: Test timeout of 30000ms exceeded.
  73 |   await page.waitForTimeout(500);
  74 |   
  75 |   // Then I see all my orders
  76 |   await expect(page.locator('h2:has-text("Your Orders")')).toBeVisible();
  77 |   
  78 |   // And each order shows status (if orders exist)
  79 |   const orders = page.locator('.bg-white.rounded-lg');
  80 |   const count = await orders.count();
  81 |   if (count > 0) {
  82 |     await expect(orders.first()).toContainText('Order #');
  83 |   }
  84 | });
  85 | 
```