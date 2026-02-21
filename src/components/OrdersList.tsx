import { Trash2, Clock, CheckCircle, Package } from 'lucide-react';
import type { Order } from '../services/api';

interface OrdersListProps {
  orders: Order[];
  onDeleteOrder: (orderId: string) => void;
}

const statusIcons: Record<string, React.ReactNode> = {
  pending: <Clock className="w-4 h-4 text-yellow-500" />,
  preparing: <Package className="w-4 h-4 text-blue-500" />,
  ready: <CheckCircle className="w-4 h-4 text-green-500" />,
  delivered: <CheckCircle className="w-4 h-4 text-green-600" />,
};

export function OrdersList({ orders, onDeleteOrder }: OrdersListProps) {
  if (orders.length === 0) {
    return (
      <div className="text-center py-12">
        <Package className="w-16 h-16 mx-auto text-gray-300 mb-4" />
        <p className="text-gray-500 text-lg">No orders yet</p>
        <p className="text-gray-400">Place an order to see it here</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {orders.map((order) => (
        <div
          key={order.id}
          className="bg-white rounded-lg shadow-md p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        >
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <span className="font-semibold text-lg">Order #{order.id.slice(-6)}</span>
              <span className="flex items-center gap-1 text-sm bg-gray-100 px-2 py-1 rounded">
                {statusIcons[order.status] || <Clock className="w-4 h-4" />}
                {order.status}
              </span>
            </div>
            <div className="text-sm text-gray-600 space-y-1">
              <p>
                {order.items.map(item => `${item.quantity}x ${item.name}`).join(', ')}
              </p>
              <p className="text-gray-400 text-xs">
                {new Date(order.createdAt).toLocaleString()}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <span className="text-xl font-bold text-orange-600">
              ${order.total.toFixed(2)}
            </span>
            <button
              onClick={() => onDeleteOrder(order.id)}
              className="text-red-500 hover:text-red-700 p-2 rounded-lg hover:bg-red-50 transition-colors"
              title="Cancel order"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
