import { Plus } from 'lucide-react';
import type { Pizza } from '../services/api';

interface MenuCardProps {
  pizza: Pizza;
  onAddToCart: (pizza: Pizza) => void;
}

export function MenuCard({ pizza, onAddToCart }: MenuCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden transition-transform hover:scale-105">
      <img 
        src={pizza.image} 
        alt={pizza.name}
        className="w-full h-48 object-cover"
      />
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-semibold">{pizza.name}</h3>
          <span className="text-orange-600 font-bold">${pizza.price.toFixed(2)}</span>
        </div>
        <p className="text-gray-600 text-sm mb-3">{pizza.description}</p>
        <div className="flex justify-between items-center">
          <span className="text-xs bg-gray-100 px-2 py-1 rounded">{pizza.category}</span>
          <button
            onClick={() => onAddToCart(pizza)}
            className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
}
