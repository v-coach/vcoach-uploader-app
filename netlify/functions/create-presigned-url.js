// --- Netlify Serverless Function: create-presigned-url.js ---
// This file should be placed in your project's `netlify/functions` directory.

// The AWS SDK is required to interact with R2's S3-compatible API
const AWS = require('aws-sdk');

exports.handler = async (event, context) => {
  // Check for environment variables needed to connect to R2
  const {
    CLOUDFLARE_R2_BUCKET_NAME,
    CLOUDFLARE_R2_ENDPOINT,
    CLOUDFLARE_R2_ACCESS_KEY_ID,
    CLOUDFLARE_R2_SECRET_ACCESS_KEY
  } = process.env;

  if (!CLOUDFLARE_R2_BUCKET_NAME || !CLOUDFLARE_R2_ENDPOINT || !CLOUDFLARE_R2_ACCESS_KEY_ID || !CLOUDFLARE_R2_SECRET_ACCESS_KEY) {
    const errorMessage = "R2 connection details are not configured in Netlify environment variables.";
    console.error(errorMessage);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: errorMessage }),
    };
  }

  // Configure the AWS SDK to connect to your Cloudflare R2 bucket
  const s3 = new AWS.S3({
    endpoint: CLOUDFLARE_R2_ENDPOINT,
    accessKeyId: CLOUDFLARE_R2_ACCESS_KEY_ID,
    secretAccessKey: CLOUDFLARE_R2_SECRET_ACCESS_KEY,
    signatureVersion: 'v4',
    region: 'auto', // This is a specific requirement for Cloudflare R2
  });

  try {
    const { fileName, fileType } = JSON.parse(event.body);

    // Define the parameters for the presigned URL
    const params = {
      Bucket: CLOUDFLARE_R2_BUCKET_NAME,
      Key: fileName, // The name the file will have in the bucket
      ContentType: fileType, // The type of file being uploaded
      Expires: 600, // The URL will be valid for 10 minutes (600 seconds)
    };

    // Generate the presigned URL for a PUT request
    const uploadUrl = await s3.getSignedUrlPromise('putObject', params);

    // Return the URL to the frontend
    return {
      statusCode: 200,
      body: JSON.stringify({ uploadUrl }),
    };

  } catch (error) {
    console.error("Error creating presigned URL:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
