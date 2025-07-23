const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const s3Client = new S3Client({
      region: "auto",
      endpoint: `https://${process.env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
      },
    });

    const { fileName, contentType } = JSON.parse(event.body);
    
    // Sanitize the original filename to remove special characters
    const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9._-]/g, '');
    
    // Use Date.now() to create a unique prefix
    const uniquePrefix = Date.now();

    // Combine the unique prefix and sanitized filename
    const finalKey = `${uniquePrefix}-${sanitizedFileName}`;

    const command = new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: finalKey,
      ContentType: contentType,
    });

    const uploadURL = await getSignedUrl(s3Client, command, { expiresIn: 3600 });

    return {
      statusCode: 200,
      body: JSON.stringify({ uploadURL }),
    };
  } catch (error) {
    console.error("--- DETAILED UPLOAD URL ERROR ---");
    console.error("Error Name:", error.name);
    console.error("Error Message:", error.message);
    
    return { 
      statusCode: 500, 
      body: JSON.stringify({ 
        error: "Internal Server Error", 
        message: "Failed to generate pre-signed URL. Check function logs for details." 
      }) 
    };
  }
};
