import { useEffect, useState } from "react";
import type { Order } from "../types/pizza";

interface OrdersListProps {
  refreshTrigger: number;
}

export function OrdersList({ refreshTrigger }: OrdersListProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/orders`)
      .then((res) => res.json())
      .then((data) => {
        setOrders(data.orders || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [refreshTrigger]);

  const handleDelete = (orderId: string) => {
    fetch(
      `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/orders/${orderId}`,
      { method: "DELETE" }
    ).then(() => {
      setOrders(orders.filter((o) => o.id !== orderId));
    });
  };

  if (loading) return <div>Loading orders...</div>;

  return (
    <div className="orders-list">
      <h2>📋 Recent Orders ({orders.length})</h2>
      {orders.length === 0 ? (
        <p>No orders yet</p>
      ) : (
        <div className="orders">
          {orders.map((order) => (
            <div key={order.id} className="order-card">
              <div className="order-header">
                <span className="order-id">Order #{order.id.substring(0, 6)}</span>
                <span className={`status status-${order.status}`}>
                  {order.status}
                </span>
              </div>
              <p>
                <strong>{order.customerName}</strong> ({order.customerEmail})
              </p>
              <p>{order.items.length} item(s) - ${order.totalPrice.toFixed(2)}</p>
              <p className="timestamp">
                {new Date(order.createdAt).toLocaleString()}
              </p>
              <button
                className="delete-btn"
                onClick={() => handleDelete(order.id)}
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
