// --- Netlify Serverless Function: get-r2-storage.js ---
// This file should be placed in your project's `netlify/functions` directory.

const fetch = require('node-fetch');

exports.handler = async (event, context) => {
  // Using the specific environment variable for reading stats
  const { CLOUDFLARE_ACCOUNT_ID, CLOUDFLARE_R2_BUCKET_NAME, CLOUDFLARE_API_TOKEN_READ } = process.env;

  if (!CLOUDFLARE_ACCOUNT_ID || !CLOUDFLARE_R2_BUCKET_NAME || !CLOUDFLARE_API_TOKEN_READ) {
    const errorMessage = "Cloudflare API credentials for reading stats are not configured correctly.";
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
    const storageBytes = data?.result?.overview?.storage?.current;

    if (storageBytes === undefined) {
        const structureError = "Could not find 'totalStorageBytes' in the API response.";
        console.error(structureError, "Received data:", data);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: structureError })
        }
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ totalStorageBytes: storageBytes }),
    };

  } catch (error) {
    console.error("Function execution error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
