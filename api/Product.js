import {
    shopifyMonieClients,
    shopifyOfficialClients,
  } from "../shopifyClients.js";
import { sendCustomPostRequest } from "./Utils.js";


export const getProductImage = async (store, productId) => {
    const imageRequest = {
        query: `{
      product(id: "gid://shopify/Product/${productId}") 
      { title description featuredImage {url} }
    }`,
      };
    
      const response = await sendCustomPostRequest(
        store,
        "admin/api/2024-07/graphql.json",
        imageRequest
      );

      return response.data.product.featuredImage
}

// console.log(await getProductImage("downtown", "6961751523520"))