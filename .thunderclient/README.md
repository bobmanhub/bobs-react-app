# Thunder Client Collection Guide

## Setup

1. **Install Thunder Client** extension in VS Code
2. **Import Collection**: Open Thunder Client → Collections → Import → Select `collections.json`

## Base URL
```
http://localhost:5000
```

## Environment Variables
- `baseUrl`: http://localhost:5000
- `orderId`: (Leave empty, populate after creating orders)

## Test Requests Overview

### 1. **API Root Info** ✅
- **Method**: GET
- **URL**: `/`
- **Purpose**: Check API status and available endpoints
- **Expected Status**: 200

### 2. **Get Pizza Menu** 🍕
- **Method**: GET
- **URL**: `/api/menu`
- **Purpose**: Retrieve all available pizzas with pricing
- **Expected Status**: 200
- **Response**: Menu with 5 pizzas

### 3. **Get All Orders** 📋
- **Method**: GET
- **URL**: `/api/orders`
- **Purpose**: View all placed orders
- **Expected Status**: 200

### 4. **Create Order - Single Margherita** ✏️
- **Method**: POST
- **URL**: `/api/orders`
- **Body**: Single medium Margherita
- **Expected Status**: 201
- **Use Case**: Simple single-item order

### 5. **Create Order - Multiple Pizzas** ✏️
- **Method**: POST
- **URL**: `/api/orders`
- **Body**: 3 different pizzas with various sizes
- **Expected Status**: 201
- **Use Case**: Complex multi-item order

### 6. **Create Order - Large Pizza Party** ✏️
- **Method**: POST
- **URL**: `/api/orders`
- **Body**: Party-sized order with 5 large pizzas
- **Expected Status**: 201
- **Use Case**: Test with higher quantity/price

### 7. **Create Order - Missing Field (Error Test)** ❌
- **Method**: POST
- **URL**: `/api/orders`
- **Body**: Missing `customerName` field
- **Expected Status**: 400
- **Use Case**: Error handling validation

### 8. **Delete Order** 🗑️
- **Method**: DELETE
- **URL**: `/api/orders/{order-id}`
- **Purpose**: Delete specific order
- **Expected Status**: 200
- **How to Use**:
  1. Run "Get All Orders"
  2. Copy an order ID from the response
  3. Replace `{order-id}` in the URL
  4. Send request

### 9. **Test 404 - Invalid Endpoint** ❌
- **Method**: GET
- **URL**: `/api/invalid`
- **Purpose**: Test 404 error handling
- **Expected Status**: 404

## Price Calculation

Size multipliers are applied to base pizza prices:
- **Small**: 1.0x
- **Medium**: 1.2x
- **Large**: 1.4x

Example: Margherita ($10.99) in Large size = $10.99 × 1.4 = $15.39

## Testing Workflow

### 1. **Initial Setup**
```
1. Start backend: npm run server
2. Open Thunder Client in VS Code
3. Import collections.json
```

### 2. **Basic Testing**
```
1. Run "API Root Info" → Verify connection
2. Run "Get Pizza Menu" → See available pizzas
3. Run "Get All Orders" → Check initial state (should be empty)
```

### 3. **Create Test Orders**
```
1. Run "Create Order - Single Margherita"
2. Run "Create Order - Multiple Pizzas"
3. Run "Create Order - Large Pizza Party"
4. Run "Get All Orders" → Verify 3 orders exist
```

### 4. **Test Error Handling**
```
1. Run "Create Order - Missing Field" → Should get 400 error
2. Run "Test 404 - Invalid Endpoint" → Should get 404 error
```

### 5. **Test Delete Operations**
```
1. Run "Get All Orders" and copy an order ID
2. Update "Delete Order - Template" URL with ID
3. Run the delete request
4. Run "Get All Orders" → Verify order is gone
```

## Tips & Tricks

### Copy Response Data
- Click response → Select order ID → Copy to clipboard
- Paste into URL for delete operations

### Create Variables
- Right-click collection → Add variable
- Use `{{variableName}}` in requests
- Useful for: `baseUrl`, `orderId`, `customerEmail`

### Add Tests (Optional)
- Click "Tests" tab in request
- Add JavaScript to validate responses
- Example: Check status code, validate JSON structure

### Export Results
- Right-click collection → Export
- Share with team members

## All Pizza Options

| ID | Name | Base Price |
|----|------|-----------|
| margherita | Margherita | $10.99 |
| pepperoni | Pepperoni | $12.99 |
| vegetarian | Vegetarian | $11.99 |
| four-cheese | Four Cheese | $13.99 |
| hawaiian | Hawaiian | $12.99 |

## API Response Examples

### Success (201)
```json
{
  "id": "abc12345",
  "items": [...],
  "totalPrice": 45.67,
  "status": "pending",
  "customerName": "Bob Johnson",
  "customerEmail": "bob@example.com",
  "createdAt": "2024-01-24T..."
}
```

### Error (400)
```json
{
  "error": "Missing required fields: items, customerName, customerEmail"
}
```

### Error (404)
```json
{
  "message": "Endpoint not found"
}
```
