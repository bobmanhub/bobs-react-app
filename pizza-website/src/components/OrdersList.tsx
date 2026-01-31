import { Trash2, Clock, CheckCircle } from 'lucide-react';
import type { Order } from '../services/api';

interface OrdersListProps {
  orders: Order[];
  onDeleteOrder: (orderId: string) => void;
}

export function OrdersList({ orders, onDeleteOrder }: OrdersListProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'preparing':
        return <Clock className="w-5 h-5 text-orange-500" />;
      case 'ready':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (orders.length === 0) {
    return (
      <div className="text-center text-gray-500 py-12">
        <p className="text-lg">No orders yet</p>
        <p className="text-sm">Start by adding some pizzas to your cart!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {orders.map((order) => (
        <div key={order.id} className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-3">
              {getStatusIcon(order.status)}
              <div>
                <h3 className="font-semibold">Order #{order.id}</h3>
                <p className="text-sm text-gray-500">{formatDate(order.createdAt)}</p>
              </div>
            </div>
            <button
              onClick={() => onDeleteOrder(order.id)}
              className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded transition-colors"
              title="Cancel order"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
          
          <div className="space-y-2 mb-4">
            {order.items.map((item, index) => (
              <div key={index} className="flex justify-between text-sm">
                <span className="text-gray-700">
                  {item.quantity}x {item.name}
                </span>
                <span className="text-gray-600">
                  ${(item.price * item.quantity).toFixed(2)}
                </span>
              </div>
            ))}
          </div>
          
          <div className="flex justify-between items-center pt-4 border-t">
            <span className={`px-3 py-1 rounded-full text-sm ${
              order.status === 'preparing' 
                ? 'bg-orange-100 text-orange-700' 
                : 'bg-green-100 text-green-700'
            }`}>
              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
            </span>
            <span className="font-bold text-lg text-orange-600">
              ${order.total.toFixed(2)}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
