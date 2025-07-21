// --- Netlify Serverless Function: create-presigned-url.js ---
// This file should be placed in your project's `netlify/functions` directory.

const AWS = require('aws-sdk');

exports.handler = async (event, context) => {
  // Using standardized environment variable names
  const {
    CLOUDFLARE_R2_BUCKET_NAME,
    CLOUDFLARE_R2_ENDPOINT,
    CLOUDFLARE_R2_ACCESS_KEY_ID,
    CLOUDFLARE_R2_SECRET_ACCESS_KEY // Using standard name
  } = process.env;

  if (!CLOUDFLARE_R2_BUCKET_NAME || !CLOUDFLARE_R2_ENDPOINT || !CLOUDFLARE_R2_ACCESS_KEY_ID || !CLOUDFLARE_R2_SECRET_ACCESS_KEY) {
    const errorMessage = "R2 connection details are not fully configured.";
    console.error(errorMessage);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: errorMessage }),
    };
  }

  const s3 = new AWS.S3({
    endpoint: CLOUDFLARE_R2_ENDPOINT,
    accessKeyId: CLOUDFLARE_R2_ACCESS_KEY_ID,
    secretAccessKey: CLOUDFLARE_R2_SECRET_ACCESS_KEY, // Using standard name
    signatureVersion: 'v4',
    region: 'auto',
  });

  try {
    const { fileName, fileType } = JSON.parse(event.body);
    const params = {
      Bucket: CLOUDFLARE_R2_BUCKET_NAME,
      Key: fileName,
      ContentType: fileType,
      Expires: 600, // 10 minutes
    };
    const uploadUrl = await s3.getSignedUrlPromise('putObject', params);
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
