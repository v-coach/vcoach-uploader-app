// --- Netlify Serverless Function: list-files.js ---
// This file should be placed in your project's `netlify/functions` directory.

const AWS = require('aws-sdk');

exports.handler = async (event, context) => {
  const {
    CLOUDFLARE_R2_BUCKET_NAME,
    CLOUDFLARE_R2_ENDPOINT,
    CLOUDFLARE_R2_ACCESS_KEY_ID,
    CLOUDFLARE_R2_SECRET_ACCESS
  } = process.env;

  if (!CLOUDFLARE_R2_BUCKET_NAME || !CLOUDFLARE_R2_ENDPOINT || !CLOUDFLARE_R2_ACCESS_KEY_ID || !CLOUDFLARE_R2_SECRET_ACCESS) {
    const errorMessage = "R2 connection details are not fully configured for listing files.";
    console.error(errorMessage);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: errorMessage }),
    };
  }

  const s3 = new AWS.S3({
    endpoint: CLOUDFLARE_R2_ENDPOINT,
    accessKeyId: CLOUDFLARE_R2_ACCESS_KEY_ID,
    secretAccessKey: CLOUDFLARE_R2_SECRET_ACCESS,
    signatureVersion: 'v4',
    region: 'auto',
  });

  try {
    const params = {
      Bucket: CLOUDFLARE_R2_BUCKET_NAME,
    };

    const data = await s3.listObjectsV2(params).promise();

    // Map the response to a simpler format for the frontend
    const files = data.Contents.map(file => ({
      name: file.Key,
      date: file.LastModified.toISOString().split('T')[0],
      // We will generate download/view URLs on the fly on the frontend
    }));

    return {
      statusCode: 200,
      body: JSON.stringify({ files }),
    };

  } catch (error) {
    console.error("Error listing files from R2:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
