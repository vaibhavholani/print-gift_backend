import {
  shopifyMonieClients,
  shopifyOfficialClients,
} from "../shopifyClients.js";
import { sendCustomPostRequest } from "./Utils.js";

export const getFullfillmentOrders = async (store, orderId) => {
  // List fulfillment orders
  const shopifyOfficialClient = shopifyOfficialClients[store.toLowerCase()];
  const response = await shopifyOfficialClient.get(
    `orders/${orderId}/fulfillment_orders.json`
  );
  const fulfillment_orders = (await response.json()).fulfillment_orders;

  // Filter out fulfillment orders that are not closed or fulfilled
  
  const filtered_fulfillment_orders = fulfillment_orders?.filter(
    (fulfillment_order) =>
      fulfillment_order.status !== "closed" &&
      fulfillment_order.status !== "fulfilled"
  );

  return filtered_fulfillment_orders;
};

export const addFulfillmentOrders = async (store, order) => {
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
}

export async function fulfillOrder(store, orderId, notifyCustomer = false) {
  const fulfillment_orders = await getFullfillmentOrders(store, orderId);

  const line_items_by_fulfillment_order = fulfillment_orders.map(
    (fulfillment_order) => {
      return {
        fulfillment_order_id: fulfillment_order.id,
      };
    }
  );

  const fulfillmentObject = {
    fulfillment: {
      line_items_by_fulfillment_order: line_items_by_fulfillment_order,
      tracking_info: {
        number: "MS1562678",
        url: "https://www.my-shipping-company.com?tracking_number=MS1562678",
      },
      notify_customer: notifyCustomer,
    },
  };

  const fulfillment = await sendCustomPostRequest(
    store,
    `/admin/api/2024-04/fulfillments.json`,
    fulfillmentObject
  );

  return fulfillment;
}

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

// fulfillOrder("downtown", 5593742508224, false);
// markOrderAsReadyForPickup("downtown", 5593742508224);
// console.log(await getFullfillmentOrders("downtown", 5593742508224))
