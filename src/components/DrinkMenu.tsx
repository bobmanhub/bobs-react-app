import type { Drink } from "../types/pizza";

interface DrinkMenuProps {
  onAddToCart: (drink: Drink, quantity: number) => void;
}

const drinks: Drink[] = [
  {
    id: "cola",
    name: "Cola",
    description: "Refreshing cola beverage",
    price: 2.50,
    image: "🥤",
    available: true,
  },
  {
    id: "ice-tea",
    name: "Ice Tea",
    description: "Refreshing iced tea",
    price: 2.50,
    image: "🧋",
    available: true,
  },
  {
    id: "water",
    name: "Water",
    description: "Bottled water",
    price: 1.50,
    image: "💧",
    available: true,
  },
];

export function DrinkMenu({ onAddToCart }: DrinkMenuProps) {
  return (
    <div className="drink-menu">
      <h2>🥤 Drinks</h2>
      <div className="drink-grid">
        {drinks.map((drink) => (
          <div key={drink.id} className="drink-card">
            <div className="drink-emoji">{drink.image}</div>
            <h3>{drink.name}</h3>
            <p>{drink.description}</p>
            <p className="price">${drink.price.toFixed(2)}</p>
            <button
              onClick={() => onAddToCart(drink, 1)}
              disabled={!drink.available}
            >
              {drink.available ? "Add to Cart" : "Out of Stock"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
