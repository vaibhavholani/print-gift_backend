import {
  shopifyMonieClients,
  shopifyOfficialClients,
} from "../shopifyClients.js";
import { sendCustomPostRequest } from "./Utils.js";
import { getFullfillmentOrders } from "./Fulfilment.js";

export const getOrders = async (store, num, prevCursor) => {
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
    }
    pageInfo {
      hasNextPage
      endCursor
    }
  }
}`,
  };

  const response = await sendCustomPostRequest(
    store,
    "admin/api/2024-07/graphql.json",
    orderRequest
  );

  let orders = response.data.orders;


  // set the fulfillment status of the order
  orders.nodes = orders.nodes.map(async (order) => {

    order.id = order.legacyResourceId;
    const orderId = order.id;
    const fulfillmentOrders = await getFullfillmentOrders(store, orderId);

    let status = "fulfilled";
    let inProgress = false;
    let open = false;
    fulfillmentOrders?.forEach((fulfillmentOrder) => {
      if (fulfillmentOrder.status === "open") {
        open = true;
      } else if (fulfillmentOrder.status === "in_progress") {
        inProgress = true;
      }
    });
    if (open) {
      status = "unfulfilled";
    } else if (inProgress) {
      status = "in_progress";
    }
    order.displayFulfillmentStatus = status;
    return order;
  });


  orders.nodes = await Promise.all(orders.nodes);
  return orders;
};

export const getOrderById = async (store, orderId) => {
  const shopify = shopifyMonieClients[store.toLowerCase()];
  if (!shopify) {
    throw new Error(`No Shopify client configured for store: ${store}`);
  }

  const response = await shopify.order.get(orderId);
  const fulfillmentOrders = await getFullfillmentOrders(store, orderId);
  response.fulfillment_orders = fulfillmentOrders;

  // set the fulfillment status of the order
  let status = "fulfilled";
  let inProgress = false;
  let open = false;
  fulfillmentOrders.forEach((fulfillmentOrder) => {
    if (fulfillmentOrder.status === "open") {
      open = true;
    } else if (fulfillmentOrder.status === "in_progress") {
      inProgress = true;
    }
  });
  if (open) {
    status = "unfulfilled";
  } else if (inProgress) {
    status = "in_progress";
  }
  response.fulfillment_status = status;

  // save this response into a json file
  return response;
};

export const cancelOrder = async (store, orderId) => {
  const shopify = shopifyMonieClients[store.toLowerCase()];
  if (!shopify) {
    throw new Error(`No Shopify client configured for store: ${store}`);
  }

  const response = await shopify.order.cancel(orderId);

  return response;
};

// export const refundOrder = async (store, orderId) => {
//   const shopify = shopifyMonieClients[store.toLowerCase()];
//   if (!shopify) {
//     throw new Error(`No Shopify client configured for store: ${store}`);
//   }

//   try {
//     // Fetch the order to get the line items and transactions
//     const order = await shopify.order.get(orderId);

//     if (!order || !order.line_items.length) {
//       throw new Error(`No line items found for order: ${orderId}`);
//     }

//     const transactions = await shopify.transaction.list(orderId);

//     if (!transactions.length) {
//       throw new Error(`No transactions found for order: ${orderId}`);
//     }

//     // Map line items to include refund details
//     const refundLineItems = order.line_items.map((item) => ({
//       line_item_id: item.id,
//       quantity: item.quantity, // Adjust quantity as needed
//     }));

//     // Calculate the total refund amount
//     const refundAmount = transactions[0].amount;

//     const refund = await shopify.refund.create(orderId, {
//       refund_line_items: refundLineItems,
//       transactions: [
//         {
//           kind: "refund",
//           amount: refundAmount,
//           gateway: transactions[0].gateway,
//         },
//       ],
//       shipping: {
//         amount: "0.00", // Add actual shipping amount if applicable
//       },
//       restock: true,
//       notify: true,
//       note: "Refund processed via API",
//     });

//     return refund;
//   } catch (error) {
//     console.error("Error creating refund:", error);
//     throw error;
//   }
// };

// console.log(await getOrder("downtown"))

// await print all orders
// const orders = await getOrders("downtown", 2);

// orders.nodes.forEach(async (order) => {
//   console.log(order);
// });

// console.log(orders.pageInfo)