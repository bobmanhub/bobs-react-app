import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

const API_BASE = process.env.API_BASE || "http://localhost:5000";

async function fetchAPI(endpoint, method = "GET", body = null) {
  const options = {
    method,
    headers: { "Content-Type": "application/json" },
  };
  if (body) {
    options.body = JSON.stringify(body);
  }
  const response = await fetch(`${API_BASE}${endpoint}`, options);
  return response.json();
}

const server = new Server(
  { name: "pizza-api-server", version: "1.0.0" },
  { capabilities: { tools: {} } }
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: "get_menu",
      description: "Get the pizza menu with available pizzas",
      inputSchema: {
        type: "object",
        properties: {},
      },
    },
    {
      name: "get_orders",
      description: "Get all orders",
      inputSchema: {
        type: "object",
        properties: {},
      },
    },
    {
      name: "create_order",
      description: "Create a new pizza order",
      inputSchema: {
        type: "object",
        properties: {
          items: {
            type: "array",
            description: "Array of items with pizzaId, size, and quantity",
            items: {
              type: "object",
              properties: {
                pizzaId: { type: "string" },
                size: { type: "string", enum: ["small", "medium", "large"] },
                quantity: { type: "number" },
              },
              required: ["pizzaId", "size", "quantity"],
            },
          },
          customerName: { type: "string" },
          customerEmail: { type: "string" },
        },
        required: ["items", "customerName", "customerEmail"],
      },
    },
    {
      name: "delete_order",
      description: "Delete an order by ID",
      inputSchema: {
        type: "object",
        properties: {
          orderId: { type: "string", description: "The order ID to delete" },
        },
        required: ["orderId"],
      },
    },
  ],
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case "get_menu": {
        const menu = await fetchAPI("/api/menu");
        return { content: [{ type: "text", text: JSON.stringify(menu, null, 2) }] };
      }
      case "get_orders": {
        const orders = await fetchAPI("/api/orders");
        return { content: [{ type: "text", text: JSON.stringify(orders, null, 2) }] };
      }
      case "create_order": {
        const order = await fetchAPI("/api/orders", "POST", args);
        return { content: [{ type: "text", text: JSON.stringify(order, null, 2) }] };
      }
      case "delete_order": {
        const result = await fetchAPI(`/api/orders/${args.orderId}`, "DELETE");
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      }
      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    return {
      content: [{ type: "text", text: `Error: ${error.message}` }],
      isError: true,
    };
  }
});

const transport = new StdioServerTransport();
await server.connect(transport);
