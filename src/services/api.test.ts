import { describe, it, expect, beforeEach } from 'vitest';
import { getMenu, getDrinks, getOrders, createOrder, deleteOrder } from './api';

describe('Pizza API', () => {
  beforeEach(() => {
    // Reset any test state if needed
  });

  describe('getMenu', () => {
    it('should return an array of pizzas', async () => {
      const menu = await getMenu();
      expect(Array.isArray(menu)).toBe(true);
      expect(menu.length).toBeGreaterThan(0);
    });

    it('should return pizzas with all required fields', async () => {
      const menu = await getMenu();
      menu.forEach((pizza) => {
        expect(pizza).toHaveProperty('id');
        expect(pizza).toHaveProperty('name');
        expect(pizza).toHaveProperty('description');
        expect(pizza).toHaveProperty('price');
        expect(pizza).toHaveProperty('image');
        expect(pizza).toHaveProperty('category');
      });
    });

    it('should return pizzas with valid prices', async () => {
      const menu = await getMenu();
      menu.forEach((pizza) => {
        expect(pizza.price).toBeGreaterThan(0);
        expect(typeof pizza.price).toBe('number');
      });
    });

    it('should include Margherita and Pepperoni pizzas', async () => {
      const menu = await getMenu();
      const names = menu.map((p) => p.name);
      expect(names).toContain('Margherita');
      expect(names).toContain('Pepperoni');
    });
  });

  describe('getDrinks', () => {
    it('should return an array of drinks', async () => {
      const drinks = await getDrinks();
      expect(Array.isArray(drinks)).toBe(true);
      expect(drinks.length).toBeGreaterThan(0);
    });

    it('should return drinks with all required fields', async () => {
      const drinks = await getDrinks();
      drinks.forEach((drink) => {
        expect(drink).toHaveProperty('id');
        expect(drink).toHaveProperty('name');
        expect(drink).toHaveProperty('description');
        expect(drink).toHaveProperty('price');
        expect(drink).toHaveProperty('image');
      });
    });

    it('should include Cola, Ice Tea, and Water', async () => {
      const drinks = await getDrinks();
      const names = drinks.map((d) => d.name);
      expect(names).toContain('Cola');
      expect(names).toContain('Ice Tea');
      expect(names).toContain('Water');
    });
  });

  describe('getOrders', () => {
    it('should return an array of orders', async () => {
      const orders = await getOrders();
      expect(Array.isArray(orders)).toBe(true);
    });

    it('should return orders with required fields', async () => {
      const orders = await getOrders();
      orders.forEach((order) => {
        expect(order).toHaveProperty('id');
        expect(order).toHaveProperty('items');
        expect(order).toHaveProperty('total');
        expect(order).toHaveProperty('status');
        expect(order).toHaveProperty('createdAt');
      });
    });
  });

  describe('createOrder', () => {
    it('should create a new order with correct total', async () => {
      const orderData = {
        items: [
          { pizzaId: '1', quantity: 2, name: 'Margherita', price: 12.99 },
          { drinkId: 'cola', quantity: 1, name: 'Cola', price: 2.50 }
        ]
      };

      const newOrder = await createOrder(orderData);

      expect(newOrder).toHaveProperty('id');
      expect(newOrder.items).toEqual(orderData.items);
      expect(newOrder.total).toBe(12.99 * 2 + 2.50);
      expect(newOrder.status).toBe('preparing');
    });

    it('should create order with valid id format', async () => {
      const orderData = {
        items: [
          { pizzaId: '1', quantity: 1, name: 'Margherita', price: 12.99 }
        ]
      };

      const newOrder = await createOrder(orderData);
      expect(newOrder.id).toMatch(/^order-\d+$/);
    });

    it('should include createdAt timestamp', async () => {
      const orderData = {
        items: [
          { pizzaId: '1', quantity: 1, name: 'Margherita', price: 12.99 }
        ]
      };

      const newOrder = await createOrder(orderData);
      expect(newOrder.createdAt).toBeTruthy();
      expect(new Date(newOrder.createdAt)).toBeInstanceOf(Date);
    });
  });

  describe('deleteOrder', () => {
    it('should delete an order', async () => {
      // Create an order first
      const orderData = {
        items: [
          { pizzaId: '1', quantity: 1, name: 'Margherita', price: 12.99 }
        ]
      };
      const newOrder = await createOrder(orderData);
      const orderId = newOrder.id;

      // Get orders before deletion
      const ordersBefore = await getOrders();
      const initialCount = ordersBefore.length;

      // Delete the order
      await deleteOrder(orderId);

      // Get orders after deletion
      const ordersAfter = await getOrders();
      expect(ordersAfter.length).toBe(initialCount - 1);
      expect(ordersAfter.some((o) => o.id === orderId)).toBe(false);
    });

    it('should not crash when deleting non-existent order', async () => {
      expect(async () => {
        await deleteOrder('non-existent-id');
      }).not.toThrow();
    });
  });
});
