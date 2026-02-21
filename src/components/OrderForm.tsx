import { useState } from "react";
import type { OrderItem, Pizza, Drink } from "../types/pizza";

interface OrderFormProps {
  cartItems: OrderItem[];
  pizzaMap: { [key: string]: Pizza };
  drinkMap: { [key: string]: Drink };
  onSubmit: (name: string, email: string) => void;
  loading: boolean;
}

export function OrderForm({
  cartItems,
  pizzaMap,
  drinkMap,
  onSubmit,
  loading,
}: OrderFormProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const totalPrice = cartItems.reduce((sum, item) => {
    if (item.drinkId) {
      const drink = drinkMap[item.drinkId];
      if (drink) {
        return sum + drink.price * item.quantity;
      }
    }
    if (item.pizzaId) {
      const pizza = pizzaMap[item.pizzaId];
      if (pizza) {
        const sizeMultiplier =
          item.size === "small" ? 1 : item.size === "medium" ? 1.2 : 1.4;
        return sum + pizza.basePrice * sizeMultiplier * item.quantity;
      }
    }
    return sum;
  }, 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name && email && cartItems.length > 0) {
      onSubmit(name, email);
      setName("");
      setEmail("");
    }
  };

  return (
    <div className="order-form">
      <h2>🛒 Order Summary</h2>
      {cartItems.length === 0 ? (
        <p>Your cart is empty</p>
      ) : (
        <>
          <div className="cart-items">
            {cartItems.map((item, idx) => (
              <div key={idx} className="cart-item">
                <span>
                  {item.drinkId
                    ? drinkMap[item.drinkId]?.name
                    : item.pizzaId
                      ? pizzaMap[item.pizzaId]?.name
                      : "Unknown Item"}
                  {item.size ? ` (${item.size})` : ""}
                </span>
                <span>x{item.quantity}</span>
                <span>
                  $
                  {item.drinkId
                    ? ((drinkMap[item.drinkId]?.price || 0) * item.quantity).toFixed(2)
                    : item.pizzaId
                      ? (
                          (pizzaMap[item.pizzaId]?.basePrice || 0) *
                          (item.size === "small"
                            ? 1
                            : item.size === "medium"
                              ? 1.2
                              : 1.4) *
                          item.quantity
                        ).toFixed(2)
                      : "0.00"}
                </span>
              </div>
            ))}
          </div>
          <div className="total">Total: ${totalPrice.toFixed(2)}</div>
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              placeholder="Your Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <input
              type="email"
              placeholder="Your Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <button type="submit" disabled={loading || cartItems.length === 0}>
              {loading ? "Processing..." : "Place Order"}
            </button>
          </form>
        </>
      )}
    </div>
  );
}
