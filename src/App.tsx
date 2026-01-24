import { useState } from 'react';
import './App.css'
import { Blog } from './components/Blog'
import { PizzaMenu } from './components/PizzaMenu'
import { OrderForm } from './components/OrderForm'
import { OrdersList } from './components/OrdersList'
import type { OrderItem, Pizza } from './types/pizza'

function App() {
  const [currentView, setCurrentView] = useState<'home' | 'pizza' | 'orders'>('home');
  const [cartItems, setCartItems] = useState<OrderItem[]>([]);
  const [pizzaMap, setPizzaMap] = useState<{ [key: string]: Pizza }>({});
  const [refreshOrders, setRefreshOrders] = useState(0);
  const [loading, setLoading] = useState(false);

  // Load pizza menu to build map
  const handleAddToCart = (pizza: Pizza, quantity: number, size: string) => {
    setPizzaMap(prev => ({ ...prev, [pizza.id]: pizza }));
    setCartItems(prev => [...prev, { pizzaId: pizza.id, quantity, size, customizations: [] }]);
    alert(`${pizza.name} added to cart!`);
  };

  const handleSubmitOrder = async (name: string, email: string) => {
    setLoading(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/orders`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            items: cartItems,
            customerName: name,
            customerEmail: email
          })
        }
      );
      
      if (response.ok) {
        alert('Order placed successfully!');
        setCartItems([]);
        setRefreshOrders(prev => prev + 1);
        setCurrentView('orders');
      }
    } catch (error) {
      alert('Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="App">
      <div className="navbar">
        <h1>🍕 Bob's Pizza Shop</h1>
        <ul>
          <li><button onClick={() => setCurrentView('home')} className={currentView === 'home' ? 'active' : ''}>Home</button></li>
          <li><button onClick={() => setCurrentView('pizza')} className={currentView === 'pizza' ? 'active' : ''}>Order Pizza</button></li>
          <li><button onClick={() => setCurrentView('orders')} className={currentView === 'orders' ? 'active' : ''}>Orders</button></li>
        </ul>
      </div>

      <main className="content">
        {currentView === 'home' && (
          <div className="home-view">
            <h2>Welcome to Bob's Pizza Ordering System</h2>
            <p>Built with BMAD Method - Breakthrough Method of Agile AI-Driven Development</p>
            <div className="features">
              <div className="feature">
                <span>🎯</span> Fast API design with AI-driven architecture
              </div>
              <div className="feature">
                <span>⚡</span> Agile development with rapid iterations
              </div>
              <div className="feature">
                <span>📦</span> Full-stack integration from menu to orders
              </div>
            </div>
            <Blog />
          </div>
        )}

        {currentView === 'pizza' && (
          <div className="pizza-view">
            <PizzaMenu onAddToCart={handleAddToCart} />
            <OrderForm
              cartItems={cartItems}
              pizzaMap={pizzaMap}
              onSubmit={handleSubmitOrder}
              loading={loading}
            />
          </div>
        )}

        {currentView === 'orders' && (
          <OrdersList refreshTrigger={refreshOrders} />
        )}
      </main>
    </div>
  )
}
export default App