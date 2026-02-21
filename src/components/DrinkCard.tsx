import { Plus } from 'lucide-react';
import type { Drink } from '../services/api';

interface DrinkCardProps {
  drink: Drink;
  onAddToCart: (drink: Drink) => void;
}

export function DrinkCard({ drink, onAddToCart }: DrinkCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden transition-transform hover:scale-105">
      <div className="w-full h-48 object-cover flex items-center justify-center bg-gray-100 text-6xl">
        {drink.image}
      </div>
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-semibold">{drink.name}</h3>
          <span className="text-orange-600 font-bold">${drink.price.toFixed(2)}</span>
        </div>
        <p className="text-gray-600 text-sm mb-3">{drink.description}</p>
        <button
          onClick={() => onAddToCart(drink)}
          className="w-full bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add to Cart
        </button>
      </div>
    </div>
  );
}
