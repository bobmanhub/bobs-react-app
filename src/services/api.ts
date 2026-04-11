// Mock API service for pizza and drink ordering

export interface Pizza {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
}

export interface Drink {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
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

const mockPizzaData: Pizza[] = [
  {
    id: '1',
    name: 'Margherita',
    description: 'Fresh mozzarella, tomato sauce, basil',
    price: 12.99,
    image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400&h=300&fit=crop',
    category: 'Classic'
  },
  {
    id: '2',
    name: 'Pepperoni',
    description: 'Pepperoni, mozzarella, tomato sauce',
    price: 14.99,
    image: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=400&h=300&fit=crop',
    category: 'Classic'
  },
  {
    id: '3',
    name: 'Hawaiian',
    description: 'Ham, pineapple, mozzarella, tomato sauce',
    price: 15.99,
    image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&h=300&fit=crop',
    category: 'Specialty'
  },
  {
    id: '4',
    name: 'Quattro Formaggi',
    description: 'Four cheese blend, white sauce',
    price: 16.99,
    image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&h=300&fit=crop',
    category: 'Specialty'
  },
  {
    id: '5',
    name: 'Vegetarian',
    description: 'Bell peppers, mushrooms, onions, olives',
    price: 13.99,
    image: 'https://images.unsplash.com/photo-1511689660979-10d2b1aada49?w=400&h=300&fit=crop',
    category: 'Veggie'
  },
  {
    id: '6',
    name: 'Meat Lovers',
    description: 'Pepperoni, sausage, bacon, ham',
    price: 17.99,
    image: 'https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?w=400&h=300&fit=crop',
    category: 'Specialty'
  }
];

const mockDrinkData: Drink[] = [
  {
    id: 'cola',
    name: 'Cola',
    description: 'Refreshing cola beverage',
    price: 2.50,
    image: '🥤'
  },
  {
    id: 'ice-tea',
    name: 'Ice Tea',
    description: 'Refreshing iced tea',
    price: 2.50,
    image: '🧋'
  },
  {
    id: 'water',
    name: 'Water',
    description: 'Bottled water',
    price: 1.50,
    image: '💧'
  }
];

let mockOrders: Order[] = [
  {
    id: 'order-1',
    items: [
      { pizzaId: '1', quantity: 2, name: 'Margherita', price: 12.99 }
    ],
    total: 25.98,
    status: 'preparing',
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString()
  },
  {
    id: 'order-2',
    items: [
      { pizzaId: '2', drinkId: '1', size: 'medium', quantity: 1, name: 'Pepperoni', price: 14.99 }
    ],
    total: 14.99,
    status: 'preparing',
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString()
  }
];

export async function getMenu(): Promise<Pizza[]> {
  await new Promise(resolve => setTimeout(resolve, 500));
  return mockPizzaData;
}

export async function getDrinks(): Promise<Drink[]> {
  await new Promise(resolve => setTimeout(resolve, 300));
  return mockDrinkData;
}

export async function getOrders(): Promise<Order[]> {
  await new Promise(resolve => setTimeout(resolve, 300));
  return mockOrders;
}

export async function createOrder(orderData: { items: OrderItem[] }): Promise<Order> {
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const newOrder: Order = {
    id: `order-${Date.now()}`,
    items: orderData.items,
    total: orderData.items.reduce((sum, item) => sum + (item.price * item.quantity), 0),
    status: 'preparing',
    createdAt: new Date().toISOString()
  };
  
  mockOrders = [newOrder, ...mockOrders];
  return newOrder;
}

export async function deleteOrder(orderId: string): Promise<void> {
  await new Promise(resolve => setTimeout(resolve, 300));
  mockOrders = mockOrders.filter(order => order.id !== orderId);
}
