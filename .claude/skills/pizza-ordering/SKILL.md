---
name: pizza-ordering
description: This skill enables the AI to assist users in ordering pizzas and drinks from Bob's React Pizza App. It leverages the BMAD Method architecture with a REST API backend and React TypeScript frontend.
---

# Pizza Ordering Skill

## Overview
This skill enables the AI to assist users in ordering pizzas and drinks from Bob's React Pizza App. It leverages the BMAD Method architecture with a REST API backend and React TypeScript frontend.

## Skill Purpose
Help users:
- Browse available pizzas and drinks
- Build custom orders with size and customization options
- Calculate accurate pricing
- Submit orders with customer information
- Track order status and manage existing orders

## Core Data Models

### Pizza
```typescript
{
  id: string;
  name: string;
  description: string;
  price: number;           // Base price
  image: string;           // URL to pizza image
  category: string;        // e.g., "Classic", "Specialty"
}
```

### Drink
```typescript
{
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
}
```

### OrderItem
```typescript
{
  pizzaId?: string;        // Pizza ID (optional if ordering drink)
  drinkId?: string;        // Drink ID (optional if ordering pizza)
  quantity: number;
  name: string;
  price: number;
  size?: 'small' | 'medium' | 'large';  // Pizza size only
  customizations?: string[];             // Toppings/modifications
}
```

### Order
```typescript
{
  id: string;
  items: OrderItem[];
  total: number;
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivered';
  createdAt: string;
}
```

## Available Pizzas (Default Menu)
- **Margherita** ($10.99) - Fresh mozzarella, tomato sauce, basil
- **Pepperoni** ($12.99) - Pepperoni, mozzarella, tomato sauce
- **Vegetarian** ($11.99) - Mixed vegetables, mozzarella
- **Four Cheese** ($13.99) - Blend of four cheeses
- **Hawaiian** ($12.99) - Ham, pineapple, mozzarella

## API Endpoints

### GET `/api/menu`
Retrieves all available pizzas and drinks.

**Response:**
```json
{
  "pizzas": [...],
  "drinks": [...],
  "timestamp": "2024-01-24T..."
}
```

### POST `/api/orders`
Creates a new pizza order.

**Request Body:**
```json
{
  "items": [
    {
      "pizzaId": "1",
      "quantity": 1,
      "size": "large",
      "customizations": ["extra cheese"]
    }
  ],
  "customerName": "Bob",
  "customerEmail": "bob@example.com"
}
```

### GET `/api/orders`
Retrieves all orders.

### DELETE `/api/orders/:id`
Deletes a specific order.

## Pricing Rules
- **Base Price**: Listed for each pizza or drink
- **Size Multipliers** (pizzas only):
  - Small: 0.8x
  - Medium: 1.0x (default)
  - Large: 1.2x
- **Total Calculation**: Sum of (item price × size multiplier × quantity) for all items

### Example Calculation
- Pepperoni (Large): $12.99 × 1.2 = $15.59
- Coke (1): $2.99 × 1 = $2.99
- **Total**: $18.58

## Ordering Workflow

### Step 1: Browse Menu
- Fetch the menu using `/api/menu`
- Present pizzas and drinks with descriptions and prices

### Step 2: Build Order
- Ask user for:
  - Which pizzas (with sizes)
  - Any customizations/toppings
  - Which drinks
  - Quantities

### Step 3: Calculate Total
- Apply size multipliers to pizzas
- Sum all items with quantities

### Step 4: Collect Customer Info
- Get customer name
- Get customer email

### Step 5: Submit Order
- POST order to `/api/orders`
- Confirm order ID and estimated delivery time

### Step 6: Manage Order
- Allow users to view orders
- Show order status
- Provide option to cancel if still pending

## Best Practices

1. **Always validate input**: Check pizza/drink IDs exist before adding to order
2. **Confirm pricing**: Show calculated totals before submission
3. **Support customizations**: Ask about extra toppings, dietary preferences
4. **Provide feedback**: Show order confirmation with ID and timestamp
5. **Handle errors gracefully**: If API is unavailable, guide user appropriately

## Common Assistance Patterns

### Pattern 1: Quick Order
User: "I want a large pepperoni pizza"
- Retrieve pepperoni from menu
- Calculate: $12.99 × 1.2 = $15.59
- Ask for drinks
- Collect customer info
- Submit order

### Pattern 2: Customization
User: "Veggie pizza with extra cheese and no onions"
- Find vegetarian pizza
- Add customizations to order item
- Calculate total with current size
- Proceed with order flow

### Pattern 3: Multiple Items
User: "2 large margheritas and 3 cokes"
- Add 2 Margherita pizzas (large) to cart
- Add 3 Cokes to cart
- Calculate: (2 × $10.99 × 1.2) + (3 × $2.99) = $35.85
- Confirm and submit

### Pattern 4: Order History
User: "Show me my orders"
- Fetch `/api/orders`
- Display all orders with status
- Allow filtering by status
- Offer to modify or delete if applicable

## React Components Reference
- **PizzaMenu.tsx** - Pizza selection interface
- **DrinkCard.tsx** - Individual drink display
- **MenuCard.tsx** - Menu item card component
- **OrderForm.tsx** - Shopping cart and checkout
- **OrdersList.tsx** - Order history and management

## Error Handling

| Error | Response |
|-------|----------|
| Invalid pizza ID | "Hmm, that pizza isn't on our menu right now. Would you like to see what we have?" |
| Missing customer info | "I need your name and email to place the order." |
| API unavailable | "Our ordering system is temporarily down. Please try again later." |
| Empty order | "You haven't added anything to your cart yet!" |

## Integration Notes
- The pizza skill integrates with the BMAD Method architecture
- REST API runs on port 5000
- Frontend built with React + TypeScript + Vite
- Tailwind CSS for responsive styling
- All data is type-safe with TypeScript interfaces

---

**Skill Status**: Ready to assist with pizza and drink orders
**Last Updated**: 2026-03-21
**Version**: 1.0
