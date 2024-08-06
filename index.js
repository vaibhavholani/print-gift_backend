import express from "express";
import cors from "cors";
import {
  getOrders,
  cancelOrder,
  getOrderById,
  getUpdatedOrders,
} from "./api/Order.js";
import {
  getProductImage
} from "./api/Product.js"
import { fulfillOrder, markOrderAsReadyForPickup } from "./api/Fulfilment.js";

const app = express();
app.use(express.json());
app.use(cors());

app.get("/", (req, res) => res.send("Express on Vercel"));

// Add a POST route at /webhook/orders/create
// This route will be used to receive the order data from Shopify
app.post("/webhooks/orders/create", (req, res) => {
  console.log(req.body);
  res.send("Order received");
});

app.post("/webhooks/draftOrders/create", (req, res) => {
  console.log(req.body);
  res.send("Order received");
});

app.get("/api/orders", async (req, res) => {
  const { store, num, cursor } = req.query;
  if (!store) {
    return res.status(400).send("Store parameter is required");
  }

  try {
    const orders = await getOrders(store, num, cursor);
    res.json(orders);
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.json([]);
  }
});

app.get("/api/order/:orderId", async (req, res) => {
  const { orderId } = req.params;
  const { store } = req.query;

  try {
    const order = await getOrderById(store, orderId);
    res.json(order);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

app.get("/api/order-updates", async (req, res) => {
  const { store } = req.query;
  if (!store) {
    return res.status(400).send("Store and orderId parameters are required");
  }
  try {
    const orders = await getUpdatedOrders(store);
    res.json(orders);
  } catch (error) {
    console.error("Error fetching updated orders:", error);
    res.json([]);
  }
});

app.post("/api/cancel-order", async (req, res) => {
  const { store, orderId } = req.body;
  if (!store || !orderId) {
    return res.status(400).send("Store and orderId parameters are required");
  }
  try {
    const result = await cancelOrder(store, orderId);
    res.json(result);
  } catch (error) {
    console.error("Error canceling order:", error);
    res.status(500).send("Error canceling order");
  }
});

app.post("/api/fulfill-order", async (req, res) => {
  const { store, orderId } = req.body;
  if (!store || !orderId) {
    return res.status(400).send("Store and orderId parameters are required");
  }

  try {
    const result = await fulfillOrder(store, orderId);
    res.json(result);
  } catch (error) {
    console.error("Error fulfilling order:", error);
    res.status(500).send("Error fulfilling order");
  }
});

app.post("/api/ready-for-pickup", async (req, res) => {
  const { store, orderId } = req.body;
  if (!store || !orderId) {
    return res.status(400).send("Store and orderId parameters are required");
  }

  try {
    const result = await markOrderAsReadyForPickup(store, orderId);
    res.json(result);
  } catch (error) {
    console.error("Error marking order as ready for pickup:", error);
    res.status(500).send("Error marking order as ready for pickup");
  }
});


app.get("/api/product-image", async (req, res) => {
  const { store, productId } = req.query;

  try {
    const productImage = await getProductImage(store, productId);
    res.json(productImage);
  } catch (error) {
    res.status(500).send(error.message);
  }
});



app.listen(3000, () => console.log("Server ready on port 3000."));
