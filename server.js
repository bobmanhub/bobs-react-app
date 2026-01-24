import http from "http";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// In-memory order storage
let orders = [];

// Helper functions
function generateId() {
  return Math.random().toString(36).substr(2, 9);
}

function loadMenu() {
  try {
    const menuPath = path.join(__dirname, "menu.json");
    const data = fs.readFileSync(menuPath, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    console.error("Error loading menu:", error);
    return { pizzas: [] };
  }
}

function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk.toString();
    });
    req.on("end", () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (error) {
        reject(error);
      }
    });
  });
}

function setHeaders(res, statusCode = 200) {
  res.writeHead(statusCode, {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  });
}

// BMAD Method - Pizza Ordering API
const server = http.createServer(async (req, res) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    setHeaders(res);
    res.end();
    return;
  }

  // Root endpoint
  if (req.url === "/" && req.method === "GET") {
    setHeaders(res);
    res.write(
      JSON.stringify({
        message: "Pizza Ordering API - BMAD Method",
        endpoints: {
          menu: "GET /api/menu",
          orders: "GET /api/orders",
          createOrder: "POST /api/orders",
          deleteOrder: "DELETE /api/orders/:id",
        },
      })
    );
    res.end();
    return;
  }

  // GET /api/menu - Retrieve pizza menu
  if (req.url === "/api/menu" && req.method === "GET") {
    setHeaders(res);
    const menu = loadMenu();
    res.write(
      JSON.stringify({
        ...menu,
        timestamp: new Date().toISOString(),
      })
    );
    res.end();
    return;
  }

  // GET /api/orders - Retrieve all orders
  if (req.url === "/api/orders" && req.method === "GET") {
    setHeaders(res);
    res.write(JSON.stringify({ orders, count: orders.length }));
    res.end();
    return;
  }

  // POST /api/orders - Create a new order
  if (req.url === "/api/orders" && req.method === "POST") {
    try {
      const body = await parseBody(req);
      const { items, customerName, customerEmail } = body;

      if (!items || !customerName || !customerEmail) {
        setHeaders(res, 400);
        res.write(
          JSON.stringify({ error: "Missing required fields: items, customerName, customerEmail" })
        );
        res.end();
        return;
      }

      // Calculate total price
      const menu = loadMenu();
      let totalPrice = 0;
      const pizzaMap = {};
      menu.pizzas.forEach((p) => {
        pizzaMap[p.id] = p;
      });

      items.forEach((item) => {
        const pizza = pizzaMap[item.pizzaId];
        if (pizza) {
          const sizeMultiplier =
            item.size === "small" ? 1 : item.size === "medium" ? 1.2 : 1.4;
          totalPrice += pizza.basePrice * sizeMultiplier * item.quantity;
        }
      });

      const newOrder = {
        id: generateId(),
        items,
        totalPrice: parseFloat(totalPrice.toFixed(2)),
        status: "pending",
        customerName,
        customerEmail,
        createdAt: new Date().toISOString(),
      };

      orders.push(newOrder);

      setHeaders(res, 201);
      res.write(JSON.stringify(newOrder));
      res.end();
      return;
    } catch (error) {
      setHeaders(res, 400);
      res.write(JSON.stringify({ error: error.message }));
      res.end();
      return;
    }
  }

  // DELETE /api/orders/:id - Delete an order
  const deleteMatch = req.url.match(/^\/api\/orders\/([a-z0-9]+)$/) && req.method === "DELETE";
  if (deleteMatch) {
    const orderId = deleteMatch[1];
    const index = orders.findIndex((o) => o.id === orderId);

    if (index === -1) {
      setHeaders(res, 404);
      res.write(JSON.stringify({ error: "Order not found" }));
      res.end();
      return;
    }

    const deletedOrder = orders.splice(index, 1);
    setHeaders(res);
    res.write(JSON.stringify({ message: "Order deleted", order: deletedOrder[0] }));
    res.end();
    return;
  }

  // 404 - Not Found
  setHeaders(res, 404);
  res.end(JSON.stringify({ message: "Endpoint not found" }));
});

const PORT = process.env.PORT;

server.listen(PORT, () => {
  console.log(`🍕 Pizza API server running on port ${PORT}`);
  console.log(`📍 http://localhost:${PORT}`);
});