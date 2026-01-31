import { useState, useEffect } from 'react';
import { ShoppingCart, Pizza as PizzaIcon, Package } from 'lucide-react';
import { MenuCard } from './components/MenuCard';
import { Cart } from './components/Cart';
import { OrdersList } from './components/OrdersList';
import { getMenu, getOrders, createOrder, deleteOrder, type Pizza, type Order, type OrderItem } from './services/api';
import { toast } from 'sonner@2.0.3';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

type View = 'menu' | 'orders';

export default function App() {
  const [view, setView] = useState<View>('menu');
  const [menu, setMenu] = useState<Pizza[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load menu and orders on mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [menuData, ordersData] = await Promise.all([
        getMenu(),
        getOrders()
      ]);
      setMenu(menuData);
      setOrders(ordersData);
    } catch (error) {
      toast.error('Failed to load data. Please try again.');
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (pizza: Pizza) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === pizza.id);
      if (existingItem) {
        return prevCart.map(item =>
          item.id === pizza.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prevCart, { id: pizza.id, name: pizza.name, price: pizza.price, quantity: 1 }];
    });
    toast.success(`${pizza.name} added to cart!`);
  };

  const handleUpdateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      handleRemoveItem(id);
      return;
    }
    setCart(prevCart =>
      prevCart.map(item =>
        item.id === id ? { ...item, quantity } : item
      )
    );
  };

  const handleRemoveItem = (id: string) => {
    setCart(prevCart => prevCart.filter(item => item.id !== id));
  };

  const handleCheckout = async () => {
    if (cart.length === 0) return;

    try {
      const orderItems: OrderItem[] = cart.map(item => ({
        pizzaId: item.id,
        quantity: item.quantity,
        name: item.name,
        price: item.price
      }));

      const newOrder = await createOrder({ items: orderItems });
      setOrders(prevOrders => [newOrder, ...prevOrders]);
      setCart([]);
      setShowCart(false);
      toast.success('Order placed successfully!');
      setView('orders');
    } catch (error) {
      toast.error('Failed to place order. Please try again.');
      console.error('Error creating order:', error);
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    try {
      await deleteOrder(orderId);
      setOrders(prevOrders => prevOrders.filter(order => order.id !== orderId));
      toast.success('Order cancelled successfully');
    } catch (error) {
      toast.error('Failed to cancel order. Please try again.');
      console.error('Error deleting order:', error);
    }
  };

  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <PizzaIcon className="w-8 h-8 text-orange-500" />
              <h1 className="text-2xl font-bold text-gray-900">Pizza Palace</h1>
            </div>
            
            <nav className="flex items-center gap-4">
              <button
                onClick={() => setView('menu')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  view === 'menu'
                    ? 'bg-orange-500 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                Menu
              </button>
              <button
                onClick={() => setView('orders')}
                className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                  view === 'orders'
                    ? 'bg-orange-500 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Package className="w-4 h-4" />
                Orders
              </button>
              <button
                onClick={() => setShowCart(true)}
                className="relative bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
              >
                <ShoppingCart className="w-5 h-5" />
                Cart
                {cartItemCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                    {cartItemCount}
                  </span>
                )}
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
            <p className="mt-4 text-gray-600">Loading...</p>
          </div>
        ) : view === 'menu' ? (
          <div>
            <div className="mb-6">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Our Menu</h2>
              <p className="text-gray-600">Choose from our delicious selection of pizzas</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {menu.map(pizza => (
                <MenuCard
                  key={pizza.id}
                  pizza={pizza}
                  onAddToCart={handleAddToCart}
                />
              ))}
            </div>
          </div>
        ) : (
          <div>
            <div className="mb-6">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Your Orders</h2>
              <p className="text-gray-600">Track and manage your pizza orders</p>
            </div>
            <OrdersList orders={orders} onDeleteOrder={handleDeleteOrder} />
          </div>
        )}
      </main>

      {/* Cart Modal */}
      {showCart && (
        <Cart
          items={cart}
          onUpdateQuantity={handleUpdateQuantity}
          onRemoveItem={handleRemoveItem}
          onCheckout={handleCheckout}
          onClose={() => setShowCart(false)}
        />
      )}
    </div>
  );
}
