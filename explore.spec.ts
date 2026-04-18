import { test, expect } from '@playwright/test';

test('explore pizza ordering flow', async ({ page }) => {
  await page.goto('http://localhost:5173/bobs-react-app/');
  await page.waitForLoadState('networkidle');

  console.log('=== PAGE LOADED ===');
  console.log('Title:', await page.title());

  // Get all buttons
  const allButtons = await page.locator('button').allTextContents();
  console.log('\n=== ALL BUTTONS ===');
  allButtons.forEach((b, i) => console.log(i, b));

  // Click Pizzas nav
  await page.click('button:has-text("Pizzas")');
  await page.waitForTimeout(1000);

  // Get pizza cards
  const pizzaCards = page.locator('.grid > div');
  const cardCount = await pizzaCards.count();
  console.log('\n=== PIZZA CARDS ===');
  console.log('Count:', cardCount);

  for (let i = 0; i < Math.min(cardCount, 3); i++) {
    const text = await pizzaCards.nth(i).textContent();
    console.log(`Card ${i}:`, text?.substring(0, 100));
  }

  // Click Add to Cart on first pizza
  await pizzaCards.first().locator('button').click();
  await page.waitForTimeout(500);

  // Check cart badge
  const badgeLocator = page.locator('header button:has(span) span').first();
  if (await badgeLocator.isVisible()) {
    console.log('\n=== CART BADGE ===');
    console.log('Badge:', await badgeLocator.textContent());
  }

  // Open cart
  await page.click('button:has-text("Cart")');
  await page.waitForTimeout(500);

  // Get cart items
  const cartItems = page.locator('.space-y-4 > div');
  const cartCount = await cartItems.count();
  console.log('\n=== CART ITEMS ===');
  console.log('Items in cart:', cartCount);

  for (let i = 0; i < cartCount; i++) {
    const text = await cartItems.nth(i).textContent();
    console.log(`Item ${i}:`, text?.replace(/\s+/g, ' '));
  }

  // Click Place Order
  await page.click('button:has-text("Place Order")');
  await page.waitForTimeout(1000);

  // Check we're on orders page
  const ordersHeader = page.locator('h2').first();
  console.log('\n=== ORDERS PAGE ===');
  console.log('Header:', await ordersHeader.textContent());

  // List all h2 headings
  const allH2s = await page.locator('h2').allTextContents();
  console.log('All H2s:', allH2s);
});
