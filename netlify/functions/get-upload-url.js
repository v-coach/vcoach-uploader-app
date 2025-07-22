const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");

const s3Client = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }
  
  try {
    const { fileName, contentType } = JSON.parse(event.body);
    // Sanitize file name to remove special characters for safety
    const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9._-]/g, ''); 

    const command = new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: `${Date.now()}-${sanitizedFileName}`, // Add timestamp to prevent overwrites
      ContentType: contentType,
    });

    // Generate a secure, temporary URL for the client to upload the file to
    const uploadURL = await getSignedUrl(s3Client, command, { expiresIn: 3600 }); // URL is valid for 1 hour

    return {
      statusCode: 200,
      body: JSON.stringify({ uploadURL }),
    };
  } catch (error) {
    console.error("Error generating pre-signed URL:", error);
    return { statusCode: 500, body: "Internal Server Error" };
  }
};
