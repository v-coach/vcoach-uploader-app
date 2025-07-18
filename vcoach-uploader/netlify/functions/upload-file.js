// netlify/functions/upload-file.js
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');

exports.handler = async (event, context) => {
  // Ensure the request is a POST request
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  // Parse the incoming request body
  let body;
  try {
    body = JSON.parse(event.body);
  } catch (error) {
    console.error('Failed to parse request body:', error);
    return { statusCode: 400, body: 'Invalid JSON body' };
  }

  const { fileName, fileType, fileContent } = body;

  // Validate required fields
  if (!fileName || !fileType || !fileContent) {
    return { statusCode: 400, body: 'Missing fileName, fileType, or fileContent' };
  }

  // Retrieve R2 configuration from Netlify Environment Variables
  const accountId = process.env.CLOUDFLARE_R2_ACCOUNT_ID;
  const accessKeyId = process.env.CLOUDFLARE_R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY;
  const bucketName = process.env.CLOUDFLARE_R2_BUCKET_NAME;

  // Check if all necessary environment variables are set
  if (!accountId || !accessKeyId || !secretAccessKey || !bucketName) {
    console.error('Missing Cloudflare R2 environment variables.');
    return { statusCode: 500, body: 'Server configuration error: R2 credentials missing.' };
  }

  // Initialize S3 client for R2
  const S3 = new S3Client({
    region: 'auto', // Cloudflare R2 uses 'auto' for region
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`, // R2 endpoint format
    credentials: {
      accessKeyId: accessKeyId,
      secretAccessKey: secretAccessKey,
    },
  });

  try {
    // Create a PutObjectCommand to upload the file
    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: fileName, // The desired name of the file in your R2 bucket
      Body: Buffer.from(fileContent, 'base64'), // Convert base64 string back to a Buffer
      ContentType: fileType, // Set the correct MIME type for the file
    });

    // Send the command to S3 (R2)
    await S3.send(command);

    // Return a success response
    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'File uploaded successfully!', fileName: fileName }),
    };
  } catch (error) {
    // Log and return an error response if upload fails
    console.error('Error uploading file to R2:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'File upload failed', error: error.message }),
    };
  }
};
