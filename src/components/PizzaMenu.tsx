import { useEffect, useState } from "react";
import type { Pizza } from "../types/pizza";

interface PizzaMenuProps {
  onAddToCart: (pizza: Pizza, quantity: number, size: string) => void;
}

export function PizzaMenu({ onAddToCart }: PizzaMenuProps) {
  const [pizzas, setPizzas] = useState<Pizza[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/menu`)
      .then((res) => res.json())
      .then((data) => {
        setPizzas(data.pizzas);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <div>Loading menu...</div>;

  return (
    <div className="pizza-menu">
      <h2>🍕 Our Menu</h2>
      <div className="pizza-grid">
        {pizzas.map((pizza) => (
          <div key={pizza.id} className="pizza-card">
            <div className="pizza-emoji">{pizza.image}</div>
            <h3>{pizza.name}</h3>
            <p>{pizza.description}</p>
            <p className="price">${pizza.basePrice}</p>
            <select
              value={selectedSize[pizza.id] || "medium"}
              onChange={(e) =>
                setSelectedSize({ ...selectedSize, [pizza.id]: e.target.value })
              }
            >
              <option value="small">Small</option>
              <option value="medium">Medium</option>
              <option value="large">Large</option>
            </select>
            <button
              onClick={() =>
                onAddToCart(pizza, 1, selectedSize[pizza.id] || "medium")
              }
              disabled={!pizza.available}
            >
              {pizza.available ? "Add to Cart" : "Out of Stock"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
