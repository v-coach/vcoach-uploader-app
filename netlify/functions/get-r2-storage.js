// --- Netlify Serverless Function: get-r2-storage.js ---
// This file should be placed in your project's `netlify/functions` directory.

// The 'node-fetch' library is often needed in Node.js environments to use fetch.
// You will need to create a package.json file to list this as a dependency.
const fetch = require('node-fetch');

exports.handler = async (event, context) => {
  // Environment variables should be set in your Netlify project settings
  // for security, rather than hardcoding them here.
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const r2BucketName = process.env.CLOUDFLARE_R2_BUCKET_NAME;
  const apiToken = process.env.CLOUDFLARE_API_TOKEN;

  // Basic validation to ensure environment variables are set
  if (!accountId || !r2BucketName || !apiToken) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Cloudflare API credentials are not configured in the Netlify environment variables." }),
    };
  }

  // Cloudflare API endpoint for R2 Storage Analytics
  // Note: The actual API for bucket stats might differ. This is a common pattern.
  // You may need to consult the latest Cloudflare API documentation for the exact endpoint.
  const apiUrl = `https://api.cloudflare.com/client/v4/accounts/${accountId}/r2/buckets/${r2BucketName}/stats`;

  try {
    // Making the authenticated request to the Cloudflare API
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiToken}`,
        'Content-Type': 'application/json',
      },
    });

    // If the request was not successful, return an error
    if (!response.ok) {
      const errorData = await response.json();
      console.error("Cloudflare API Error:", errorData);
      return {
        statusCode: response.status,
        body: JSON.stringify({ error: 'Failed to fetch data from Cloudflare API.', details: errorData }),
      };
    }

    // Parse the JSON response from the API
    const data = await response.json();

    // The API returns detailed stats. We can simplify it for our frontend.
    // The response structure may vary; you should log the 'data' object
    // to see what you receive and adjust accordingly. This structure is a plausible example.
    const storageData = {
      totalStorageBytes: data.result.overview.storage.current,
    };

    // Return a successful response with the storage data
    return {
      statusCode: 200,
      body: JSON.stringify(storageData),
    };

  } catch (error) {
    console.error("Function Error:", error);
    // Handle any network or other errors
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
