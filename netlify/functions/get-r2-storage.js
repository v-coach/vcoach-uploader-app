// --- Netlify Serverless Function: get-r2-storage.js ---
// This file should be placed in your project's `netlify/functions` directory.

const fetch = require('node-fetch');

exports.handler = async (event, context) => {
  // Using the new, specific environment variable for reading stats
  const { CLOUDFLARE_ACCOUNT_ID, CLOUDFLARE_R2_BUCKET_NAME, CLOUDFLARE_API_TOKEN_READ } = process.env;

  if (!CLOUDFLARE_ACCOUNT_ID || !CLOUDFLARE_R2_BUCKET_NAME || !CLOUDFLARE_API_TOKEN_READ) {
    const errorMessage = "Cloudflare API credentials for reading stats (CLOUDFLARE_API_TOKEN_READ) are not configured in the Netlify environment variables.";
    console.error(errorMessage);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: errorMessage }),
    };
  }

  const apiUrl = `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/r2/buckets/${CLOUDFLARE_R2_BUCKET_NAME}/stats`;

  try {
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        // Using the new token for authorization
        'Authorization': `Bearer ${CLOUDFLARE_API_TOKEN_READ}`,
        'Content-Type': 'application/json',
      },
    });

    const responseBody = await response.text();

    if (!response.ok) {
      console.error("Cloudflare API Error - Status:", response.status);
      console.error("Cloudflare API Error - Body:", responseBody);
      return {
        statusCode: response.status,
        body: JSON.stringify({ error: 'Failed to fetch data from Cloudflare API.', details: responseBody }),
      };
    }

    const data = JSON.parse(responseBody);
    console.log("Successfully received data from Cloudflare:", JSON.stringify(data, null, 2));

    const storageBytes = data?.result?.overview?.storage?.current;

    if (storageBytes === undefined) {
        const structureError = "Could not find 'totalStorageBytes' in the expected API response structure.";
        console.error(structureError, "Received data:", data);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: structureError })
        }
    }

    const storageData = {
      totalStorageBytes: storageBytes,
    };

    return {
      statusCode: 200,
      body: JSON.stringify(storageData),
    };

  } catch (error) {
    console.error("Function execution error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
