# Pizza Ordering API - BMAD Method Implementation

## Overview
A complete pizza ordering system built using the **BMAD Method** (Breakthrough Method of Agile AI-Driven Development).

## Architecture

### Backend (Node.js)
- **Location**: `server.js`
- **Framework**: Native HTTP module (lightweight & fast)
- **Port**: 5000

### API Endpoints

#### 1. GET `/`
Returns API information and available endpoints.

#### 2. GET `/api/menu`
Retrieves the complete pizza menu with pricing.
```json
{
  "pizzas": [...],
  "timestamp": "2024-01-24T..."
}
```

#### 3. POST `/api/orders`
Creates a new pizza order.
```json
{
  "items": [
    {
      "pizzaId": "margherita",
      "quantity": 2,
      "size": "large",
      "customizations": []
    }
  ],
  "customerName": "Bob",
  "customerEmail": "bob@example.com"
}
```

#### 4. GET `/api/orders`
Retrieves all orders placed.

#### 5. DELETE `/api/orders/:id`
Deletes a specific order by ID.

### Frontend (React + TypeScript)

#### Components
1. **PizzaMenu** - Display available pizzas with size selection
2. **OrderForm** - Shopping cart and order submission
3. **OrdersList** - View all placed orders with management

#### Views
- **Home** - Introduction to the system
- **Order Pizza** - Full ordering interface
- **Orders** - Order history and management

## Features

✅ **Type-Safe** - Full TypeScript support with strict mode
✅ **RESTful API** - Standard HTTP methods for CRUD operations
✅ **Real-time Updates** - Orders refresh automatically
✅ **Responsive UI** - Mobile-friendly design
✅ **Price Calculation** - Size-based pricing multipliers
✅ **CORS Enabled** - Cross-origin requests supported

## BMAD Method Principles Applied

1. **Breakthrough Design** - Rapid API-first architecture
2. **Agile Development** - Iterative component building
3. **AI-Driven** - Intelligent data model design
4. **Minimal Overhead** - No unnecessary dependencies
5. **Full Integration** - Backend-to-frontend connectivity

## Getting Started

```bash
# Install dependencies
npm install

# Start development server (runs both frontend and backend)
npm run server

# Build for production
npm run build

# Run with Docker
npm run build:docker
```

## Pizza Menu (Default)
- Margherita - $10.99
- Pepperoni - $12.99
- Vegetarian - $11.99
- Four Cheese - $13.99
- Hawaiian - $12.99

## Data Flow

```
User → PizzaMenu Component
  ↓
addToCart → OrderForm Component
  ↓
submitOrder → POST /api/orders
  ↓
Backend Order Processing
  ↓
OrdersList → GET /api/orders → Display Order History
```

## In-Memory Storage
Currently, orders are stored in memory. For production, integrate:
- MongoDB
- PostgreSQL
- Firebase
- Any database of choice

## Technology Stack
- **Frontend**: React 19, TypeScript, Vite
- **Backend**: Node.js (HTTP module)
- **Styling**: CSS3 with responsive grid layout
- **API**: RESTful with JSON payloads

## Future Enhancements
- Persistent database integration
- User authentication & authorization
- Order tracking with real-time notifications
- Payment gateway integration
- Admin dashboard
- Review & rating system
