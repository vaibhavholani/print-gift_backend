import axios from 'axios';
import { axiosClients } from '../shopifyClients.js';

// Helper function to send a axios post Request to Shopify
export const sendCustomPostRequest = async (store, endpoint, data) => {

    const client = axios.create({
        baseURL: axiosClients[store.toLowerCase()].base_url,
        headers: axiosClients[store.toLowerCase()].headers
    });

    // Ensure data is stringified
    data = JSON.stringify(data);

    try {
        const response = await client.post(endpoint, data);
        return response.data;
    } catch (error) {
        console.error('Error sending post request:', error);
        throw error;
    }
}