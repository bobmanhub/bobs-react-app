// Pizza and drink ordering API service
// Connects to Cloud Run API: https://pizza-api-331610961275.us-central1.run.app

const API_BASE_URL = 'https://pizza-api-331610961275.us-central1.run.app';

export interface Pizza {
  id: string;
  name: string;
  description: string;
  basePrice: number;
  price?: number; // For compatibility
  image: string;
  category?: string;
  available?: boolean;
}

export interface Drink {
  id: string;
  name: string;
  description: string;
  basePrice: number;
  price?: number; // For compatibility
  image: string;
  available?: boolean;
}

export interface OrderItem {
  pizzaId?: string;
  drinkId?: string;
  size?: string;
  quantity: number;
  name: string;
  price: number;
}

export interface Order {
  id: string;
  items: OrderItem[];
  total: number;
  status: string;
  createdAt: string;
}

// Cache for menu data
let cachedMenu: { pizzas?: Pizza[]; drinks?: Drink[] } = {};

export async function getMenu(): Promise<Pizza[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/menu`);
    if (!response.ok) {
      throw new Error(`Menu API error: ${response.status}`);
    }
    const data = await response.json();
    cachedMenu = data;
    // Convert basePrice to price for compatibility
    return (data.pizzas || []).map((pizza: Pizza) => ({
      ...pizza,
      price: pizza.basePrice,
      category: pizza.category || 'Classic'
    }));
  } catch (error) {
    console.error('Failed to fetch menu:', error);
    return [];
  }
}

export async function getDrinks(): Promise<Drink[]> {
  try {
    // If we already have cached drinks from getMenu, use them
    if (cachedMenu.drinks) {
      return cachedMenu.drinks.map((drink: Drink) => ({
        ...drink,
        price: drink.basePrice
      }));
    }
    
    // Otherwise fetch menu which includes drinks
    const response = await fetch(`${API_BASE_URL}/api/menu`);
    if (!response.ok) {
      throw new Error(`Menu API error: ${response.status}`);
    }
    const data = await response.json();
    cachedMenu = data;
    return (data.drinks || []).map((drink: Drink) => ({
      ...drink,
      price: drink.basePrice
    }));
  } catch (error) {
    console.error('Failed to fetch drinks:', error);
    return [];
  }
}

export async function getOrders(): Promise<Order[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/orders`);
    if (!response.ok) {
      throw new Error(`Orders API error: ${response.status}`);
    }
    const data = await response.json();
    return data.orders || [];
  } catch (error) {
    console.error('Failed to fetch orders:', error);
    return [];
  }
}

export async function createOrder(orderData: { items: OrderItem[] }): Promise<Order> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(orderData)
    });
    if (!response.ok) {
      throw new Error(`Create order API error: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Failed to create order:', error);
    throw error;
  }
}

export async function deleteOrder(orderId: string): Promise<void> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/orders/${orderId}`, {
      method: 'DELETE'
    });
    if (!response.ok) {
      throw new Error(`Delete order API error: ${response.status}`);
    }
  } catch (error) {
    console.error('Failed to delete order:', error);
    throw error;
  }
}
