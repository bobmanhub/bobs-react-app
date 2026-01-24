// Pizza API Types - BMAD Method Design

export interface Pizza {
  id: string;
  name: string;
  description: string;
  basePrice: number;
  image: string;
  available: boolean;
}

export interface OrderItem {
  pizzaId: string;
  quantity: number;
  size: 'small' | 'medium' | 'large';
  customizations: string[];
}

export interface Order {
  id: string;
  items: OrderItem[];
  totalPrice: number;
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivered';
  customerName: string;
  customerEmail: string;
  createdAt: string;
}

export interface MenuResponse {
  pizzas: Pizza[];
  timestamp: string;
}
