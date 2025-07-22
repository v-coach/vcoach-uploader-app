const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }
  
  // --- Step 1: Log the environment variables to check for typos ---
  console.log("--- VERIFYING ENVIRONMENT VARIABLES ---");
  console.log("CLOUDFLARE_ACCOUNT_ID:", process.env.CLOUDFLARE_ACCOUNT_ID ? "Loaded" : "MISSING!");
  console.log("R2_BUCKET_NAME:", process.env.R2_BUCKET_NAME ? "Loaded" : "MISSING!");
  console.log("R2_ACCESS_KEY_ID:", process.env.R2_ACCESS_KEY_ID ? "Loaded" : "MISSING!");
  console.log("R2_SECRET_ACCESS_KEY:", process.env.R2_SECRET_ACCESS_KEY ? "Loaded (hidden for security)" : "MISSING!");
  console.log("------------------------------------");

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
    const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9._-]/g, ''); 

    const command = new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: `${Date.now()}-${sanitizedFileName}`,
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
      body: JSON.stringify({ error: "Internal Server Error" }) 
    };
  }
};
