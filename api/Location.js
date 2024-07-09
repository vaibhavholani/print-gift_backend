import { shopifyMonieClients } from '../shopifyClients.js'

export const listLocations = async () => {
    const response = await shopifyMonieClients["devstore"].location.list();
    console.log(response);
}

listLocations();
