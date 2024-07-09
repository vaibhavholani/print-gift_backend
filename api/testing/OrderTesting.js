import { shopifyMonieClients } from '../../shopifyClients.js'

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
        },
      );
    console.log(response);
}

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
      location_id: "76418318548",  // replace with your actual pickup location ID
      delivery_method: {
        method: "pickup",
        pickup_location: {
          id: "76418318548",  // replace with your actual pickup location ID
          address1: "123 Pickup St",
          city: "Pickup City",
          province: "Pickup Province",
          country: "Pickup Country",
          zip: "12345"
        }
      }
    });
  }
  

// createPickupOrder();

const shopify = shopifyMonieClients["downtown"];

const response = await shopify.order.list({
limit: 1,
status: "any",
});

console.log(response[0])

