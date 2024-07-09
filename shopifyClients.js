import Shopify from 'shopify-api-node';
import {createAdminRestApiClient} from '@shopify/admin-api-client';
import 'dotenv/config'

// Define Shopify API clients for each store
export const shopifyMonieClients = {
    downtown: new Shopify({
      shopName: 'printkia.myshopify.com',
      accessToken: process.env.DOWNTOWN_ACCESS_TOKEN
    }),
    kitchener: new Shopify({
      shopName: 'kitchener-printkia.myshopify.com',
      accessToken: process.env.OMAZZI_ACCESS_TOKEN
    }), 
    devstore: new Shopify({
      shopName: 'quickstart-f275e006.myshopify.com',
      accessToken: process.env.DEVSTORE_ACCESS_TOKEN
  }) 
};

// Define Shopify API clients for each store
export const shopifyOfficialClients = {
    downtown: createAdminRestApiClient({
        storeDomain: 'printkia.myshopify.com',
        apiVersion: '2024-04',
        accessToken: process.env.DOWNTOWN_ACCESS_TOKEN
    }),
    kitchener: createAdminRestApiClient({
        storeDomain: 'kitchener-printkia.myshopify.com',
        apiVersion: '2024-04',
        accessToken: process.env.OMAZZI_ACCESS_TOKEN
    }),
    devstore: createAdminRestApiClient({
        storeDomain: 'quickstart-f275e006.myshopify.com',
        apiVersion: '2024-04',
        accessToken: process.env.DEVSTORE_ACCESS_TOKEN
    })
};


// Define axios request config for each store
export const axiosClients = {
    downtown: {
        base_url: 'https://printkia.myshopify.com',
        headers: { 
            'X-Shopify-Access-Token': process.env.DOWNTOWN_ACCESS_TOKEN, 
            'Content-Type': 'application/json'
        }
    },
    kitchener: {
        base_url: 'https://kitchener-printkia.myshopify.com',
        headers: { 
            'X-Shopify-Access-Token': process.env.OMAZZI_ACCESS_TOKEN, 
            'Content-Type': 'application/json'
        }
    },
    devstore: {
        base_url: 'https://quickstart-f275e006.myshopify.com',
        headers: { 
            'X-Shopify-Access-Token': process.env.DEVSTORE_ACCESS_TOKEN, 
            'Content-Type': 'application/json'
        }
    }
};