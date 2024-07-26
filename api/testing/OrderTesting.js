import { shopifyMonieClients } from "../../shopifyClients.js";
import { sendCustomPostRequest } from "../Utils.js";
import fs from "fs";

export const createOrder = async () => {
  const response = await shopifyMonieClients["devstore"].order.create({
    line_items: [
      {
        title: "Big Brown Bear Boots",
        price: 74.99,
        grams: "1300",
        quantity: 3,
        tax_lines: [
          {
            price: 13.5,
            rate: 0.06,
            title: "State tax",
          },
        ],
      },
    ],
    transactions: [
      {
        kind: "sale",
        status: "success",
        amount: 238.47,
      },
    ],
    total_tax: 13.5,
    currency: "EUR",
  });
  console.log(response);
};

// Function to create an order with pickup as delivery
export const createPickupOrder = async () => {
  const response = await shopifyMonieClients["devstore"].order.create({
    line_items: [
      {
        title: "Big Brown Bear Boots",
        price: 74.99,
        grams: 1300,
        quantity: 3,
        tax_lines: [
          {
            price: 13.5,
            rate: 0.06,
            title: "State tax",
          },
        ],
      },
    ],
    transactions: [
      {
        kind: "sale",
        status: "success",
        amount: 238.47,
      },
    ],
    total_tax: 13.5,
    currency: "EUR",
    fulfillment_service: "manual",
    location_id: "76418318548", // replace with your actual pickup location ID
    delivery_method: {
      method: "pickup",
      pickup_location: {
        id: "76418318548", // replace with your actual pickup location ID
        address1: "123 Pickup St",
        city: "Pickup City",
        province: "Pickup Province",
        country: "Pickup Country",
        zip: "12345",
      },
    },
  });
};

// createPickupOrder();

// const shopify = shopifyMonieClients["downtown"];

// const response = await shopify.order.list({
// limit: 1,
// status: "any",
// });

// Function to get complete order detail by order id
export const getOrderById = async (orderId) => {
  const response = await shopify.order.get(orderId);

  // save this response into a json file
  fs.writeFileSync("orderAdvanced.json", JSON.stringify(response, null, 2));
  console.log(response);
};

// getOrderById(5607333593280);

// console.log(response[0])

export const markOrderAsReadyForPickup = async (store, orderId) => {
  const fulfillment_orders = await getFullfillmentOrders(store, orderId);

  const line_items_by_fulfillment_order = fulfillment_orders.map(
    (fulfillment_order) => {
      return {
        fulfillmentOrderId: `gid://shopify/FulfillmentOrder/${fulfillment_order.id}`,
      };
    }
  );

  const readyForPickupRequest = {
    query:
      "mutation fulfillmentOrderLineItemsPreparedForPickup($input: FulfillmentOrderLineItemsPreparedForPickupInput!) { fulfillmentOrderLineItemsPreparedForPickup(input: $input) { userErrors { field message } } }",
    variables: {
      input: {
        lineItemsByFulfillmentOrder: line_items_by_fulfillment_order,
      },
    },
  };

  const fulfillment = await sendCustomPostRequest(
    store,
    `admin/api/2024-07/graphql.json`,
    readyForPickupRequest
  );

  console.log(fulfillment);
  return fulfillment;
};

export const getOrdersGQL = async (store, num, prevCursor) => {
  // "id",
  // "name",
  // "created_at",
  // "customer",
  // "total_price",
  // "fulfillment_status",
  // "financial_status",
  // "cancelled_at",

  const orderRequest = {
    query: `{
  orders(first: ${num}, reverse: true ${
      prevCursor ? `, after: "${prevCursor}"` : ""
    }) {
    nodes {
      id
      legacyResourceId
      name
      createdAt
      customer {
        displayName
      }
      totalPrice
      cancelledAt
      displayFinancialStatus
      displayFulfillmentStatus
      
     
    }
    pageInfo {
      hasNextPage
      endCursor
    }
  }
}`,
  };

  const response = await sendCustomPostRequest(
    "downtown",
    "admin/api/2024-07/graphql.json",
    orderRequest
  );
  console.log(response.data.orders);
};

getOrdersGQL(
  "downtown",
  2,
  "eyJsYXN0X2lkIjo1NjEwOTIyNTQxMjQ4LCJsYXN0X3ZhbHVlIjoiMjAyNC0wNy0yMyAxNTozODo0NC42Njg5MDAifQ=="
);
