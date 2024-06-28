import express from "express";
const app = express();
app.use(express.json())



app.get("/", (req, res) => res.send("Express on Vercel"));

// Add a POST route at /webhook/orders/create
// This route will be used to receive the order data from Shopify
app.post("/webhooks/orders/create", (req, res) => {

//   console.log(req)
  console.log(req.body);
  res.send("Order received");
});

app.post("/webhooks/draftOrders/create", (req, res) => {

//   console.log(req)
  console.log(req.body);
  res.send("Order received");
});



app.listen(3000, () => console.log("Server ready on port 3000."));
