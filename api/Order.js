import Shopify from 'shopify-api-node';
import 'dotenv/config'

// Define Shopify API clients for each store
const shopifyClients = {
  downtown: new Shopify({
    shopName: 'printkia.myshopify.com',
    accessToken: process.env.DOWNTOWN_ACCESS_TOKEN
  }),
  kitchener: new Shopify({
    shopName: 'kitchener-printkia.myshopify.com',
    accessToken: process.env.OMAZZI_ACCESS_TOKEN
  })
};

export const getOrder = async (store) => {
  const shopify = shopifyClients[store.toLowerCase()];
  if (!shopify) {
    throw new Error(`No Shopify client configured for store: ${store}`);
  }

  const response = await shopify.order.list({
    limit: 5,
    fields: ['id', 'name', 'created_at', 'customer', 'total_price', 'fulfillment_status', 'financial_status', 'cancelled_at'],
    status: 'any'
  });

  return response;
}

export const cancelOrder = async (store, orderId) => {
  const shopify = shopifyClients[store.toLowerCase()];
  if (!shopify) {
    throw new Error(`No Shopify client configured for store: ${store}`);
  }

  const response = await shopify.order.cancel(orderId);

  return response;
}

export const refundOrder = async (store, orderId) => {
  const shopify = shopifyClients[store.toLowerCase()];
  if (!shopify) {
    throw new Error(`No Shopify client configured for store: ${store}`);
  }

  try {
    // Fetch the order to get the line items and transactions
    const order = await shopify.order.get(orderId);

    if (!order || !order.line_items.length) {
      throw new Error(`No line items found for order: ${orderId}`);
    }

    const transactions = await shopify.transaction.list(orderId);

    if (!transactions.length) {
      throw new Error(`No transactions found for order: ${orderId}`);
    }

    // Map line items to include refund details
    const refundLineItems = order.line_items.map(item => ({
      line_item_id: item.id,
      quantity: item.quantity, // Adjust quantity as needed
    }));

    // Calculate the total refund amount
    const refundAmount = transactions[0].amount;

    const refund = await shopify.refund.create(orderId, {
      refund_line_items: refundLineItems,
      transactions: [
        {
          kind: 'refund',
          amount: refundAmount,
          gateway: transactions[0].gateway
        }
      ],
      shipping: {
        amount: '0.00' // Add actual shipping amount if applicable
      },
      restock: true,
      notify: true,
      note: 'Refund processed via API'
    });

    return refund;
  } catch (error) {
    console.error('Error creating refund:', error);
    throw error;
  }
};

export const fulfillOrder = async (store, orderId) => {
  const shopify = shopifyClients[store.toLowerCase()];
  if (!shopify) {
    throw new Error(`No Shopify client configured for store: ${store}`);
  }

  // Fetch the fulfillment service for the order's line items
  const order = await shopify.order.get(orderId);
  if (!order || !order.line_items.length) {
    throw new Error(`No line items found for order: ${orderId}`);
  }

  const fulfillment = await shopify.fulfillment.create(orderId, {
    line_items: order.line_items.map(item => ({
      id: item.id,
      quantity: item.quantity
    })),
    tracking_number: '123456789',
    tracking_company: 'USPS'
  });

  return fulfillment;
}


// cancelOrder("Kitchener", 5559875731619)
// refundOrder("Kitchener", 5559902240931)
// fulfillOrder("Kitchener", 5559902240931)
